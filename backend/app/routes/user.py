from fastapi import APIRouter, HTTPException, Depends
from app.schemas.user import UserCreate, UserLogin, UserResponse, Vehicle
from app.services.user import create_user, get_user_by_username, add_vehicle
from app.security.auth import verify_password, create_jwt_token, get_current_user

router = APIRouter()


@router.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate):
    """User signup with vehicle support"""
    if await get_user_by_username(user.username):
        raise HTTPException(status_code=400, detail="Username already registered")

    return await create_user(user)


@router.post("/login")
async def login(user: UserLogin):
    """User login and JWT generation"""
    db_user = await get_user_by_username(user.username)
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_jwt_token({"sub": db_user["username"]})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/vehicle")
async def add_user_vehicle(vehicle: Vehicle, current_user: str = Depends(get_current_user)):
    """Add a new vehicle to the current user"""
    success = await add_vehicle(current_user, vehicle)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to add vehicle")

    return {"message": "Vehicle added successfully"}


@router.post("/{username}/vehicle")
async def add_user_vehicle_by_username(username: str, vehicle: Vehicle):
    """Add a new vehicle to a user (admin function)"""
    if not await get_user_by_username(username):
        raise HTTPException(status_code=404, detail="User not found")

    success = await add_vehicle(username, vehicle)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to add vehicle")

    return {"message": "Vehicle added successfully"}