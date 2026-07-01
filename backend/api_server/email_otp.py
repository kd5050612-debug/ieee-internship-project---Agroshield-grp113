from __future__ import annotations

import smtplib
import ssl
from email.message import EmailMessage

from backend.api_server.auth_settings import SMTP_FROM_EMAIL, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USERNAME


def send_otp_email(to_email: str, otp_code: str, purpose: str) -> None:
    if not SMTP_USERNAME or not SMTP_PASSWORD or not SMTP_FROM_EMAIL:
        # In production, require these.
        # For dev, we still raise to avoid silent insecure behavior.
        raise RuntimeError("SMTP is not configured. Set SMTP_USERNAME/SMTP_PASSWORD/SMTP_FROM_EMAIL")

    msg = EmailMessage()
    msg["From"] = SMTP_FROM_EMAIL
    msg["To"] = to_email
    msg["Subject"] = f"AgriLens OTP Verification - {purpose}"
    msg.set_content(f"Your verification code is: {otp_code}. It expires in 5 minutes.")

    context = ssl.create_default_context()

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls(context=context)
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)

