from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import user, charging_station, charging_sessions

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporarily allow all origins for testing
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(user.router, prefix="/auth", tags=["Auth"])
app.include_router(charging_station.router, prefix="/api", tags=["Charging Stations"])
app.include_router(charging_sessions.router, prefix="/api", tags=["Charging Sessions"])