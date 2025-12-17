import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import user, charging_station, charging_sessions, payment, protected
from app.database import client

app = FastAPI(title="EVCS Digital Twin API", version="1.0.0")

# Get allowed origins from environment variable or use defaults
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", 
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,https://evcs-client-121646825275.us-central1.run.app,https://evcs-frontend-121646825275.us-central1.run.app"
).split(",")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Test database connection on startup"""
    try:
        # Test the connection
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        print("⚠️  Application will fail")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    client.close()

app.include_router(user.router, prefix="/auth", tags=["Auth"])
app.include_router(charging_station.router, prefix="/api", tags=["Charging Stations"])
app.include_router(charging_sessions.router, prefix="/api", tags=["Charging Sessions"])
app.include_router(payment.router, prefix="/api", tags=["Payments"])
app.include_router(protected.router, prefix="/protected", tags=["protected"])

@app.get("/")
async def root():
    return {"message": "EVCS Digital Twin API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint for Cloud Run"""
    try:
        await client.admin.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# This is important for Cloud Run - remove the if __name__ == "__main__" block
# Cloud Run will use a WSGI/ASGI server to run the app