from __future__ import annotations

import json
import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from uuid import UUID

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field

from backend.api_server.auth_jwt import create_access_token, create_refresh_token, decode_token
from backend.api_server.auth_password import hash_password, verify_password
from backend.api_server.auth_settings import (
    COOKIE_SECURE,
    COOKIE_SAMESITE,
    CSRF_HEADER_NAME,
    CSRF_COOKIE_NAME,
    JWT_ACCESS_TTL_SECONDS,
    JWT_ISSUER,
    JWT_REFRESH_TTL_SECONDS,
    LOGIN_LOCK_SECONDS,
    LOGIN_RATE_LIMIT_ATTEMPTS,
    LOGIN_RATE_LIMIT_WINDOW_SECONDS,
    OTP_MAX_ATTEMPTS,
    OTP_RESEND_COOLDOWN_SECONDS,
    OTP_TTL_SECONDS,
    OTP_CODE_LENGTH,
    OTP_PURPOSE_EMAIL_VERIFY,
    OTP_PURPOSE_LOGIN_VERIFY,
    OTP_PURPOSE_FORGOT_PASSWORD,
    SMTP_FROM_EMAIL,
    SMTP_PASSWORD,
    SMTP_USERNAME,
    REDIS_URL,
)
from backend.api_server.csrf import ensure_csrf_token, validate_cs
from backend.api_server.db import AsyncSessionLocal
from backend.api_server.email_otp import send_otp_email
from backend.api_server.models import Otp, RefreshToken, User
from backend.api_server.redis_otp import can_resend, generate_otp_code, mark_resend_cooldown, set_otp, verify_otp
from backend.api_server.rate_limit import register_login_attempt


router = APIRouter(prefix="/auth", tags=["auth"])


# -----------------------------
# Request schemas
# -----------------------------
class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=256)
    confirm_password: str = Field(min_length=8, max_length=256)


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(pattern=r"^\d{6}$")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerifyLoginOtpRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(pattern=r"^\d{6}$")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyResetOtpRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(pattern=r"^\d{6}$")


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(pattern=r"^\d{6}$")
    new_password: str = Field(min_length=8, max_length=256)
    confirm_password: str = Field(min_length=8, max_length=256)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(min_length=2, max_length=100)
    avatar_url: Optional[str] = None


class CreateAccountOAuthResponse(BaseModel):
    ok: bool = True


# -----------------------------
# Helpers
# -----------------------------
EMAIL_LOCKED = "locked"


def _set_cookie(
    response: Any,
    key: str,
    value: str,
    max_age_seconds: int,
    http_only: bool = True,
    secure: bool = COOKIE_SECURE,
    same_site: str = COOKIE_SAMESITE,
) -> None:
    # FastAPI/Starlette: response is Response; typing as Any.
    response.set_cookie(
        key=key,
        value=value,
        max_age=max_age_seconds,
        httponly=http_only,
        secure=secure,
        samesite=same_site,
        path="/",
    )


def _clear_cookie(response: Any, key: str) -> None:
    response.delete_cookie(key, path="/", samesite=COOKIE_SAMESITE, secure=COOKIE_SECURE)


def _validate_strong_password(p: str) -> None:
    if len(p) < 8:
        raise ValueError("Password too short")
    if not re.search(r"[A-Z]", p):
        raise ValueError("Password must contain an uppercase letter")
    if not re.search(r"[a-z]", p):
        raise ValueError("Password must contain a lowercase letter")
    if not re.search(r"\d", p):
        raise ValueError("Password must contain a number")
    if not re.search(r"[^A-Za-z0-9]", p):
        raise ValueError("Password must contain a special character")


async def _get_user_by_email(email: str) -> User | None:
    async with AsyncSessionLocal() as session:
        # SQLAlchemy 2.0 style via select
        from sqlalchemy import select

        res = await session.execute(select(User).where(User.email == email.lower()))
        return res.scalar_one_or_none()


async def _get_refresh_token(token: str) -> RefreshToken | None:
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select

        res = await session.execute(select(RefreshToken).where(RefreshToken.token == token))
        return res.scalar_one_or_none()


async def _issue_tokens(response: Any, user_id: UUID, remember_device: bool) -> None:
    access_token = create_access_token(str(user_id))
    refresh_token = create_refresh_token(str(user_id))

    # Persist refresh token server-side
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=JWT_REFRESH_TTL_SECONDS if remember_device else JWT_REFRESH_TTL_SECONDS)

    async with AsyncSessionLocal() as session:
        session.add(
            RefreshToken(
                user_id=user_id,
                token=refresh_token,
                expires_at=expires_at,
            )
        )
        await session.commit()

    _set_cookie(response, "access_token", access_token, JWT_ACCESS_TTL_SECONDS)
    # 7 days always from spec; frontend remember toggle maps to whether cookie is session/long.
    refresh_max_age = JWT_REFRESH_TTL_SECONDS if remember_device else 0
    _set_cookie(response, "refresh_token", refresh_token, JWT_REFRESH_TTL_SECONDS if remember_device else 60, http_only=True)


