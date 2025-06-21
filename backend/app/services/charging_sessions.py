from app.database import charging_sessions_collection, charging_stations_collection
from app.schemas.charging_session import (
    ChargingSessionCreate, 
    ChargingSessionUpdate, 
    SimulationData,
    SessionAnalytics
)
from bson import ObjectId
from datetime import datetime, timedelta
from typing import List, Optional, Dict
import asyncio

async def create_charging_session(session: ChargingSessionCreate) -> dict:
    """Create a new charging session."""
    current_time = datetime.utcnow()
    
    # Check if station and slot exist
    station = await charging_stations_collection.find_one({"_id": ObjectId(session.station_id)})
    if not station:
        raise ValueError("Charging station not found")
    
    # Check if slot is available
    existing_session = await charging_sessions_collection.find_one({
        "station_id": session.station_id,
        "slot_id": session.slot_id,
        "status": "active"
    })
    
    if existing_session:
        raise ValueError("Charging slot is already occupied")
    
    new_session = {
        "station_id": session.station_id,
        "slot_id": session.slot_id,
        "user_id": session.user_id,
        "vehicle_number": session.vehicle_number,
        "start_time": current_time,
        "initial_charge_level": session.initial_charge_level,
        "status": "active",
        "payment_status": "pending",
        "created_at": current_time,
        "updated_at": current_time
    }
    
    result = await charging_sessions_collection.insert_one(new_session)
    
    # Update station slot status
    await charging_stations_collection.update_one(
        {"_id": ObjectId(session.station_id)},
        {"$inc": {"available_ports": -1}}
    )
    
    return {
        "id": str(result.inserted_id),
        "station_id": session.station_id,
        "slot_id": session.slot_id,
        "status": "active"
    }

async def get_all_charging_sessions(
    user_id: Optional[str] = None,
    station_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    skip: int = 0
) -> List[dict]:
    """Get all charging sessions with optional filters."""
    query = {}
    
    if user_id:
        query["user_id"] = user_id
    if station_id:
        query["station_id"] = station_id
    if status:
        query["status"] = status
    
    sessions = []
    async for session in charging_sessions_collection.find(query).skip(skip).limit(limit).sort("created_at", -1):
        session["id"] = str(session["_id"])
        del session["_id"]
        
        # Calculate duration if session is completed
        if session.get("end_time") and session.get("start_time"):
            duration = session["end_time"] - session["start_time"]
            session["duration_minutes"] = int(duration.total_seconds() / 60)
        
        sessions.append(session)
    
    return sessions

async def get_charging_session_by_id(session_id: str) -> Optional[dict]:
    """Get a charging session by ID."""
    try:
        session = await charging_sessions_collection.find_one({"_id": ObjectId(session_id)})
        if session:
            session["id"] = str(session["_id"])
            del session["_id"]
            
            # Calculate duration if session is completed
            if session.get("end_time") and session.get("start_time"):
                duration = session["end_time"] - session["start_time"]
                session["duration_minutes"] = int(duration.total_seconds() / 60)
        
        return session
    except:
        return None

async def update_charging_session(session_id: str, session_update: ChargingSessionUpdate) -> bool:
    """Update a charging session."""
    try:
        update_data = {}
        
        # Only include fields that are not None
        for field, value in session_update.model_dump(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            # If session is being completed, set end_time
            if update_data.get("status") == "completed" and "end_time" not in update_data:
                update_data["end_time"] = datetime.utcnow()
            
            result = await charging_sessions_collection.update_one(
                {"_id": ObjectId(session_id)},
                {"$set": update_data}
            )
            
            # If session is completed, update station availability
            if update_data.get("status") in ["completed", "interrupted", "error"]:
                session = await get_charging_session_by_id(session_id)
                if session:
                    await charging_stations_collection.update_one(
                        {"_id": ObjectId(session["station_id"])},
                        {"$inc": {"available_ports": 1}}
                    )
            
            return result.modified_count > 0
        return False
    except:
        return False

async def complete_charging_session(
    session_id: str, 
    final_charge_level: float,
    energy_consumed: Optional[float] = None
) -> bool:
    """Complete a charging session with final data."""
    try:
        session = await get_charging_session_by_id(session_id)
        if not session or session["status"] != "active":
            return False
        
        end_time = datetime.utcnow()
        start_time = session["start_time"]
        
        # Calculate energy consumed if not provided
        if energy_consumed is None:
            station = await charging_stations_collection.find_one({"_id": ObjectId(session["station_id"])})
            if station:
                duration_hours = (end_time - start_time).total_seconds() / 3600
                charge_increase = final_charge_level - session["initial_charge_level"]
                # Estimate energy based on charge increase (assuming average battery capacity)
                estimated_battery_capacity = 60  # kWh average
                energy_consumed = (charge_increase / 100) * estimated_battery_capacity
        
        # Calculate cost
        station = await charging_stations_collection.find_one({"_id": ObjectId(session["station_id"])})
        cost = 0
        if station and energy_consumed:
            cost = energy_consumed * station.get("price_per_kwh", 0.3)
        
        update_data = {
            "end_time": end_time,
            "final_charge_level": final_charge_level,
            "energy_consumed": energy_consumed,
            "cost": cost,
            "status": "completed",
            "payment_status": "paid",  # Simplified for demo
            "updated_at": end_time
        }
        
        result = await charging_sessions_collection.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": update_data}
        )
        
        # Update station availability
        await charging_stations_collection.update_one(
            {"_id": ObjectId(session["station_id"])},
            {"$inc": {"available_ports": 1}}
        )
        
        return result.modified_count > 0
    except:
        return False

