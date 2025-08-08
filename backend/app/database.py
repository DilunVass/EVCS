from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGO_URI, DATABASE_NAME

# Validate that we have the required configuration
if not MONGO_URI:
    raise ValueError("MONGO_URI is not configured")
if not DATABASE_NAME:
    raise ValueError("DATABASE_NAME is not configured")

# Create MongoDB client with timeout settings
client = AsyncIOMotorClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000,  # 5 seconds
    connectTimeoutMS=5000,         # 5 seconds
    socketTimeoutMS=5000,          # 5 seconds
    maxPoolSize=50,
    retryWrites=True
)

db = client[DATABASE_NAME]

# Collections
users_collection = db["users"]
charging_stations_collection = db["charging_stations"]
charging_sessions_collection = db["charging_sessions"]
payments_collection = db["payments"]
refunds_collection = db["refunds"]