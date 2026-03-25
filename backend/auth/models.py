from typing import Optional
from datetime import datetime
from sqlalchemy import Integer, String, Text, DateTime, func, Numeric # type: ignore
from sqlalchemy.orm import Mapped, mapped_column

from database import Base # type: ignore

class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    skills: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    profile_picture: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    hourly_rate: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
