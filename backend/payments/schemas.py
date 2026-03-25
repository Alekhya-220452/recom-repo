from datetime import datetime
from pydantic import BaseModel

class TransactionBase(BaseModel):
    project_id: int
    amount: float

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    transaction_id: int
    client_id: int
    freelancer_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentIntentRequest(BaseModel):
    project_id: int

class PaymentIntentResponse(BaseModel):
    client_secret: str