async def _extract_access_user_id(request: Request) -> UUID | None:
    token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None
        sub = payload.get("sub")
        return UUID(sub) if sub else None
    except Exception:
        return None


# -----------------------------
# CSRF helper endpoint (frontend bootstrapping)
# -----------------------------
@router.get("/csrf")
async def csrf(request: Request) -> JSONResponse:
    # ensure csrf cookie exists and return value for x-csrf-token header usage
    from backend.api_server.csrf import ensure_csrf_token

    response = JSONResponse(status_code=200, content={"ok": True})
    token = ensure_csrf_token(request, response)
    response.body = response.body  # keep response consistent
    response.content = {"ok": True, "csrf_token": token}
    return response


# -----------------------------
# Auth endpoints
# -----------------------------
@router.post("/register")

async def register(req: RegisterRequest, request: Request) -> JSONResponse:
    # CSRF validation (cookie-based). Frontend should fetch CSRF token and echo it.
    try:
        csrf = request.headers.get(CSRF_HEADER_NAME)
        validate_cs(request)
    except Exception:
        return JSONResponse(status_code=403, content={"ok": False, "detail": "CSRF failed"})

    if req.password != req.confirm_password:
        return JSONResponse(status_code=400, content={"ok": False, "detail": "Passwords do not match"})

    try:
        _validate_strong_password(req.password)
    except ValueError as e:
        return JSONResponse(status_code=400, content={"ok": False, "detail": str(e)})

    email = req.email.lower()
    existing = await _get_user_by_email(email)
    if existing:
        return JSONResponse(status_code=409, content={"ok": False, "detail": "Email already in use"})

    user = User(
        full_name=req.full_name,
        email=email,
        hashed_password=hash_password(req.password),
        is_verified=False,
        avatar_url=None,
    )

    async with AsyncSessionLocal() as session:
        session.add(user)
        await session.commit()

    otp_code = generate_otp_code(OTP_CODE_LENGTH)
    await set_otp(email=email, purpose="verify-email", otp_code=otp_code)
    try:
        send_otp_email(email, otp_code, "verify-email")
    except Exception:
        # Rollback-ish: keep user but report failure.
        return JSONResponse(status_code=500, content={"ok": False, "detail": "Failed to send verification email"})

    return JSONResponse(status_code=200, content={"ok": True, "message": "Verify Email"})


@router.post("/verify-email")
async def verify_email(req: VerifyEmailRequest, request: Request, response: Any) -> JSONResponse:
    try:
        validate_cs(request)
    except Exception:
        return JSONResponse(status_code=403, content={"ok": False, "detail": "CSRF failed"})

    user = await _get_user_by_email(req.email.lower())
    if not user:
        return JSONResponse(status_code=404, content={"ok": False, "detail": "User not found"})

    ok, _msg = await verify_otp(email=req.email.lower(), purpose="verify-email", otp_code=req.otp_code)
    if not ok:
        return JSONResponse(status_code=400, content={"ok": False, "detail": "Invalid or expired OTP"})

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        u = (await session.execute(select(User).where(User.email == user.email))).scalar_one_or_none()
        if not u:
            return JSONResponse(status_code=404, content={"ok": False, "detail": "User not found"})
        u.is_verified = True
        await session.commit()

    return JSONResponse(status_code=200, content={"ok": True, "message": "Account Created Successfully"})


