from datetime import datetime
from sqlalchemy import Integer, Text, Numeric, String, DateTime, func, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from database import Base

class Bid(Base):
    __tablename__ = "bids"

    bid_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.job_id", ondelete="CASCADE"), nullable=False, index=True)
    freelancer_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    proposal_text: Mapped[str] = mapped_column(Text, nullable=False)
    bid_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(20), server_default="pending", nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("job_id", "freelancer_id", name="uix_job_freelancer"),
    )
