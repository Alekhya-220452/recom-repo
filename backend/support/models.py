from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    ticket_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    subject = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="open")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to User (optional, since it's nullable)
    user = relationship("User")

class Dispute(Base):
    __tablename__ = "disputes"

    dispute_id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.job_id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    raised_by_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    reason = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="open") # open, resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Decision Execution Logging
    admin_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    admin_decision = Column(String, nullable=True) # RELEASE, REFUND
    admin_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
