from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm

from auth import schemas, service
from database import get_db
from config import settings
from typing import List, Optional

router = APIRouter()

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = await service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if user.role not in ['client', 'freelancer']:
        raise HTTPException(status_code=400, detail="Role must be either 'client' or 'freelancer'")
        
    return await service.create_user(db=db, user=user)

@router.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await service.get_user_by_email(db, email=form_data.username)
    if not user or not service.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = service.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google-login", response_model=schemas.Token)
async def google_login(login_data: schemas.GoogleLogin, db: AsyncSession = Depends(get_db)):
    user = await service.google_login(db, login_data.token, login_data.role)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = service.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/profile", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(service.get_current_user)):
    return current_user

@router.get("/users/{user_id}", response_model=schemas.UserOut)
async def read_user_profile(user_id: int, db: AsyncSession = Depends(get_db)):
    db_user = await service.get_user_by_id(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.get("/users", response_model=List[schemas.UserOut])
async def read_users(role: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    return await service.get_users(db, role)

@router.get("/users/{user_id}/stats", response_model=schemas.UserStats)
async def read_user_stats(user_id: int, role: str, db: AsyncSession = Depends(get_db)):
    return await service.get_user_stats(db, user_id, role)

@router.put("/profile", response_model=schemas.UserUpdateOut)
async def update_user_profile(
    user_update: schemas.UserUpdate, 
    current_user: schemas.User = Depends(service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    old_email = current_user.email
    updated_user = await service.update_user(db, current_user, user_update)
    
    response = {"user": updated_user}
    
    # If email changed, issue a new token
    if updated_user.email != old_email:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        new_token = service.create_access_token(
            data={"sub": updated_user.email}, expires_delta=access_token_expires
        )
        response["access_token"] = new_token
        response["token_type"] = "bearer"
        
    return response
@router.post("/verify-password")
async def verify_password(
    password_data: schemas.PasswordVerify,
    current_user: schemas.UserOut = Depends(service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch the full user model to get password_hash
    db_user = await service.get_user_by_id(db, user_id=current_user.user_id)
    if not service.verify_password(password_data.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Authorization password incorrect")
    return {"message": "Verified"}
