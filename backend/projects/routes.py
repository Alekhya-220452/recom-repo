from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from projects import schemas, service
from auth.service import get_current_user
from auth.schemas import UserOut

router = APIRouter()

@router.post("", response_model=schemas.ProjectOut, status_code=status.HTTP_201_CREATED)
async def create_project(
    project: schemas.ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role != 'client':
        raise HTTPException(status_code=403, detail="Only clients can create projects.")
    return await service.create_project(db=db, project=project, client_id=current_user.user_id)

@router.get("", response_model=List[schemas.ProjectOut])
async def list_my_projects(
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    return await service.get_projects(db=db, user_id=current_user.user_id)

@router.get("/{project_id}", response_model=schemas.ProjectOut)
async def get_project_by_id(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    project = await service.get_project(db=db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    # Allow admin, the client, or the freelancer to view
    if current_user.role != 'admin' and project.client_id != current_user.user_id and project.freelancer_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return project

@router.post("/{project_id}/submit-work", response_model=schemas.ProjectOut)
async def submit_work(
    project_id: int,
    submission: schemas.WorkSubmission,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role != 'freelancer':
        raise HTTPException(status_code=403, detail="Only freelancers can submit work.")
    return await service.submit_work(db=db, project_id=project_id, submission=submission, freelancer_id=current_user.user_id)

@router.put("/{project_id}/approve", response_model=schemas.ProjectOut)
async def approve_work(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role != 'client':
        raise HTTPException(status_code=403, detail="Only clients can approve work.")
    return await service.approve_work(db=db, project_id=project_id, client_id=current_user.user_id)

@router.put("/{project_id}/request-changes", response_model=schemas.ProjectOut)
async def request_changes(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role != 'client':
        raise HTTPException(status_code=403, detail="Only clients can request changes.")
    return await service.request_changes(db=db, project_id=project_id, client_id=current_user.user_id)

@router.post("/{project_id}/dispute", status_code=status.HTTP_201_CREATED)
async def raise_dispute(
    project_id: int,
    dispute: schemas.DisputeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    return await service.raise_dispute(db=db, project_id=project_id, user_id=current_user.user_id, dispute=dispute)
