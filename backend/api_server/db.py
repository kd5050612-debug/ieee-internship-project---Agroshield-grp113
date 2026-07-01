from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine, async_sessionmaker

from backend.api_server.auth_settings import DATABASE_URL


engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)

