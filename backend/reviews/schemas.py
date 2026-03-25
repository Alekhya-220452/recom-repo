from datetime import datetime
from typing import Optional
from pydantic import BaseModel, conint

class ReviewBase(BaseModel):
    project_id: int
    reviewee_id: int
    rating: conint(ge=1, le=5) # type: ignore
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewOut(ReviewBase):
    review_id: int
    reviewer_id: int
    created_at: datetime

    class Config:
        from_attributes = True
