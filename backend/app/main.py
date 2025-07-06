from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import user, charging_station, charging_sessions, payment, protected

app = FastAPI(title="EVCS Digital Twin API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # Alternative React port
        "*"  
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

app.include_router(user.router, prefix="/auth", tags=["Auth"])
app.include_router(charging_station.router, prefix="/api", tags=["Charging Stations"])
app.include_router(charging_sessions.router, prefix="/api", tags=["Charging Sessions"])
app.include_router(payment.router, prefix="/api", tags=["Payments"])
app.include_router(protected.router, prefix="/protected", tags=["protected"])

@app.get("/")
async def root():
    return {"message": "EVCS Digital Twin API is running"}