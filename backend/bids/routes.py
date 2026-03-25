from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from bids import schemas, service
from auth.service import get_current_user
from auth.schemas import UserOut

router = APIRouter()

@router.post("", response_model=schemas.BidOut, status_code=status.HTTP_201_CREATED)
async def submit_bid(
    bid: schemas.BidCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role != 'freelancer':
        raise HTTPException(status_code=403, detail="Only freelancers can submit bids.")
    return await service.create_bid(db=db, bid=bid, freelancer_id=current_user.user_id)

@router.get("/my", response_model=List[schemas.BidOut])
async def list_my_bids(
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role != 'freelancer':
        raise HTTPException(status_code=403, detail="Only freelancers can view their bids.")
    return await service.get_user_bids(db=db, freelancer_id=current_user.user_id)

@router.get("/job/{job_id}", response_model=List[schemas.BidOut])
async def list_bids_for_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    return await service.get_bids_for_job(db=db, job_id=job_id)

@router.put("/{bid_id}/accept", response_model=schemas.BidOut)
async def accept_bid(
    bid_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role != 'client':
        raise HTTPException(status_code=403, detail="Only clients can accept bids.")
    return await service.accept_bid(db=db, bid_id=bid_id, client_id=current_user.user_id)

@router.post("/job/{job_id}/read-all", status_code=204)
async def mark_bids_read(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    await service.mark_bids_as_read(db=db, job_id=job_id)
    return None