@router.post("/login")
async def login(req: LoginRequest, request: Request, response: Any) -> JSONResponse:
    # Dev debug: helps diagnose FastAPI 422 vs body shape issues.
    # (No secrets printed.)
    # NOTE: remove/disable once fixed.
    try:
        import logging
        logging.getLogger("uvicorn.error").warning(
            "[auth] login payload keys=%s email=%s password_len=%s",
            list(getattr(req, "model_dump", lambda: {})().keys()) if hasattr(req, "model_dump") else [],
            getattr(req, "email", None),
            len(getattr(req, "password", "") or ""),
        )
    except Exception:
        pass

    csrf_token = request.headers.get(CSRF_HEADER_NAME)
    # Allow login without csrf? Spec requests CSRF protection; keep validation.
    try:
        validate_cs(request)

    except Exception:
        return JSONResponse(status_code=403, content={"ok": False, "detail": "CSRF failed"})

    email = req.email.lower()
    user = await _get_user_by_email(email)
    ip = request.client.host if request.client else "unknown"

    # rate limiting + lock
    attempts, lock_ttl = await register_login_attempt(email, ip)
    if lock_ttl > 0:
        return JSONResponse(status_code=429, content={"ok": False, "detail": "Account locked temporarily"})

    if not user:
        # still consume attempt
        await register_login_attempt(email, ip)
        return JSONResponse(status_code=401, content={"ok": False, "detail": "Invalid credentials"})

    if not verify_password(req.password, user.hashed_password):
        await register_login_attempt(email, ip)
        return JSONResponse(status_code=401, content={"ok": False, "detail": "Invalid credentials"})

    if not user.is_verified:
        return JSONResponse(status_code=403, content={"ok": False, "detail": "Email verification required"})

    otp_code = generate_otp_code(OTP_CODE_LENGTH)
    await set_otp(email=email, purpose="login-verify", otp_code=otp_code)
    try:
        send_otp_email(email, otp_code, "login-verify")
    except Exception:
        return JSONResponse(status_code=500, content={"ok": False, "detail": "Failed to send OTP"})

    # IMPORTANT: Tokens should be issued only after OTP verification per spec.
    return JSONResponse(status_code=200, content={"ok": True, "message": "OTP sent"})


@router.post("/verify-login-otp")
async def verify_login_otp(req: VerifyLoginOtpRequest, request: Request, response: Any) -> JSONResponse:
    try:
        validate_cs(request)
    except Exception:
        return JSONResponse(status_code=403, content={"ok": False, "detail": "CSRF failed"})

    user = await _get_user_by_email(req.email.lower())
    if not user:
        return JSONResponse(status_code=404, content={"ok": False, "detail": "User not found"})

    ok, _msg = await verify_otp(email=req.email.lower(), purpose="login-verify", otp_code=req.otp_code)
    if not ok:
        return JSONResponse(status_code=400, content={"ok": False, "detail": "Invalid or expired OTP"})

    remember = bool(request.query_params.get("remember", "true").lower() in ("1", "true", "yes"))

    # Issue tokens now
    await _issue_tokens(response=response, user_id=user.id, remember_device=remember)

    return JSONResponse(status_code=200, content={"ok": True, "message": "Login verified"})


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, request: Request) -> JSONResponse:
    try:
        validate_cs(request)
    except Exception:
        return JSONResponse(status_code=403, content={"ok": False, "detail": "CSRF failed"})

    email = req.email.lower()
    # Always send OTP (avoid user enumeration)
    otp_code = generate_otp_code(OTP_CODE_LENGTH)
    await set_otp(email=email, purpose="reset-password", otp_code=otp_code)
    try:
        send_otp_email(email, otp_code, "reset-password")
    except Exception:
        return JSONResponse(status_code=500, content={"ok": False, "detail": "Failed to send OTP"})

    return JSONResponse(status_code=200, content={"ok": True, "message": "Reset OTP sent"})


@router.post("/verify-reset-otp")
async def verify_reset_otp(req: VerifyResetOtpRequest, request: Request) -> JSONResponse:
    try:
        validate_cs(request)
    except Exception:
        return JSONResponse(status_code=403, content={"ok": False, "detail": "CSRF failed"})

    ok, _msg = await verify_otp(email=req.email.lower(), purpose="reset-password", otp_code=req.otp_code)
    if not ok:
        return JSONResponse(status_code=400, content={"ok": False, "detail": "Invalid or expired OTP"})

    return JSONResponse(status_code=200, content={"ok": True, "message": "OTP verified"})


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, request: Request) -> JSONResponse:
    try:
        validate_cs(request)
    except Exception:
        return JSONResponse(status_code=403, content={"ok": False, "detail": "CSRF failed"})

    if req.new_password != req.confirm_password:
        return JSONResponse(status_code=400, content={"ok": False, "detail": "Passwords do not match"})

    try:
        _validate_strong_password(req.new_password)
    except ValueError as e:
        return JSONResponse(status_code=400, content={"ok": False, "detail": str(e)})

    user = await _get_user_by_email(req.email.lower())
    if not user:
        return JSONResponse(status_code=404, content={"ok": False, "detail": "User not found"})

    ok, _msg = await verify_otp(email=req.email.lower(), purpose="reset-password", otp_code=req.otp_code)
    if not ok:
        return JSONResponse(status_code=400, content={"ok": False, "detail": "Invalid or expired OTP"})

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select

        u = (await session.execute(select(User).where(User.email == req.email.lower()))).scalar_one_or_none()
        if not u:
            return JSONResponse(status_code=404, content={"ok": False, "detail": "User not found"})
        u.hashed_password = hash_password(req.new_password)
        await session.commit()

    return JSONResponse(status_code=200, content={"ok": True, "message": "Password updated"})


