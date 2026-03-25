from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from auth.service import get_current_user
from auth.schemas import UserOut
from messages import schemas, service

router = APIRouter()


@router.get("/project/{project_id}", response_model=List[schemas.MessageOut])
async def get_project_messages(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user),
):
    return await service.get_messages(db, project_id, current_user.user_id)


@router.post("/project/{project_id}", response_model=schemas.MessageOut, status_code=201)
async def send_message(
    project_id: int,
    data: schemas.MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user),
):
    return await service.send_message(db, project_id, current_user.user_id, data)


@router.get("/user/{other_user_id}", response_model=List[schemas.MessageOut])
async def get_user_messages(
    other_user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user),
):
    return await service.get_user_messages(db, current_user.user_id, other_user_id)


@router.post("/user/{other_user_id}", response_model=schemas.MessageOut, status_code=201)
async def send_user_message(
    other_user_id: int,
    data: schemas.MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user),
):
    return await service.send_user_message(db, current_user.user_id, other_user_id, data)


@router.get("/unread-count")
async def unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user),
):
    count = await service.get_unread_count(db, current_user.user_id)
    return {"unread": count}
