from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SupportTicketCreate(BaseModel):
    subject: str
    category: str
    description: str

class SupportTicketOut(BaseModel):
    ticket_id: int
    user_id: Optional[int]
    subject: str
    category: str
    description: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class DisputeOut(BaseModel):
    dispute_id: int
    job_id: int
    project_id: int
    raised_by_id: int
    reason: str
    description: str
    status: str
    created_at: datetime
    admin_id: Optional[int] = None
    admin_decision: Optional[str] = None
    admin_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DisputeDetailOut(DisputeOut):
    client_name: str
    freelancer_name: str
    job_title: str
    escrow_amount: float
    # We could embed full message logs, but usually they are fetched separately 
    # for simplicity we just return a unified detail object here.
    
class DisputeDecision(BaseModel):
    decision: str # "RELEASE" or "REFUND"
    notes: Optional[str] = None