@router.post("/refresh")
async def refresh(request: Request, response: Any) -> JSONResponse:
    try:
        refresh_token = request.cookies.get("refresh_token")
        if not refresh_token:
            return JSONResponse(status_code=401, content={"ok": False, "detail": "Missing refresh token"})
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            return JSONResponse(status_code=401, content={"ok": False, "detail": "Invalid refresh token"})
        sub = payload.get("sub")
        user_id = UUID(str(sub))
    except Exception:
        return JSONResponse(status_code=401, content={"ok": False, "detail": "Invalid refresh token"})

    # Optional: check refresh token exists in DB
    token_row = await _get_refresh_token(refresh_token)
    if not token_row:
        return JSONResponse(status_code=401, content={"ok": False, "detail": "Invalid refresh token"})

    # Issue new access token
    access_token = create_access_token(str(user_id))
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=JWT_ACCESS_TTL_SECONDS,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/",
    )

    return JSONResponse(status_code=200, content={"ok": True, "message": "Refreshed"})


@router.post("/logout")
async def logout(request: Request, response: Any) -> JSONResponse:
    try:
        refresh_token = request.cookies.get("refresh_token")
        if refresh_token:
            async with AsyncSessionLocal() as session:
                from sqlalchemy import delete

                await session.execute(delete(RefreshToken).where(RefreshToken.token == refresh_token))
                await session.commit()
    except Exception:
        pass

    response.delete_cookie("access_token", path="/", samesite=COOKIE_SAMESITE, secure=COOKIE_SECURE)
    response.delete_cookie("refresh_token", path="/", samesite=COOKIE_SAMESITE, secure=COOKIE_SECURE)
    return JSONResponse(status_code=200, content={"ok": True, "message": "Logged out"})


@router.get("/me")
async def me(request: Request) -> JSONResponse:
    user_id = await _extract_access_user_id(request)
    if not user_id:
        return JSONResponse(status_code=401, content={"ok": False, "detail": "Not authenticated"})

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select

        res = await session.execute(select(User).where(User.id == user_id))
        user = res.scalar_one_or_none()
        if not user:
            return JSONResponse(status_code=401, content={"ok": False, "detail": "Not authenticated"})

        return JSONResponse(
            status_code=200,
            content={
                "ok": True,
                "user": {
                    "id": str(user.id),
                    "full_name": user.full_name,
                    "email": user.email,
                    "avatar_url": user.avatar_url,
                    "created_at": user.created_at.isoformat() if user.created_at else None,
                    "is_verified": user.is_verified,
                },
            },
        )


@router.put("/update-profile")
async def update_profile(request: Request, body: UpdateProfileRequest) -> JSONResponse:
    user_id = await _extract_access_user_id(request)
    if not user_id:
        return JSONResponse(status_code=401, content={"ok": False, "detail": "Not authenticated"})

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select

        u = (await session.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
        if not u:
            return JSONResponse(status_code=401, content={"ok": False, "detail": "Not authenticated"})

        if body.full_name is not None:
            u.full_name = body.full_name
        if body.avatar_url is not None:
            u.avatar_url = body.avatar_url
        await session.commit()

    return JSONResponse(status_code=200, content={"ok": True, "message": "Profile updated"})


class DeleteConfirmRequest(BaseModel):
    confirm: str = Field(min_length=1)


@router.delete("/delete-account")
async def delete_account(request: Request, body: DeleteConfirmRequest) -> JSONResponse:
    user_id = await _extract_access_user_id(request)
    if not user_id:
        return JSONResponse(status_code=401, content={"ok": False, "detail": "Not authenticated"})

    # Require exact DELETE typed in frontend per spec. We'll accept literal string 'DELETE'.
    if body.confirm.strip() != "DELETE":
        return JSONResponse(status_code=400, content={"ok": False, "detail": "Confirmation required"})

    async with AsyncSessionLocal() as session:
        from sqlalchemy import delete

        await session.execute(delete(RefreshToken).where(RefreshToken.user_id == user_id))
        await session.execute(delete(User).where(User.id == user_id))
        await session.commit()

    return JSONResponse(status_code=200, content={"ok": True, "message": "Account deleted"})


# OAuth routes are not implemented in this patch.

