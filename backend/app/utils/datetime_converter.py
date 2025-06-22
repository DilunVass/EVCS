from datetime import datetime
from typing import Any, Dict, List, Union
from bson import ObjectId

def convert_datetime_to_string(obj: Any) -> Any:
    """Recursively convert datetime objects to ISO strings in any data structure."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        return {key: convert_datetime_to_string(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_datetime_to_string(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(convert_datetime_to_string(item) for item in obj)
    else:
        return obj

def prepare_response_data(data: Union[Dict, List, Any]) -> Union[Dict, List, Any]:
    """Prepare response data by converting all datetime objects to strings."""
    return convert_datetime_to_string(data)