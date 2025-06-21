from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.schemas.charging_station import (
    ChargingStationCreate, 
    ChargingStationUpdate, 
    ChargingStationStatusUpdate,
    ChargingStationResponse
)
from app.services import charging_station as station_service
from app.security.dependencies import get_current_user, require_admin
from app.schemas.user import UserResponse

router = APIRouter()

@router.post("/stations", response_model=dict, dependencies=[Depends(require_admin)])
async def create_station(
    station: ChargingStationCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new charging station (Admin only)."""
    try:
        result = await station_service.create_charging_station(station)
        return {"message": "Charging station created successfully", "data": result}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create charging station: {str(e)}"
        )

@router.get("/stations", response_model=List[ChargingStationResponse])
async def get_all_stations():
    """Get all charging stations (Public access)."""
    try:
        stations = await station_service.get_all_charging_stations()
        return stations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch charging stations: {str(e)}"
        )

@router.get("/stations/{station_id}", response_model=ChargingStationResponse)
async def get_station(station_id: str):
    """Get a charging station by ID (Public access)."""
    station = await station_service.get_charging_station_by_id(station_id)
    if not station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Charging station not found"
        )
    return station

@router.put("/stations/{station_id}", dependencies=[Depends(require_admin)])
async def update_station(
    station_id: str,
    station_update: ChargingStationUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update a charging station (Admin only)."""
    # Check if station exists
    existing_station = await station_service.get_charging_station_by_id(station_id)
    if not existing_station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Charging station not found"
        )
    
    success = await station_service.update_charging_station(station_id, station_update)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update charging station"
        )
    
    return {"message": "Charging station updated successfully"}

@router.patch("/stations/{station_id}/status")
async def update_station_status(
    station_id: str,
    status_update: ChargingStationStatusUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update charging station status (Any authenticated user)."""
    # Check if station exists
    existing_station = await station_service.get_charging_station_by_id(station_id)
    if not existing_station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Charging station not found"
        )
    
    success = await station_service.update_charging_station_status(station_id, status_update)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update charging station status"
        )
    
    return {"message": "Charging station status updated successfully"}

@router.delete("/stations/{station_id}", dependencies=[Depends(require_admin)])
async def delete_station(
    station_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete a charging station (Admin only)."""
    # Check if station exists
    existing_station = await station_service.get_charging_station_by_id(station_id)
    if not existing_station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Charging station not found"
        )
    
    success = await station_service.delete_charging_station(station_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to delete charging station"
        )
    
    return {"message": "Charging station deleted successfully"}