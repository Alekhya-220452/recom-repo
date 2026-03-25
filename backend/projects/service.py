from typing import List, Optional
from datetime import datetime
from sqlalchemy.future import select
from sqlalchemy import or_
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from projects.models import Project
from projects import schemas
from projects.schemas import ProjectCreate, WorkSubmission
from bids.service import get_bids_for_job
from jobs.service import get_job
from notifications.service import create_notification
from notifications.schemas import NotificationCreate

async def create_project(db: AsyncSession, project: ProjectCreate, client_id: int):
    # Verify the job exists and belongs to the client
    job = await get_job(db, project.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.client_id != client_id:
        raise HTTPException(status_code=403, detail="Only the job owner can create a project")
        
    # Find the accepted bid for this job to get the freelancer_id
    bids = await get_bids_for_job(db, project.job_id)
    accepted_bid = next((b for b in bids if b.status == 'accepted'), None)
    
    if not accepted_bid:
        raise HTTPException(status_code=400, detail="No accepted bid found for this job")
        
    # Ensure project doesn't already exist for this job
    existing_project = await db.execute(select(Project).where(Project.job_id == project.job_id))
    if existing_project.scalars().first():
        raise HTTPException(status_code=400, detail="A project already exists for this job")
        
    db_project = Project(
        job_id=job.job_id,
        client_id=client_id,
        freelancer_id=accepted_bid.freelancer_id,
        status='pending_escrow'
    )
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)

    return db_project

async def get_projects(db: AsyncSession, user_id: int):
    query = select(Project).where(or_(Project.client_id == user_id, Project.freelancer_id == user_id)).options(joinedload(Project.job))
    result = await db.execute(query)
    projects = result.scalars().all()
    for p in projects:
        from auth.models import User
        client_res = await db.execute(select(User.name).where(User.user_id == p.client_id))
        p.client_name = client_res.scalar()
        freelancer_res = await db.execute(select(User.name).where(User.user_id == p.freelancer_id))
        p.freelancer_name = freelancer_res.scalar()
        if p.job:
            setattr(p, 'job_title', p.job.title)
            setattr(p, 'job_budget', p.job.budget)
    return projects

async def get_project(db: AsyncSession, project_id: int):
    result = await db.execute(select(Project).where(Project.project_id == project_id).options(joinedload(Project.job)))
    project = result.scalars().first()
    if project:
        # Get names for the frontend
        from auth.models import User
        client_res = await db.execute(select(User.name).where(User.user_id == project.client_id))
        project.client_name = client_res.scalar()
        freelancer_res = await db.execute(select(User.name).where(User.user_id == project.freelancer_id))
        project.freelancer_name = freelancer_res.scalar()
        if project.job:
            setattr(project, 'job_title', project.job.title)
            setattr(project, 'job_budget', project.job.budget)
    return project

async def submit_work(db: AsyncSession, project_id: int, submission: WorkSubmission, freelancer_id: int):
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.freelancer_id != freelancer_id:
        raise HTTPException(status_code=403, detail="Only the assigned freelancer can submit work")
    if project.status != 'active':
        raise HTTPException(status_code=400, detail="Project is not in active state")
        
    project.status = 'work_submitted'
    project.work_notes = submission.work_notes
    project.submitted_at = datetime.utcnow()
    await db.commit()
    await db.refresh(project)

    # Notify the client
    await create_notification(db, NotificationCreate(
        user_id=project.client_id,
        title="Work Submitted",
        message=f"Operative has submitted work for Mission #{project.project_id}. Review required.",
        link=f"/projects/{project.project_id}"
    ))

    return project

async def approve_work(db: AsyncSession, project_id: int, client_id: int):
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.client_id != client_id:
        raise HTTPException(status_code=403, detail="Only the client can approve work")
    if project.status != 'work_submitted':
        raise HTTPException(status_code=400, detail="No work submitted to approve")
        
    project.status = 'completed'
    project.end_date = datetime.utcnow().date()
    
    # Also update the job status to completed
    job = await get_job(db, project.job_id)
    if job:
        job.status = 'completed'

    # Escrow Release Logic
    from payments.models import Transaction
    escrow_q = select(Transaction).where(
        Transaction.project_id == project_id,
        Transaction.status == 'LOCKED'
    )
    escrow_res = await db.execute(escrow_q)
    transaction = escrow_res.scalars().first()
    if transaction:
        transaction.status = 'RELEASED'

        
    await db.commit()
    await db.refresh(project)

    # Notify the freelancer
    await create_notification(db, NotificationCreate(
        user_id=project.freelancer_id,
        title="Payment Released",
        message=f"Commander has approved Mission #{project.project_id}. Funds released.",
        link=f"/projects/{project.project_id}"
    ))

    return project

async def request_changes(db: AsyncSession, project_id: int, client_id: int):
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.client_id != client_id:
        raise HTTPException(status_code=403, detail="Only the client can request changes")
    if project.status != 'work_submitted':
        raise HTTPException(status_code=400, detail="No work submitted to review")

    project.status = 'active'
    project.work_notes = None

    await db.commit()
    await db.refresh(project)

    # Notify the freelancer
    await create_notification(db, NotificationCreate(
        user_id=project.freelancer_id,
        title="Changes Requested",
        message=f"The client has reviewed Mission #{project.project_id} and is requesting revisions.",
        link=f"/projects/{project.project_id}"
    ))

    return project

from support.models import Dispute

async def raise_dispute(db: AsyncSession, project_id: int, user_id: int, dispute: schemas.DisputeCreate):
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.client_id != user_id and project.freelancer_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    project.status = 'in_dispute'
    
    job = await get_job(db, project.job_id)
    if job:
        job.status = 'in_dispute'
        
    db_dispute = Dispute(
        job_id=job.job_id if job else project.job_id,
        project_id=project.project_id,
        raised_by_id=user_id,
        reason=dispute.reason,
        description=dispute.description,
        status="open"
    )
    db.add(db_dispute)
    
    await db.commit()
    await db.refresh(db_dispute)
    
    # Notify other party
    other_party = project.freelancer_id if user_id == project.client_id else project.client_id
    await create_notification(db, NotificationCreate(
        user_id=other_party,
        title="Dispute Raised",
        message=f"A dispute was raised for Mission #{project.project_id}. Operations halted.",
        link=f"/projects/{project.project_id}"
    ))
    
    return project
