from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import jwt

from backend.api_server.auth_settings import JWT_ACCESS_TTL_SECONDS, JWT_ISSUER, JWT_REFRESH_TTL_SECONDS, JWT_SECRET


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(sub: str) -> str:
    now = _utc_now()
    exp = now + timedelta(seconds=JWT_ACCESS_TTL_SECONDS)
    payload: dict[str, Any] = {
        "iss": JWT_ISSUER,
        "sub": sub,
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def create_refresh_token(sub: str) -> str:
    now = _utc_now()
    exp = now + timedelta(seconds=JWT_REFRESH_TTL_SECONDS)
    payload: dict[str, Any] = {
        "iss": JWT_ISSUER,
        "sub": sub,
        "type": "refresh",
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"], issuer=JWT_ISSUER)

