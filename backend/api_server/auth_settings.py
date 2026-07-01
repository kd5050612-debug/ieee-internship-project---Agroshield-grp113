from __future__ import annotations

import os


def env(name: str, default: str | None = None) -> str:
    v = os.getenv(name, default)
    if v is None:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return v


# JWT
JWT_SECRET = env("JWT_SECRET", "change-me-in-prod")
JWT_ISSUER = env("JWT_ISSUER", "agrilens")
JWT_ACCESS_TTL_SECONDS = int(env("JWT_ACCESS_TTL_SECONDS", "900"))  # 15m
JWT_REFRESH_TTL_SECONDS = int(env("JWT_REFRESH_TTL_SECONDS", str(7 * 24 * 3600)))

# Cookies
# IMPORTANT:
# When frontend/backend are cross-site (different hostnames/IPs), browsers require:
# - SameSite=None
# - Secure
# Secure cookies will only be accepted over HTTPS.
# Dev-friendly defaults: if you run backend over HTTP (http://127.0.0.1:8000),
# Secure cookies will not be sent by the browser, causing 401 on authenticated endpoints.
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() in ("1", "true", "yes")

# On HTTP, use lax/strict instead of none.
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax")  # lax|strict|none



# CSRF
CSRF_HEADER_NAME = env("CSRF_HEADER_NAME", "x-csrf-token")
CSRF_COOKIE_NAME = env("CSRF_COOKIE_NAME", "agrilens_csrf")

# Rate limit / lock
LOGIN_RATE_LIMIT_ATTEMPTS = int(env("LOGIN_RATE_LIMIT_ATTEMPTS", "5"))
LOGIN_RATE_LIMIT_WINDOW_SECONDS = int(env("LOGIN_RATE_LIMIT_WINDOW_SECONDS", "60"))
LOGIN_LOCK_SECONDS = int(env("LOGIN_LOCK_SECONDS", "600"))

# OTP
OTP_TTL_SECONDS = int(env("OTP_TTL_SECONDS", "300"))  # 5m
OTP_MAX_ATTEMPTS = int(env("OTP_MAX_ATTEMPTS", "5"))
OTP_RESEND_COOLDOWN_SECONDS = int(env("OTP_RESEND_COOLDOWN_SECONDS", "30"))
OTP_CODE_LENGTH = int(env("OTP_CODE_LENGTH", "6"))

# OTP purposes (imported by routers/auth_impl.py)
OTP_PURPOSE_EMAIL_VERIFY = "verify-email"
OTP_PURPOSE_LOGIN_VERIFY = "login-verify"
OTP_PURPOSE_FORGOT_PASSWORD = "reset-password"

# SMTP
SMTP_HOST = env("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(env("SMTP_PORT", "587"))
SMTP_USERNAME = env("SMTP_USERNAME", "")
SMTP_PASSWORD = env("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = env("SMTP_FROM_EMAIL", "")

# Redis
REDIS_URL = env("REDIS_URL", "redis://localhost:6379/0")

# Database
DATABASE_URL = env(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/agrilens",
)

