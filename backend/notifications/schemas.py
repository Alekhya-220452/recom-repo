from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class NotificationBase(BaseModel):
    title: str
    message: str
    link: Optional[str] = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationOut(NotificationBase):
    notification_id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
