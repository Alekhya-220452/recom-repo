from typing import Optional
from sqlalchemy.future import select
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, case
from jobs.models import Job, SavedJob
from reviews.models import Review
from projects.models import Project
from bids.models import Bid
from auth.models import User
from jobs.schemas import JobCreate, JobUpdate

async def create_job(db: AsyncSession, job: JobCreate, client_id: int):
    db_job = Job(
        client_id=client_id,
        title=job.title,
        description=job.description,
        budget=job.budget,
        deadline=job.deadline,
        category=job.category,
        experience_level=job.experience_level,
        is_hidden_by_client=False
    )
    db.add(db_job)
    await db.commit()
    await db.refresh(db_job)
    return db_job

async def get_jobs(db: AsyncSession, status: Optional[str] = None):
    # Using outer join with Bid to count bids and unread bids per job
    query = (
        select(
            Job,
            func.count(Bid.bid_id).label('bid_count'),
            func.sum(case((Bid.is_read == False, 1), else_=0)).label('unread_bid_count')
        )
        .outerjoin(Bid, Job.job_id == Bid.job_id)
        .group_by(Job.job_id)
    )
    if status:
        query = query.where(Job.status == status)
    
    result = await db.execute(query)
    rows = result.all()
    jobs = []
    for job, count, unread in rows:
        setattr(job, 'bid_count', count)
        setattr(job, 'unread_bid_count', unread or 0)
        jobs.append(job)
    return jobs

async def get_job(db: AsyncSession, job_id: int):
    query = (
        select(
            Job,
            func.count(Bid.bid_id).label('bid_count'),
            func.sum(case((Bid.is_read == False, 1), else_=0)).label('unread_bid_count')
        )
        .outerjoin(Bid, Job.job_id == Bid.job_id)
        .where(Job.job_id == job_id)
        .group_by(Job.job_id)
    )
    result = await db.execute(query)
    row = result.first()
    if row:
        job, count, unread = row
        setattr(job, 'bid_count', count)
        setattr(job, 'unread_bid_count', unread or 0)
        return job
    return None

async def update_job(db: AsyncSession, job_id: int, obj_in: JobUpdate):
    db_job = await get_job(db, job_id)
    if db_job:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field in update_data:
            setattr(db_job, field, update_data[field])
        await db.commit()
        await db.refresh(db_job)
    return db_job

async def toggle_saved_job(db: AsyncSession, job_id: int, user_id: int):
    # Check if already saved
    result = await db.execute(select(SavedJob).where(SavedJob.job_id == job_id, SavedJob.user_id == user_id))
    saved_job = result.scalars().first()
    
    if saved_job:
        # Unsave
        await db.execute(delete(SavedJob).where(SavedJob.saved_id == saved_job.saved_id))
        await db.commit()
        return {"status": "unsaved"}
    else:
        # Save
        new_saved_job = SavedJob(job_id=job_id, user_id=user_id)
        db.add(new_saved_job)
        await db.commit()
        return {"status": "saved"}

async def get_saved_jobs(db: AsyncSession, user_id: int):
    # Get all jobs saved by the user
    query = select(Job).join(SavedJob, Job.job_id == SavedJob.job_id).where(SavedJob.user_id == user_id).order_by(SavedJob.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

async def get_recommended_freelancers(db: AsyncSession, job_id: int):
    job = await get_job(db, job_id)
    if not job:
        return []

    # Subqueries for aggregation to avoid cartesian products
    avg_rating_subq = (
        select(Review.reviewee_id, func.avg(Review.rating).label('avg_rating'))
        .group_by(Review.reviewee_id)
        .subquery()
    )

    project_stats_subq = (
        select(
            Project.freelancer_id,
            func.count(Project.project_id).label('total_projects'),
            func.sum(case((Project.status == 'completed', 1), else_=0)).label('completed_projects')
        )
        .group_by(Project.freelancer_id)
        .subquery()
    )

    query = (
        select(User)
        .outerjoin(avg_rating_subq, User.user_id == avg_rating_subq.c.reviewee_id)
        .outerjoin(project_stats_subq, User.user_id == project_stats_subq.c.freelancer_id)
        .where(User.role == 'freelancer')
    )

    if job.category:
        category_like = f"%{job.category}%"
        # Match if category is in skills or bio
        query = query.where(
            (func.lower(User.skills).like(func.lower(category_like))) | 
            (func.lower(User.bio).like(func.lower(category_like)))
        )
        
    total_projects = func.coalesce(project_stats_subq.c.total_projects, 0)
    completed_projects = func.coalesce(project_stats_subq.c.completed_projects, 0)
    success_rate = (completed_projects * 1.0) / func.nullif(total_projects, 0)
    
    order_clause = [
        func.coalesce(User.hourly_rate, 99999).asc(),
        func.coalesce(success_rate, 0).desc(),
        func.coalesce(avg_rating_subq.c.avg_rating, 0).desc(),
        total_projects.desc()
    ]

    # Only consider freelancers who have placed a PENDING bid on THIS specific job
    query = (
        select(User)
        .join(Bid, Bid.freelancer_id == User.user_id)
        .outerjoin(avg_rating_subq, User.user_id == avg_rating_subq.c.reviewee_id)
        .outerjoin(project_stats_subq, User.user_id == project_stats_subq.c.freelancer_id)
        .where(User.role == 'freelancer')
        .where(Bid.job_id == job_id)
        .where(Bid.status == 'pending')
        .order_by(*order_clause)
        .limit(1)
    )
    
    result = await db.execute(query)
    freelancers = result.scalars().all()

    return freelancers
