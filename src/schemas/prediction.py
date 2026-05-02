"""Pydantic schemas for prediction requests and responses."""
from pydantic import BaseModel, Field
from typing import Optional


class ManualPredictionRequest(BaseModel):
    """Request body for manual AQI prediction with user-provided parameters."""
    district: str = Field(..., description="District name in Odisha")
    location: str = Field(..., description="Location name within the district")
    pm25: float = Field(..., ge=0, description="PM2.5 concentration (ug/m3)")
    pm10: float = Field(..., ge=0, description="PM10 concentration (ug/m3)")
    no2: float = Field(..., ge=0, description="NO2 concentration (ppb)")
    so2: float = Field(..., ge=0, description="SO2 concentration (ppb)")
    co: float = Field(..., ge=0, description="CO concentration (mg/m3)")
    o3: float = Field(..., ge=0, description="O3 concentration (ppb)")
    temp: float = Field(..., description="Temperature (Celsius)")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity (%)")


class AutoPredictionRequest(BaseModel):
    """Request body for auto AQI prediction — fetches live data automatically."""
    district: str = Field(..., description="District name in Odisha")
    location: str = Field(..., description="Location name within the district")


class ParametersResponse(BaseModel):
    """Pollutant and weather parameters used for prediction."""
    pm25: float
    pm10: float
    no2: float
    so2: float
    co: float
    o3: float
    temp: float
    humidity: float


class PredictionResponse(BaseModel):
    """Response body for AQI prediction results."""
    predicted_aqi: int
    real_time_aqi: Optional[int] = None
    category: str
    emoji: str
    rt_category: Optional[str] = None
    parameters: ParametersResponse
    location: str
    district: str
    coordinates: Optional[dict] = None
    data_source: Optional[str] = None
