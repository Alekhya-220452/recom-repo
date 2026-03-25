from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from jobs import schemas, service
from auth.service import get_current_user
from auth.schemas import UserOut

router = APIRouter()

@router.post("", response_model=schemas.JobOut, status_code=status.HTTP_201_CREATED)
async def create_job(
    job: schemas.JobCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role != 'client':
        raise HTTPException(status_code=403, detail="Only clients can post jobs.")
    return await service.create_job(db=db, job=job, client_id=current_user.user_id)

@router.get("", response_model=List[schemas.JobOut])
async def list_jobs(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    return await service.get_jobs(db=db, status=status)

@router.get("/saved", response_model=List[schemas.JobOut])
async def get_saved_jobs_route(
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role != 'freelancer':
        raise HTTPException(status_code=403, detail="Only freelancers can see saved jobs.")
    return await service.get_saved_jobs(db=db, user_id=current_user.user_id)

@router.post("/{job_id}/save")
async def toggle_save_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role != 'freelancer':
        raise HTTPException(status_code=403, detail="Only freelancers can save jobs.")
        
    job = await service.get_job(db=db, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return await service.toggle_saved_job(db=db, job_id=job_id, user_id=current_user.user_id)

@router.get("/{job_id}", response_model=schemas.JobOut)
async def get_job(
    job_id: int,
    db: AsyncSession = Depends(get_db)
):
    job = await service.get_job(db=db, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.patch("/{job_id}", response_model=schemas.JobOut)
async def update_job(
    job_id: int,
    job_in: schemas.JobUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    job = await service.get_job(db=db, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.client_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this job")
    return await service.update_job(db=db, job_id=job_id, obj_in=job_in)

@router.get("/{job_id}/recommendations", response_model=List[UserOut])
async def get_recommended_freelancers_route(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    job = await service.get_job(db=db, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if current_user.role != 'client' or job.client_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view recommendations for this job")
        
    freelancers = await service.get_recommended_freelancers(db=db, job_id=job_id)
    return freelancers
