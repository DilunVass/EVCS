import os
from dotenv import load_dotenv

# Load environment variables from .env file (for local development)
load_dotenv()

# Get environment variables with defaults for Cloud Run
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "EVCS")  # Default to "EVCS"
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Validate required environment variables
if not MONGO_URI:
    raise ValueError("MONGO_URI environment variable is required")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required")

print(f"Database Name: {DATABASE_NAME}")
print(f"Mongo URI configured: {'Yes' if MONGO_URI else 'No'}")
