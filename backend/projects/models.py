from datetime import date, datetime
from sqlalchemy import Integer, Text, String, Date, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

class Project(Base):
    __tablename__ = "projects"

    project_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.job_id", ondelete="CASCADE"), nullable=False, index=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False, index=True)
    freelancer_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(30), server_default="active", nullable=False)
    work_notes: Mapped[str] = mapped_column(Text, nullable=True)
    start_date: Mapped[date] = mapped_column(Date, server_default=func.current_date())
    end_date: Mapped[date] = mapped_column(Date, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    job = relationship("Job")
