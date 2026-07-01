from __future__ import annotations

import time

from fastapi import Request

import redis.asyncio as redis

from backend.api_server.auth_settings import LOGIN_LOCK_SECONDS, LOGIN_RATE_LIMIT_ATTEMPTS, LOGIN_RATE_LIMIT_WINDOW_SECONDS, REDIS_URL


def _key_prefix(email: str, ip: str) -> str:
    return f"agrilens:auth:rl:{email.lower()}:{ip}"


async def get_redis() -> redis.Redis:
    return redis.from_url(REDIS_URL, decode_responses=True)


async def register_login_attempt(email: str, ip: str) -> tuple[int, int]:
    """Returns (attempt_count, lock_ttl_seconds)."""
    r = await get_redis()
    now = int(time.time())
    key = _key_prefix(email, ip)

    locked_key = key + ":locked"
    locked_ttl = await r.ttl(locked_key)
    if locked_ttl is not None and locked_ttl > 0:
        return 0, int(locked_ttl)

    count = await r.incr(key)
    if count == 1:
        await r.expire(key, LOGIN_RATE_LIMIT_WINDOW_SECONDS)

    if int(count) >= LOGIN_RATE_LIMIT_ATTEMPTS:
        await r.set(locked_key, "1", ex=LOGIN_LOCK_SECONDS)
        await r.delete(key)
        return 0, LOGIN_LOCK_SECONDS

    ttl = await r.ttl(key)
    return int(count), int(ttl if ttl and ttl > 0 else LOGIN_RATE_LIMIT_WINDOW_SECONDS)

