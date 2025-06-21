from pydantic import BaseModel, Field
from typing import Optional, Literal
from bson import ObjectId
from datetime import datetime

class ChargingStation(BaseModel):
    """Schema for charging station data."""
    id: Optional[str] = None
    name: str
    location: str
    latitude: float
    longitude: float
    total_ports: int = Field(gt=0, description="Total number of charging ports")
    available_ports: int = Field(ge=0, description="Available charging ports")
    power_output: int = Field(gt=0, description="Power output in kW")
    connector_types: list[str] = Field(description="List of connector types available")
    status: Literal["active", "maintenance", "offline"] = "active"
    price_per_kwh: float = Field(gt=0, description="Price per kWh")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat() if v else None
        }
        allow_population_by_field_name = True
        arbitrary_types_allowed = True

class ChargingStationCreate(BaseModel):
    """Schema for creating a charging station."""
    name: str
    location: str
    latitude: float
    longitude: float
    total_ports: int = Field(gt=0)
    available_ports: int = Field(ge=0)
    power_output: int = Field(gt=0)
    connector_types: list[str]
    price_per_kwh: float = Field(gt=0)

class ChargingStationUpdate(BaseModel):
    """Schema for updating a charging station."""
    name: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_ports: Optional[int] = Field(None, gt=0)
    available_ports: Optional[int] = Field(None, ge=0)
    power_output: Optional[int] = Field(None, gt=0)
    connector_types: Optional[list[str]] = None
    status: Optional[Literal["active", "maintenance", "offline"]] = None
    price_per_kwh: Optional[float] = Field(None, gt=0)

class ChargingStationStatusUpdate(BaseModel):
    """Schema for users to update charging station status."""
    status: Literal["active", "maintenance", "offline"]

class ChargingStationResponse(BaseModel):
    """Schema for returning charging station details."""
    id: str
    name: str
    location: str
    latitude: float
    longitude: float
    total_ports: int
    available_ports: int
    power_output: int
    connector_types: list[str]
    status: str
    price_per_kwh: float
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True