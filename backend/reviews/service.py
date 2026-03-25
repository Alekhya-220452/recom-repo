from typing import List
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from reviews.models import Review
from reviews.schemas import ReviewCreate
from projects.service import get_project
from notifications.service import create_notification
from notifications.schemas import NotificationCreate

async def create_review(db: AsyncSession, review: ReviewCreate, reviewer_id: int):
    # Verify project exists and is completed
    project = await get_project(db, review.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.status != 'completed':
        # According to the schema, maybe it's just after project completion
        # Wait, in projects module, approve_work sets it to 'approved' or 'completed'?
        # In projects.service approve_work, it sets project.status = 'approved',
        # and job.status = 'completed'. Let's check status 'approved' or 'completed'
        if project.status not in ['approved', 'completed']:
            raise HTTPException(status_code=400, detail="Project must be completed or approved to leave a review")
            
    # Verify reviewer is part of project
    if reviewer_id not in [project.client_id, project.freelancer_id]:
        raise HTTPException(status_code=403, detail="You are not part of this project")
        
    # Verify reviewee is part of project and is the other party
    if review.reviewee_id not in [project.client_id, project.freelancer_id] or review.reviewee_id == reviewer_id:
        raise HTTPException(status_code=400, detail="Invalid reviewee for this project")
        
    db_review = Review(
        project_id=project.project_id,
        reviewer_id=reviewer_id,
        reviewee_id=review.reviewee_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(db_review)
    try:
        await db.commit()
        await db.refresh(db_review)

        # Notify the reviewee
        await create_notification(db, NotificationCreate(
            user_id=review.reviewee_id,
            title="Performance Review Logged",
            message=f"Intel acquired: A new performance review has been logged for your profile.",
            link=f"/profile/{review.reviewee_id}"
        ))

        return db_review
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="You have already reviewed this project")

async def get_user_reviews(db: AsyncSession, user_id: int):
    query = select(Review).where(Review.reviewee_id == user_id)
    result = await db.execute(query)
    return result.scalars().all()
