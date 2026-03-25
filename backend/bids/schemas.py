from datetime import datetime
from pydantic import BaseModel

class BidBase(BaseModel):
    job_id: int
    proposal_text: str
    bid_amount: float

class BidCreate(BidBase):
    pass

class BidUpdate(BaseModel):
    status: str

class BidOut(BidBase):
    bid_id: int
    freelancer_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
