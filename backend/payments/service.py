from typing import List
from sqlalchemy.future import select
from sqlalchemy import or_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from payments.models import Transaction
from payments.schemas import TransactionCreate
from projects.service import get_project
from notifications.service import create_notification
from notifications.schemas import NotificationCreate

async def hold_payment(db: AsyncSession, transaction: TransactionCreate, client_id: int):
    # Verify project exists and belongs to the client
    project = await get_project(db, transaction.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.client_id != client_id:
        raise HTTPException(status_code=403, detail="Only the project client can hold payment")
        
    db_transaction = Transaction(
        project_id=project.project_id,
        client_id=client_id,
        freelancer_id=project.freelancer_id,
        amount=transaction.amount,
        status='held'
    )
    db.add(db_transaction)
    await db.commit()
    await db.refresh(db_transaction)

    # Notify both parties
    # For Client: Recent activity
    await create_notification(db, NotificationCreate(
        user_id=client_id,
        title="Payment Processed",
        message=f"You have successfully authorized payment of ${transaction.amount} for Mission #{project.project_id}.",
        link=f"/projects/{project.project_id}"
    ))
    
    return db_transaction

async def release_payment(db: AsyncSession, project_id: int, client_id: int):
    # Get the held transaction for this project
    query = select(Transaction).where(
        Transaction.project_id == project_id,
        Transaction.status == 'held'
    )
    result = await db.execute(query)
    transaction = result.scalars().first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="No held payment found for this project")
    if transaction.client_id != client_id:
        raise HTTPException(status_code=403, detail="Only the client can release payment")
        
    transaction.status = 'released'
    await db.commit()
    await db.refresh(transaction)
    return transaction

import stripe
from config import settings
from jobs.service import get_job

stripe.api_key = settings.STRIPE_SECRET_KEY

async def get_transaction_history(db: AsyncSession, user_id: int):
    query = select(Transaction).where(or_(Transaction.client_id == user_id, Transaction.freelancer_id == user_id))
    result = await db.execute(query)
    return result.scalars().all()

async def create_payment_intent(db: AsyncSession, project_id: int, client_id: int):
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.client_id != client_id:
        raise HTTPException(status_code=403, detail="Only the project client can deposit escrow.")
    
    job = await get_job(db, project.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    amount_in_cents = int(job.budget * 100)

    # If no real Stripe key is configured, return a simulated intent for dev/demo
    DUMMY_KEYS = {"sk_test_dummy_key", "sk_test_*****_key", "", None}
    if not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY in DUMMY_KEYS or "dummy" in settings.STRIPE_SECRET_KEY:
        simulated_secret = f"pi_simulated_{project_id}_{client_id}_secret_demo"
        return {"client_secret": simulated_secret}

    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_in_cents,
            currency="usd",
            metadata={
                "project_id": str(project_id),
                "client_id": str(client_id),
                "freelancer_id": str(project.freelancer_id),
                "amount": str(job.budget)
            }
        )
        return {"client_secret": intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

async def handle_stripe_webhook(db: AsyncSession, payload: bytes, sig_header: str):
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        if settings.DEBUG:
            import json
            event = json.loads(payload)
        else:
            raise HTTPException(status_code=400, detail="Invalid signature")

    # For testing, accept also raw events or fake events without signature if necessary
    # In production, signature must match.

    if event['type'] == 'payment_intent.succeeded':
        intent = event['data']['object']
        metadata = intent.get('metadata', {})
        proj_id = int(metadata.get('project_id', 0))
        
        if proj_id:
            project = await get_project(db, proj_id)
            if project and project.status == 'pending_escrow':
                # Create the Locked Escrow Transaction
                db_transaction = Transaction(
                    project_id=project.project_id,
                    client_id=project.client_id,
                    freelancer_id=project.freelancer_id,
                    amount=float(metadata.get('amount', 0)),
                    status='LOCKED'
                )
                db.add(db_transaction)
                
                # Update Project and Job status
                project.status = 'active'
                job = await get_job(db, project.job_id)
                if job:
                    job.status = 'in_progress'

                await db.commit()
                
                # Notify Freelancer
                await create_notification(db, NotificationCreate(
                    user_id=project.freelancer_id,
                    title="Mission Funded",
                    message=f"Escrow funded for Mission #{project.project_id}. You may commence operations.",
                    link=f"/projects/{project.project_id}"
                ))

    return {"status": "success"}
