from __future__ import annotations

"""Auth router facade.

The actual authentication implementation lives in `routers/auth_impl.py`.
This module exists purely so `main.py` can `include_router()` a stable import path.
"""

from backend.api_server.routers.auth_impl import router

