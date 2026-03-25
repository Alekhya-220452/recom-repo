from typing import Optional
from datetime import date, datetime
from sqlalchemy import Integer, String, Text, Numeric, Date, DateTime, func, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

class Job(Base):
    __tablename__ = "jobs"

    job_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    budget: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    deadline: Mapped[date] = mapped_column(Date, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    experience_level: Mapped[str] = mapped_column(String(20), server_default="any", nullable=False)
    status: Mapped[str] = mapped_column(String(20), server_default="open", nullable=False)
    is_hidden_by_client: Mapped[bool] = mapped_column(Boolean, server_default="false", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

class SavedJob(Base):
    __tablename__ = "saved_jobs"

    saved_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.job_id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
