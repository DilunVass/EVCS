from fastapi import APIRouter, HTTPException, Depends
from app.schemas.user import UserResponse
from app.services.user import get_user_by_username
from app.security.auth import get_current_user

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
async def get_user_profile(current_user: str = Depends(get_current_user)):
    """Get current user's profile with all vehicles"""
    user = await get_user_by_username(current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert the user data to match UserResponse schema
    return UserResponse(
        id=user["_id"],
        username=user["username"],
        email=user["email"],
        role=user.get("role", "user"),
        vehicles=user.get("vehicles", [])
    )