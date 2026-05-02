"""Pydantic schemas for location-related responses."""
from pydantic import BaseModel
from typing import Dict, List


class LocationsResponse(BaseModel):
    """Response body for the /locations endpoint."""
    districts: List[str]
    locations: Dict[str, List[str]]