async def process_simulation_data(data: SimulationData) -> bool:
    """Process raw simulation data and update sessions accordingly."""
    try:
        # Find active session for this station/slot
        active_session = await charging_sessions_collection.find_one({
            "station_id": data.station_id,
            "slot_id": data.slot_id,
            "status": "active"
        })
        
        if data.status == "arriving" and not active_session:
            # Create new session
            session_data = ChargingSessionCreate(
                station_id=data.station_id,
                slot_id=data.slot_id,
                user_id="simulation_user",  # Default for simulation
                vehicle_number=data.car_id,
                initial_charge_level=data.charge_level
            )
            await create_charging_session(session_data)
            
        elif data.status == "charging" and active_session and data.is_plugged:
            # Update charging progress
            await charging_sessions_collection.update_one(
                {"_id": active_session["_id"]},
                {"$set": {
                    "current_charge_level": data.charge_level,
                    "updated_at": data.timestamp
                }}
            )
            
        elif data.status == "departing" and active_session:
            # Complete the session
            await complete_charging_session(
                str(active_session["_id"]),
                data.charge_level
            )
        
        return True
    except Exception as e:
        print(f"Error processing simulation data: {e}")
        return False

async def get_session_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    station_id: Optional[str] = None
) -> SessionAnalytics:
    """Get analytics for charging sessions."""
    try:
        query = {}
        
        if start_date or end_date:
            date_query = {}
            if start_date:
                date_query["$gte"] = start_date
            if end_date:
                date_query["$lte"] = end_date
            query["created_at"] = date_query
            
        if station_id:
            query["station_id"] = station_id
        
        # Aggregate statistics
        pipeline = [
            {"$match": query},
            {"$group": {
                "_id": None,
                "total_sessions": {"$sum": 1},
                "active_sessions": {"$sum": {"$cond": [{"$eq": ["$status", "active"]}, 1, 0]}},
                "completed_sessions": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}},
                "total_energy": {"$sum": {"$ifNull": ["$energy_consumed", 0]}},
                "total_revenue": {"$sum": {"$ifNull": ["$cost", 0]}},
                "avg_duration": {"$avg": {
                    "$cond": [
                        {"$and": ["$start_time", "$end_time"]},
                        {"$divide": [{"$subtract": ["$end_time", "$start_time"]}, 1000 * 60]},
                        0
                    ]
                }}
            }}
        ]
        
        result = await charging_sessions_collection.aggregate(pipeline).to_list(1)
        
        if result:
            stats = result[0]
            return SessionAnalytics(
                total_sessions=stats.get("total_sessions", 0),
                active_sessions=stats.get("active_sessions", 0),
                completed_sessions=stats.get("completed_sessions", 0),
                total_energy_consumed=stats.get("total_energy", 0),
                total_revenue=stats.get("total_revenue", 0),
                average_session_duration=stats.get("avg_duration", 0)
            )
        else:
            return SessionAnalytics(
                total_sessions=0,
                active_sessions=0,
                completed_sessions=0,
                total_energy_consumed=0,
                total_revenue=0,
                average_session_duration=0
            )
    except:
        return SessionAnalytics(
            total_sessions=0,
            active_sessions=0,
            completed_sessions=0,
            total_energy_consumed=0,
            total_revenue=0,
            average_session_duration=0
        )

async def get_user_sessions(user_id: str, limit: int = 50) -> List[dict]:
    """Get all sessions for a specific user."""
    return await get_all_charging_sessions(user_id=user_id, limit=limit)

async def get_station_sessions(station_id: str, limit: int = 50) -> List[dict]:
    """Get all sessions for a specific station."""
    return await get_all_charging_sessions(station_id=station_id, limit=limit)