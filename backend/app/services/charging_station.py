from app.database import charging_stations_collection
from app.schemas.charging_station import ChargingStationCreate, ChargingStationUpdate, ChargingStationStatusUpdate
from bson import ObjectId
from datetime import datetime
from typing import List, Optional

async def create_charging_station(station: ChargingStationCreate) -> dict:
    """Create a new charging station."""
    current_time = datetime.utcnow()
    
    new_station = {
        "name": station.name,
        "location": station.location,
        "latitude": station.latitude,
        "longitude": station.longitude,
        "total_ports": station.total_ports,
        "available_ports": station.available_ports,
        "power_output": station.power_output,
        "connector_types": station.connector_types,
        "status": "active",
        "price_per_kwh": station.price_per_kwh,
        "created_at": current_time,
        "updated_at": current_time
    }
    
    result = await charging_stations_collection.insert_one(new_station)
    return {
        "id": str(result.inserted_id),
        "name": station.name,
        "location": station.location
    }

def convert_datetime_to_string(station: dict) -> dict:
    """Convert datetime objects to ISO strings."""
    if station.get("created_at"):
        station["created_at"] = station["created_at"].isoformat()
    if station.get("updated_at"):
        station["updated_at"] = station["updated_at"].isoformat()
    return station

async def get_all_charging_stations() -> List[dict]:
    """Get all charging stations."""
    stations = []
    async for station in charging_stations_collection.find():
        station["id"] = str(station["_id"])
        del station["_id"]
        # Convert datetime objects to strings
        station = convert_datetime_to_string(station)
        stations.append(station)
    return stations

async def get_charging_station_by_id(station_id: str) -> Optional[dict]:
    """Get a charging station by ID."""
    try:
        station = await charging_stations_collection.find_one({"_id": ObjectId(station_id)})
        if station:
            station["id"] = str(station["_id"])
            del station["_id"]
            # Convert datetime objects to strings
            station = convert_datetime_to_string(station)
        return station
    except:
        return None

async def update_charging_station(station_id: str, station_update: ChargingStationUpdate) -> bool:
    """Update a charging station (admin only)."""
    try:
        update_data = {}
        
        # Only include fields that are not None
        for field, value in station_update.model_dump(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            result = await charging_stations_collection.update_one(
                {"_id": ObjectId(station_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        return False
    except:
        return False

async def update_charging_station_status(station_id: str, status_update: ChargingStationStatusUpdate) -> bool:
    """Update charging station status (users can do this)."""
    try:
        result = await charging_stations_collection.update_one(
            {"_id": ObjectId(station_id)},
            {"$set": {
                "status": status_update.status,
                "updated_at": datetime.utcnow()
            }}
        )
        return result.modified_count > 0
    except:
        return False

async def delete_charging_station(station_id: str) -> bool:
    """Delete a charging station."""
    try:
        result = await charging_stations_collection.delete_one({"_id": ObjectId(station_id)})
        return result.deleted_count > 0
    except:
        return False