from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Boolean, String
from sqlalchemy.orm import relationship
from database import Base

class Message(Base):
    __tablename__ = "messages"

    message_id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.project_id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id  = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    content    = Column(Text, nullable=False)
    is_read    = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    sender  = relationship("User", foreign_keys=[sender_id])
    project = relationship("Project")
