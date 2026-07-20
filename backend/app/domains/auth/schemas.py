from pydantic import BaseModel
from typing import Optional
from .models import UserRole

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.TEACHER

class User(UserBase):
    id: int
    role: UserRole
    
    # Enable from_attributes for Pydantic V2 or orm_mode for V1
    class Config:
        orm_mode = True
        from_attributes = True
