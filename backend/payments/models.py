from datetime import datetime
from sqlalchemy import Integer, Numeric, String, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.project_id", ondelete="CASCADE"), nullable=False, index=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False, index=True)
    freelancer_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(20), server_default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
