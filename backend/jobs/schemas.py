from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, condecimal

class JobBase(BaseModel):
    title: str
    description: str
    budget: float
    deadline: date
    category: Optional[str] = None
    experience_level: str = "any"

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    status: Optional[str] = None
    is_hidden_by_client: Optional[bool] = None
    category: Optional[str] = None
    experience_level: Optional[str] = None

class JobOut(JobBase):
    job_id: int
    client_id: int
    status: str
    is_hidden_by_client: bool
    created_at: datetime
    bid_count: int = 0
    unread_bid_count: int = 0

    class Config:
        from_attributes = True
