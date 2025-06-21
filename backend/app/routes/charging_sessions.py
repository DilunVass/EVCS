from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from datetime import datetime
from app.schemas.charging_session import (
    ChargingSessionCreate,
    ChargingSessionUpdate,
    ChargingSessionResponse,
    SimulationData,
    SessionAnalytics
)
from app.services import charging_sessions as session_service
from app.security.dependencies import get_current_user, require_admin
from app.schemas.user import UserResponse

router = APIRouter()

@router.post("/sessions", response_model=dict)
async def create_session(
    session: ChargingSessionCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new charging session."""
    try:
        # Ensure user can only create sessions for themselves (unless admin)
        if current_user.role != "admin" and session.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only create sessions for yourself"
            )
        
        result = await session_service.create_charging_session(session)
        return {"message": "Charging session created successfully", "data": result}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create charging session: {str(e)}"
        )

@router.get("/sessions", response_model=List[ChargingSessionResponse])
async def get_sessions(
    current_user: UserResponse = Depends(get_current_user),
    station_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    skip: int = Query(0, ge=0)
):
    """Get charging sessions (users see only their own, admins see all)."""
    try:
        user_id = None if current_user.role == "admin" else current_user.id
        
        sessions = await session_service.get_all_charging_sessions(
            user_id=user_id,
            station_id=station_id,
            status=status,
            limit=limit,
            skip=skip
        )
        return sessions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch charging sessions: {str(e)}"
        )

@router.get("/sessions/{session_id}", response_model=ChargingSessionResponse)
async def get_session(
    session_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get a charging session by ID."""
    session = await session_service.get_charging_session_by_id(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Charging session not found"
        )
    
    # Check if user can access this session
    if current_user.role != "admin" and session["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own sessions"
        )
    
    return session

@router.put("/sessions/{session_id}")
async def update_session(
    session_id: str,
    session_update: ChargingSessionUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update a charging session."""
    # Check if session exists and user has access
    existing_session = await session_service.get_charging_session_by_id(session_id)
    if not existing_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Charging session not found"
        )
    
    if current_user.role != "admin" and existing_session["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own sessions"
        )
    
    success = await session_service.update_charging_session(session_id, session_update)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update charging session"
        )
    
    return {"message": "Charging session updated successfully"}

@router.post("/sessions/{session_id}/complete")
async def complete_session(
    session_id: str,
    final_charge_level: float = Query(..., ge=0, le=100),
    energy_consumed: Optional[float] = Query(None, ge=0),
    current_user: UserResponse = Depends(get_current_user)
):
    """Complete a charging session."""
    # Check if session exists and user has access
    existing_session = await session_service.get_charging_session_by_id(session_id)
    if not existing_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Charging session not found"
        )
    
    if current_user.role != "admin" and existing_session["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only complete your own sessions"
        )
    
    success = await session_service.complete_charging_session(
        session_id, final_charge_level, energy_consumed
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to complete charging session"
        )
    
    return {"message": "Charging session completed successfully"}

@router.post("/sessions/simulation-data")
async def process_simulation_data(
    data: SimulationData,
    current_user: UserResponse = Depends(require_admin)
):
    """Process raw simulation data (Admin only)."""
    try:
        success = await session_service.process_simulation_data(data)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to process simulation data"
            )
        
        return {"message": "Simulation data processed successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process simulation data: {str(e)}"
        )

@router.get("/analytics", response_model=SessionAnalytics, dependencies=[Depends(require_admin)])
async def get_analytics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    station_id: Optional[str] = Query(None),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get charging session analytics (Admin only)."""
    try:
        analytics = await session_service.get_session_analytics(start_date, end_date, station_id)
        return analytics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch analytics: {str(e)}"
        )

@router.get("/users/{user_id}/sessions", response_model=List[ChargingSessionResponse])
async def get_user_sessions(
    user_id: str,
    current_user: UserResponse = Depends(get_current_user),
    limit: int = Query(50, le=100)
):
    """Get all sessions for a specific user."""
    # Check if user can access these sessions
    if current_user.role != "admin" and user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own sessions"
        )
    
    try:
        sessions = await session_service.get_user_sessions(user_id, limit)
        return sessions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user sessions: {str(e)}"
        )

@router.get("/stations/{station_id}/sessions", response_model=List[ChargingSessionResponse], dependencies=[Depends(require_admin)])
async def get_station_sessions(
    station_id: str,
    current_user: UserResponse = Depends(get_current_user),
    limit: int = Query(50, le=100)
):
    """Get all sessions for a specific station (Admin only)."""
    try:
        sessions = await session_service.get_station_sessions(station_id, limit)
        return sessions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch station sessions: {str(e)}"
        )