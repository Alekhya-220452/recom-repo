"""
database.py – Async SQLAlchemy engine, session factory, and base model.
All modules import `get_db` to receive a per-request async session.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from config import settings

# ── Engine ────────────────────────────────────────────────────────────────────
# `echo=True` logs every SQL statement – disable in production
# Configured with connection pooling for high concurrency
engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=settings.DEBUG, 
    pool_size=20,           # Maintains up to 20 connections in the pool
    max_overflow=10,        # Allows up to 10 extra connections beyond pool_size
    pool_timeout=30,        # Wait up to 30 seconds for a connection
    pool_recycle=1800,      # Recycle connections every 30 minutes
    future=True
)

# ── Session factory ───────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,   # objects remain accessible after commit
    autoflush=False,
    autocommit=False,
)


# ── Declarative base ──────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """All ORM models inherit from this class."""
    pass


# ── Dependency ────────────────────────────────────────────────────────────────
async def get_db() -> AsyncSession:
    """
    FastAPI dependency that yields a database session.
    The session is automatically closed after the request finishes.

    Usage in a route:
        async def my_route(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ── Table creation helper ─────────────────────────────────────────────────────
async def create_tables():
    """Create all tables on startup (development convenience)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
