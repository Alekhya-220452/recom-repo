from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    bio: Optional[str] = None
    skills: Optional[str] = None
    profile_picture: Optional[str] = None
    hourly_rate: Optional[float] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    profile_picture: Optional[str] = None
    hourly_rate: Optional[float] = None
    current_password: Optional[str] = None

class PasswordVerify(BaseModel):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLogin(BaseModel):
    token: str
    role: Optional[str] = "client"  # Default role if not specified

class UserOut(UserBase):
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdateOut(BaseModel):
    user: UserOut
    access_token: Optional[str] = None
    token_type: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

# Final Refinement bug fix
User = UserOut

class UserStats(BaseModel):
    projects_done: int
    proposals_given: int
    jobs_posted: int
    jobs_done: int
