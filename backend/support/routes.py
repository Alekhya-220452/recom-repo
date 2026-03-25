from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_db
from auth.service import get_current_user
from auth.schemas import User
from . import schemas, service

router = APIRouter()

@router.post("/tickets", response_model=schemas.SupportTicketOut, status_code=status.HTTP_201_CREATED)
async def create_support_ticket(
    ticket: schemas.SupportTicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits a support ticket. Only accessible to logged-in users.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to submit a report"
        )
    
    return await service.create_ticket(db=db, ticket_data=ticket, user_id=current_user.user_id)

@router.get("/disputes", response_model=List[schemas.DisputeOut])
async def get_all_disputes(
    status: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return await service.get_all_disputes(db=db, status=status)

@router.get("/disputes/{dispute_id}", response_model=schemas.DisputeDetailOut)
async def get_dispute_details(
    dispute_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return await service.get_dispute_detail(db=db, dispute_id=dispute_id)

@router.post("/disputes/{dispute_id}/resolve", response_model=schemas.DisputeOut)
async def resolve_dispute(
    dispute_id: int,
    decision_data: schemas.DisputeDecision,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return await service.resolve_dispute(db=db, dispute_id=dispute_id, decision_data=decision_data, admin_id=current_user.user_id)
