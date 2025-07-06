from app.database import users_collection
from app.schemas.user import UserCreate, Vehicle
from app.security.auth import hash_password
from bson import ObjectId
from datetime import datetime

async def get_user_by_username(username: str):
    """Fetch a user by username."""
    user = await users_collection.find_one({"username": username})
    if user:
        user["_id"] = str(user["_id"])  # Convert ObjectId to string
        # Ensure role field exists, default to "user" if missing
        if "role" not in user:
            user["role"] = "user"
        # Add creation date if not exists
        if "createdAt" not in user:
            user["createdAt"] = datetime.now()
    return user


async def create_user(user: UserCreate):
    """Create a new user with vehicles and hashed password."""
    hashed_password = hash_password(user.password)

    new_user = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "role": user.role,  # Include role field
        "vehicles": [vehicle.model_dump() for vehicle in user.vehicles],  # Convert Pydantic models to dicts
        "createdAt": datetime.now()  # Add creation timestamp
    }

    result = await users_collection.insert_one(new_user)
    return {
        "id": str(result.inserted_id), 
        "username": user.username, 
        "email": user.email, 
        "role": user.role,
        "vehicles": user.vehicles
    }

async def add_vehicle(username: str, vehicle: Vehicle):
    """Add a vehicle to an existing user."""
    result = await users_collection.update_one(
        {"username": username},
        {"$push": {"vehicles": vehicle.model_dump()}}
    )
    return result.modified_count > 0  # Returns True if updated

async def update_user_role(username: str, role: str):
    """Update user role (admin function)."""
    result = await users_collection.update_one(
        {"username": username},
        {"$set": {"role": role}}
    )
    return result.modified_count > 0

async def get_user_by_id(user_id: str):
    """Fetch a user by ID."""
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            user["_id"] = str(user["_id"])
            if "role" not in user:
                user["role"] = "user"
        return user
    except:
        return None