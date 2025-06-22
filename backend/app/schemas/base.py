from pydantic import BaseModel, field_serializer
from typing import Optional, Union, Any
from datetime import datetime
from bson import ObjectId

class BaseResponseModel(BaseModel):
    """Base response model with automatic datetime serialization."""
    
    @field_serializer('created_at', 'updated_at', 'start_time', 'end_time', 'processed_at', when_used='json')
    def serialize_datetime(self, dt: Union[datetime, str, None], _info) -> Optional[str]:
        if dt is None:
            return None
        if isinstance(dt, datetime):
            return dt.isoformat()
        elif isinstance(dt, str):
            return dt
        return None

    class Config:
        from_attributes = True
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat() if v else None
        }