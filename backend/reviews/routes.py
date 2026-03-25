from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from reviews import schemas, service
from auth.service import get_current_user
from auth.schemas import UserOut

router = APIRouter()

@router.post("", response_model=schemas.ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_review(
    review: schemas.ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    return await service.create_review(db=db, review=review, reviewer_id=current_user.user_id)

@router.get("/user/{user_id}", response_model=List[schemas.ReviewOut])
async def list_user_reviews(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await service.get_user_reviews(db=db, user_id=user_id)
