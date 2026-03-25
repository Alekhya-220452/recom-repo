"""
config.py – Application configuration loaded from environment variables.
Uses pydantic-settings so values can also come from a .env file.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Database ──────────────────────────────────────────────
    DATABASE_URL: str = "sqlite+aiosqlite:///./freelance.db"
    # For PostgreSQL use:
    # DATABASE_URL: str = "postgresql+asyncpg://user:pass@db:5432/freelance_db"

    # ── JWT Auth ──────────────────────────────────────────────
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_super_secret_key_123"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # ── App ───────────────────────────────────────────────────
    APP_NAME: str = "Freelance Marketplace API"
    DEBUG: bool = True
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # ── Google OAuth ──────────────────────────────────────────
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:5173/login/callback"

    # ── Stripe ────────────────────────────────────────────────
    STRIPE_SECRET_KEY: str = "sk_test_dummy_key"
    STRIPE_WEBHOOK_SECRET: str = "whsec_dummy_secret"

    class Config:
        env_file = ".env"          # override any value in a .env file
        env_file_encoding = "utf-8"


# Single shared instance imported everywhere
settings = Settings()
