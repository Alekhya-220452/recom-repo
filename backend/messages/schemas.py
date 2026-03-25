from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class MessageCreate(BaseModel):
    content: str

class MessageOut(BaseModel):
    message_id: int
    project_id: int
    sender_id: int
    content: str
    is_read: bool
    created_at: datetime
    sender_name: Optional[str] = None

    class Config:
        from_attributes = True
