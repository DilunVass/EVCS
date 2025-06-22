from pydantic import BaseModel, Field, field_serializer
from typing import Optional, Literal
from datetime import datetime
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
    """Schema for returning charging session details."""
    id: str
    station_id: str
    slot_id: int
    user_id: str
    vehicle_number: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    initial_charge_level: float
    final_charge_level: Optional[float] = None
    current_charge_level: Optional[float] = None
    energy_consumed: Optional[float] = None
    cost: Optional[float] = None
    status: str
    payment_status: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    duration_minutes: Optional[int] = None

    @field_serializer('start_time', 'end_time', 'created_at', 'updated_at')
    def serialize_datetime(self, dt, _info) -> Optional[str]:
        if dt is None:
            return None
        if isinstance(dt, datetime):
            return dt.isoformat()
        return dt

    class Config:
        from_attributes = True

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