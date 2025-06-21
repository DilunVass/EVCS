from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGO_URI, DATABASE_NAME

client = AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]

# Collections
users_collection = db["users"]
charging_stations_collection = db["charging_stations"]
charging_sessions_collection = db["charging_sessions"] 