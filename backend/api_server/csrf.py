from __future__ import annotations

import secrets

from fastapi import Request, Response

from backend.api_server.auth_settings import CSRF_COOKIE_NAME, CSRF_HEADER_NAME, COOKIE_SECURE







def ensure_csrf_token(request: Request, response: Response | None = None) -> str:
    token = request.cookies.get(CSRF_COOKIE_NAME)
    if token:
        return token

    token = secrets.token_urlsafe(32)
    if response is not None:
        response.set_cookie(
            CSRF_COOKIE_NAME,
            token,
            httponly=False,
            secure=COOKIE_SECURE,
            # For cross-site requests (frontend <-> backend different host),
            # SameSite=lax can prevent the cookie from being sent.
            # SameSite=None requires Secure=true in modern browsers.
            # SameSite=None must be used for cross-site cookies (frontend <-> backend different host).
            # Browsers require Secure=true when SameSite=None.
            samesite="none",


        )
    return token


def validate_cs(request: Request) -> None:
    header_token = request.headers.get(CSRF_HEADER_NAME)
    cookie_token = request.cookies.get(CSRF_COOKIE_NAME)
    if not header_token or not cookie_token or header_token != cookie_token:
        raise ValueError("CSRF validation failed")


# Backwards compatible alias (some modules import `validate_cs`).
validate_csrf = validate_cs

