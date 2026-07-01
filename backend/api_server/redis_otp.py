from __future__ import annotations

import json
import secrets
import time
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

import redis.asyncio as redis

from backend.api_server.auth_settings import OTP_MAX_ATTEMPTS, OTP_RESEND_COOLDOWN_SECONDS, OTP_TTL_SECONDS


@dataclass
class OtpPayload:
    email: str
    purpose: str
    otp_code: str
    expires_at: int
    attempt_count: int
    created_at: int


def generate_otp_code(length: int = 6) -> str:
    # cryptographically secure numeric code
    return "".join(str(secrets.randbelow(10)) for _ in range(length))


def _now_ts() -> int:
    return int(time.time())


def otp_key(email: str, purpose: str) -> str:
    return f"agrilens:otp:{purpose}:{email.lower()}"


def resend_key(email: str, purpose: str) -> str:
    return f"agrilens:otp:resend:{purpose}:{email.lower()}"


async def get_redis() -> redis.Redis:
    url = None
    from backend.api_server.auth_settings import REDIS_URL

    return redis.from_url(url=REDIS_URL, decode_responses=True)


async def set_otp(email: str, purpose: str, otp_code: str) -> None:
    r = await get_redis()
    now = _now_ts()
    payload = {
        "email": email,
        "purpose": purpose,
        "otp_code": otp_code,
        "expires_at": now + OTP_TTL_SECONDS,
        "attempt_count": 0,
        "created_at": now,
    }
    await r.setex(otp_key(email, purpose), OTP_TTL_SECONDS, json.dumps(payload))


async def verify_otp(email: str, purpose: str, otp_code: str) -> tuple[bool, str]:
    r = await get_redis()
    raw = await r.get(otp_key(email, purpose))
    if not raw:
        return False, "OTP expired or not found"

    payload = json.loads(raw)
    if int(payload["expires_at"]) < _now_ts():
        return False, "OTP expired"

    if payload["attempt_count"] >= OTP_MAX_ATTEMPTS:
        return False, "OTP attempts exceeded"

    if str(payload["otp_code"]) != str(otp_code):
        payload["attempt_count"] = int(payload["attempt_count"]) + 1
        # preserve ttl by resetting with remaining ttl
        remaining = int(payload["expires_at"]) - _now_ts()
        remaining = max(1, remaining)
        await r.setex(otp_key(email, purpose), remaining, json.dumps(payload))
        return False, "Invalid OTP"

    return True, "OTP verified"


async def can_resend(email: str, purpose: str) -> tuple[bool, int]:
    r = await get_redis()
    key = resend_key(email, purpose)
    ttl = await r.ttl(key)
    if ttl is None or ttl < 0:
        return True, 0
    return False, int(ttl)


async def mark_resend_cooldown(email: str, purpose: str) -> None:
    r = await get_redis()
    await r.set(resend_key(email, purpose), "1", ex=OTP_RESEND_COOLDOWN_SECONDS)

