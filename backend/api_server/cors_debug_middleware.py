from __future__ import annotations

from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.types import ASGIApp, Receive, Scope, Send


class CORSHeaderDebugMiddleware(BaseHTTPMiddleware):
    """Adds an easy way to confirm CORS headers are applied.

    Dev-only: adds `x-cors-debug` header and echoes request origin.
    """

    async def dispatch(self, request: Request, call_next: Callable):
        response = await call_next(request)
        try:
            origin = request.headers.get("origin")
            response.headers["x-cors-debug"] = origin or "(no-origin)"
        except Exception:
            pass
        return response

