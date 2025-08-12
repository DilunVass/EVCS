from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal, List
from datetime import datetime
from enum import Enum
from bson import ObjectId

class ChargingSession(BaseModel):
    """Schema for charging session data."""
    id: Optional[str] = None
    station_id: str
    slot_id: int
    user_id: str
    vehicle_number: str
    start_time: datetime
    end_time: Optional[datetime] = None
    initial_charge_level: float = Field(ge=0, le=100, description="Initial battery level percentage")
    final_charge_level: Optional[float] = Field(None, ge=0, le=100, description="Final battery level percentage")
    current_charge_level: Optional[float] = Field(None, ge=0, le=100, description="Current battery level percentage")
    energy_consumed: Optional[float] = Field(None, ge=0, description="Energy consumed in kWh")
    cost: Optional[float] = Field(None, ge=0, description="Total cost of charging session")
    status: Literal["active", "completed", "interrupted", "error"] = "active"
    payment_status: Literal["pending", "paid", "failed", "refunded"] = "pending"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat() if v else None
        }
        allow_population_by_field_name = True
        arbitrary_types_allowed = True

class ChargingSessionCreate(BaseModel):
    """Schema for creating a charging session."""
    station_id: str
    slot_id: int
    user_id: str
    vehicle_number: str
    initial_charge_level: float = Field(ge=0, le=100)

class ChargingSessionUpdate(BaseModel):
    """Schema for updating a charging session."""
    final_charge_level: Optional[float] = Field(None, ge=0, le=100)
    current_charge_level: Optional[float] = Field(None, ge=0, le=100)
    energy_consumed: Optional[float] = Field(None, ge=0)
    cost: Optional[float] = Field(None, ge=0)
    status: Optional[Literal["active", "completed", "interrupted", "error"]] = None
    payment_status: Optional[Literal["pending", "paid", "failed", "refunded"]] = None
    end_time: Optional[datetime] = None

class ChargingSessionResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            datetime: lambda v: v.isoformat() if v else None
        }
    )
    
    id: str
    user_id: str
    station_id: str
    connector_id: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    initial_charge_level: float
    final_charge_level: Optional[float] = None
    energy_consumed: Optional[float] = None
    status: str
    cost: Optional[float] = None
    created_at: datetime
    updated_at: datetime

class SessionAnalytics(BaseModel):
    """Schema for session analytics."""
    total_sessions: int
    active_sessions: int
    completed_sessions: int
    total_energy_consumed: float
    total_revenue: float
    average_session_duration: float
    most_used_station: Optional[str] = None
    peak_usage_hour: Optional[int] = None

class SimulationData(BaseModel):
    """Schema for processing simulation data."""
    timestamp: datetime
    station_id: str
    slot_id: int
    car_id: str
    charge_level: float
    is_plugged: bool
    status: Literal["arriving", "charging", "departing", "available"]
    power_output: Optional[float] = None