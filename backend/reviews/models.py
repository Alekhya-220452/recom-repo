from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, Text, DateTime, func, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from database import Base

class Review(Base):
    __tablename__ = "reviews"

    review_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.project_id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False, index=True)
    reviewee_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False, index=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("project_id", "reviewer_id", name="uix_project_reviewer"),
    )
