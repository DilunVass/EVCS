from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Literal
from bson import ObjectId
from datetime import datetime

class Vehicle(BaseModel):
    """Schema for storing vehicles inside a user."""
    vehicleNumber: str
    vehicleType: str
    batteryCapacity: int
    maxChargeRate: int
    batteryLevel: Optional[int] = None
    chargingHistory: Optional[List[dict]] = []
    totalKwh: Optional[float] = 0.0

class User(BaseModel):
    """Schema for storing user data."""
    id: Optional[ObjectId] = None
    username: str
    email: EmailStr
    role: Literal["user", "admin"] = "user"
    vehicles: List[Vehicle] = []
    createdAt: Optional[datetime] = None

    class Config:
        """Configuration for the User model."""
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }
        populate_by_name = True
        arbitrary_types_allowed = True

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Literal["user", "admin"] = "user"
    vehicles: List[Vehicle] = []

class UserLogin(BaseModel):
    """Schema for user login."""
    username: str
    password: str

class UserResponse(BaseModel):
    """Schema for returning user details (response)."""
    id: str 
    username: str
    email: str
    role: str
    vehicles: List[Vehicle] = []
    createdAt: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat() if dt else None
        }
