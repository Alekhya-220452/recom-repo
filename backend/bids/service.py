from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from bids.models import Bid
from bids.schemas import BidCreate
from jobs.service import get_job
from notifications.service import create_notification
from notifications.schemas import NotificationCreate

async def create_bid(db: AsyncSession, bid: BidCreate, freelancer_id: int):
    # Verify job exists and is open
    job = await get_job(db, bid.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != 'open':
        raise HTTPException(status_code=400, detail="Job is not open for bidding")
        
    db_bid = Bid(
        job_id=bid.job_id,
        freelancer_id=freelancer_id,
        proposal_text=bid.proposal_text,
        bid_amount=bid.bid_amount
    )
    db.add(db_bid)
    
    try:
        await db.commit()
        await db.refresh(db_bid)
        
        # Notify the client
        await create_notification(db, NotificationCreate(
            user_id=job.client_id,
            title="New Bid Received",
            message=f"You have a new bid on your job: {job.title}",
            link=f"/jobs/{job.job_id}" # Or wherever is appropriate
        ))
        
        return db_bid
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="You have already bid on this job")

async def mark_bids_as_read(db: AsyncSession, job_id: int):
    result = await db.execute(select(Bid).where(Bid.job_id == job_id, Bid.is_read == False))
    bids = result.scalars().all()
    for b in bids:
        b.is_read = True
    await db.commit()
    return True

async def get_bids_for_job(db: AsyncSession, job_id: int):
    result = await db.execute(select(Bid).where(Bid.job_id == job_id))
    return result.scalars().all()

async def get_bid(db: AsyncSession, bid_id: int):
    result = await db.execute(select(Bid).where(Bid.bid_id == bid_id))
    return result.scalars().first()

async def get_user_bids(db: AsyncSession, freelancer_id: int):
    result = await db.execute(select(Bid).where(Bid.freelancer_id == freelancer_id))
    return result.scalars().all()

async def accept_bid(db: AsyncSession, bid_id: int, client_id: int):
    # Get the bid and its associated job
    bid = await get_bid(db, bid_id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
        
    job = await get_job(db, bid.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if job.client_id != client_id:
        raise HTTPException(status_code=403, detail="You are not authorized to accept bids for this job")
        
    if job.status != 'open':
        raise HTTPException(status_code=400, detail="Job no longer open")
        
    # Accept this bid, reject others
    bids = await get_bids_for_job(db, job.job_id)
    for b in bids:
        b.status = 'accepted' if b.bid_id == bid_id else 'rejected'
        
    job.status = 'pending_escrow'
    job.budget = bid.bid_amount  # Override original job budget with accepted bid
    
    await db.commit()
    await db.refresh(bid)

    # Notify the freelancer
    await create_notification(db, NotificationCreate(
        user_id=bid.freelancer_id,
        title="Mission Assigned",
        message=f"Commander has accepted your proposal for Job #{job.job_id}. Report for duty.",
        link=f"/projects/{job.job_id}" # Since create_project uses job_id for projects usually
    ))

    # Optional: Notify rejected freelancers
    for b in bids:
        if b.bid_id != bid_id:
            await create_notification(db, NotificationCreate(
                user_id=b.freelancer_id,
                title="Mission Dossier Closed",
                message=f"Transmission terminated for Job #{job.job_id}. Another operative was assigned.",
                link=f"/jobs/{job.job_id}"
            ))

    return bid
