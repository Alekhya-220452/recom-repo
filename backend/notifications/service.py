from typing import List
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from notifications.models import Notification
from notifications.schemas import NotificationCreate

async def create_notification(db: AsyncSession, notification: NotificationCreate):
    db_notification = Notification(**notification.model_dump())
    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)
    return db_notification

async def get_notifications(db: AsyncSession, user_id: int, limit: int = 20):
    query = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def mark_as_read(db: AsyncSession, notification_id: int, user_id: int):
    query = select(Notification).where(Notification.notification_id == notification_id, Notification.user_id == user_id)
    result = await db.execute(query)
    notification = result.scalars().first()
    if notification:
        notification.is_read = True
        await db.commit()
        await db.refresh(notification)
    return notification

async def mark_all_as_read(db: AsyncSession, user_id: int):
    query = select(Notification).where(Notification.user_id == user_id, Notification.is_read == False)
    result = await db.execute(query)
    notifications = result.scalars().all()
    for n in notifications:
        n.is_read = True
    await db.commit()
    return True

async def delete_all_notifications(db: AsyncSession, user_id: int):
    from sqlalchemy import delete
    await db.execute(delete(Notification).where(Notification.user_id == user_id))
    await db.commit()
    return True
