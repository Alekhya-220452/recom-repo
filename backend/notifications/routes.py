from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from notifications import schemas, service
from auth.service import get_current_user
from auth.schemas import UserOut

router = APIRouter()

@router.get("", response_model=List[schemas.NotificationOut])
async def list_my_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    return await service.get_notifications(db=db, user_id=current_user.user_id)

@router.put("/{notification_id}/read", response_model=schemas.NotificationOut)
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    notification = await service.mark_as_read(db=db, notification_id=notification_id, user_id=current_user.user_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.post("/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    await service.mark_all_as_read(db=db, user_id=current_user.user_id)
    return {"message": "All notifications marked as read"}

@router.delete("/clear-all", status_code=204)
async def clear_all_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    await service.delete_all_notifications(db=db, user_id=current_user.user_id)
    return None
