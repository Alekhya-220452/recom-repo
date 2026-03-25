from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from fastapi import HTTPException
from datetime import datetime
from .models import SupportTicket, Dispute
from .schemas import SupportTicketCreate, DisputeDecision
from projects.models import Project
from jobs.models import Job
from payments.models import Transaction
from auth.models import User
from notifications.service import create_notification
from notifications.schemas import NotificationCreate

async def create_ticket(db: AsyncSession, ticket_data: SupportTicketCreate, user_id: int = None):
    new_ticket = SupportTicket(
        user_id=user_id,
        subject=ticket_data.subject,
        category=ticket_data.category,
        description=ticket_data.description
    )
    db.add(new_ticket)
    await db.flush() # Ensure ticket_id is generated
    await db.refresh(new_ticket)
    return new_ticket

async def get_all_disputes(db: AsyncSession, status: str = None):
    query = select(Dispute)
    if status and status != 'all':
        query = query.where(Dispute.status == status)
    result = await db.execute(query)
    return result.scalars().all()

async def get_dispute_detail(db: AsyncSession, dispute_id: int):
    query = select(Dispute).where(Dispute.dispute_id == dispute_id)
    result = await db.execute(query)
    dispute = result.scalars().first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
        
    project_query = select(Project).where(Project.project_id == dispute.project_id)
    project_result = await db.execute(project_query)
    project = project_result.scalars().first()
    
    job_query = select(Job).where(Job.job_id == dispute.job_id)
    job_result = await db.execute(job_query)
    job = job_result.scalars().first()
    
    # Get client name
    client_q = select(User).where(User.user_id == project.client_id)
    client_res = await db.execute(client_q)
    client = client_res.scalars().first()
    
    # Get freelancer name
    free_q = select(User).where(User.user_id == project.freelancer_id)
    free_res = await db.execute(free_q)
    freelancer = free_res.scalars().first()

    return {
        "dispute_id": dispute.dispute_id,
        "job_id": dispute.job_id,
        "project_id": dispute.project_id,
        "raised_by_id": dispute.raised_by_id,
        "reason": dispute.reason,
        "description": dispute.description,
        "status": dispute.status,
        "created_at": dispute.created_at,
        "admin_id": dispute.admin_id,
        "admin_decision": dispute.admin_decision,
        "admin_notes": dispute.admin_notes,
        "resolved_at": dispute.resolved_at,
        "client_name": client.name if client else "Unknown Client",
        "freelancer_name": freelancer.name if freelancer else "Unknown Freelancer",
        "job_title": job.title if job else "Unknown Job",
        "job_description": job.description if job else "No specific description.",
        "work_notes": project.work_notes if project else "No work was submitted.",
        "escrow_amount": float(job.budget) if job else 0.0,
    }

async def resolve_dispute(db: AsyncSession, dispute_id: int, decision_data: DisputeDecision, admin_id: int):
    query = select(Dispute).where(Dispute.dispute_id == dispute_id)
    result = await db.execute(query)
    dispute = result.scalars().first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
        
    if dispute.status != 'open':
        raise HTTPException(status_code=400, detail="Dispute is already resolved")

    project_query = select(Project).where(Project.project_id == dispute.project_id)
    project_result = await db.execute(project_query)
    project = project_result.scalars().first()

    job_query = select(Job).where(Job.job_id == dispute.job_id)
    job_result = await db.execute(job_query)
    job = job_result.scalars().first()

    escrow_q = select(Transaction).where(Transaction.project_id == dispute.project_id, Transaction.status == 'LOCKED')
    escrow_res = await db.execute(escrow_q)
    transaction = escrow_res.scalars().first()

    if decision_data.decision == "RELEASE":
        dispute.status = "resolved"
        dispute.admin_decision = "RELEASE"
        if transaction:
            transaction.status = "RELEASED"  # releases to freelancer
        if project:
            project.status = "completed"
        if job:
            job.status = "completed"
    elif decision_data.decision == "REFUND":
        dispute.status = "resolved"
        dispute.admin_decision = "REFUND"
        if transaction:
            transaction.status = "REFUNDED"  # returns to client
        if project:
            project.status = "cancelled"
        if job:
            job.status = "cancelled"
    else:
        raise HTTPException(status_code=400, detail="Invalid decision")

    dispute.admin_id = admin_id
    dispute.admin_notes = decision_data.notes
    dispute.resolved_at = datetime.utcnow()

    await db.commit()
    await db.refresh(dispute)
    
    # Notify Client
    await create_notification(db, NotificationCreate(
        user_id=project.client_id,
        title="Dispute Resolved",
        message=f"Admin has resolved the dispute for Job #{project.job_id}. Payment has been {dispute.admin_decision.lower()}ED.",
        link=f"/projects/{project.project_id}"
    ))
    
    # Notify Freelancer
    await create_notification(db, NotificationCreate(
        user_id=project.freelancer_id,
        title="Dispute Resolved",
        message=f"Admin has resolved the dispute for Job #{project.job_id}. Payment has been {dispute.admin_decision.lower()}ED.",
        link=f"/projects/{project.project_id}"
    ))
    
    return dispute
