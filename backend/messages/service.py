from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from fastapi import HTTPException

from messages.models import Message
from messages.schemas import MessageCreate
from projects.service import get_project


async def get_messages(db: AsyncSession, project_id: int, user_id: int):
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.client_id != user_id and project.freelancer_id != user_id:
        raise HTTPException(status_code=403, detail="Not a participant of this project")

    result = await db.execute(
        select(Message)
        .where(Message.project_id == project_id)
        .options(joinedload(Message.sender))
        .order_by(Message.created_at)
    )
    messages = result.scalars().all()

    # Mark unread messages from the other party as read
    for m in messages:
        if m.sender_id != user_id and not m.is_read:
            m.is_read = True
    await db.commit()

    out = []
    for m in messages:
        sender_name = m.sender.name if m.sender else f"User #{m.sender_id}"
        out.append({
            "message_id": m.message_id,
            "project_id": m.project_id,
            "sender_id":  m.sender_id,
            "content":    m.content,
            "is_read":    m.is_read,
            "created_at": m.created_at,
            "sender_name": sender_name,
        })
    return out


async def send_message(db: AsyncSession, project_id: int, sender_id: int, data: MessageCreate):
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.client_id != sender_id and project.freelancer_id != sender_id:
        raise HTTPException(status_code=403, detail="Not a participant of this project")
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    msg = Message(
        project_id=project_id,
        sender_id=sender_id,
        content=data.content.strip(),
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    # Reload with sender
    result = await db.execute(
        select(Message).where(Message.message_id == msg.message_id).options(joinedload(Message.sender))
    )
    msg = result.scalars().first()

    # Create Notification for receiver
    from notifications.service import create_notification
    from notifications.schemas import NotificationCreate
    receiver_id = project.client_id if sender_id == project.freelancer_id else project.freelancer_id
    snippet = data.content[:40] + ("..." if len(data.content) > 40 else "")
    sender_name = msg.sender.name if msg.sender else "Someone"
    
    await create_notification(db, NotificationCreate(
        user_id=receiver_id,
        title="New Message",
        message=f"{sender_name} sent you a message: '{snippet}'",
        link=f"/messages/{sender_id}" # Receiver clicks and goes to chat with sender
    ))

    return {
        "message_id": msg.message_id,
        "project_id": msg.project_id,
        "sender_id":  msg.sender_id,
        "content":    msg.content,
        "is_read":    msg.is_read,
        "created_at": msg.created_at,
        "sender_name": sender_name,
    }


async def get_user_messages(db: AsyncSession, current_user_id: int, other_user_id: int):
    from projects.models import Project
    from sqlalchemy import and_, or_
    shared_projects = await db.execute(
        select(Project.project_id).where(
            or_(
                and_(Project.client_id == current_user_id, Project.freelancer_id == other_user_id),
                and_(Project.client_id == other_user_id, Project.freelancer_id == current_user_id)
            )
        )
    )
    pids = [p for p in shared_projects.scalars().all()]
    if not pids:
        return []

    result = await db.execute(
        select(Message)
        .where(Message.project_id.in_(pids))
        .options(joinedload(Message.sender))
        .order_by(Message.created_at)
    )
    messages = result.scalars().all()

    # Mark unread messages from the other party as read
    for m in messages:
        if m.sender_id != current_user_id and not m.is_read:
            m.is_read = True
    await db.commit()

    out = []
    for m in messages:
        sender_name = m.sender.name if m.sender else f"User #{m.sender_id}"
        out.append({
            "message_id": m.message_id,
            "project_id": m.project_id,
            "sender_id":  m.sender_id,
            "content":    m.content,
            "is_read":    m.is_read,
            "created_at": m.created_at,
            "sender_name": sender_name,
        })
    return out


async def send_user_message(db: AsyncSession, current_user_id: int, other_user_id: int, data: MessageCreate):
    from projects.models import Project
    from sqlalchemy import and_, or_, desc
    
    result = await db.execute(
        select(Project).where(
            or_(
                and_(Project.client_id == current_user_id, Project.freelancer_id == other_user_id),
                and_(Project.client_id == other_user_id, Project.freelancer_id == current_user_id)
            )
        ).order_by(desc(Project.created_at)).limit(1)
    )
    proj = result.scalars().first()
    if not proj:
        # Fallback if no project exists: maybe throw an error or handle it.
        # According to the system, you shouldn't message without a project.
        raise HTTPException(status_code=400, detail="No shared projects found to attach message to.")
        
    return await send_message(db, proj.project_id, current_user_id, data)


async def get_unread_count(db: AsyncSession, user_id: int):
    """Count unread messages across ALL projects where the user is a participant."""
    from projects.models import Project
    from sqlalchemy import or_

    projects_res = await db.execute(
        select(Project).where(or_(Project.client_id == user_id, Project.freelancer_id == user_id))
    )
    project_ids = [p.project_id for p in projects_res.scalars().all()]
    if not project_ids:
        return 0

    result = await db.execute(
        select(Message).where(
            Message.project_id.in_(project_ids),
            Message.sender_id != user_id,
            Message.is_read == False,
        )
    )
    return len(result.scalars().all())
