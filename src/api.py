"""
AQI Prediction API — FastAPI Application
Thin router that delegates to service and schema layers.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.schemas import (
    ManualPredictionRequest, AutoPredictionRequest,
    PredictionResponse, LocationsResponse,
)
from src.services import PredictionService, LocationService, WeatherService

# ─── App Setup ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="EnviroPredict API",
    description="Real-time AQI prediction for Odisha using XGBoost ML",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    PredictionService.load()


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "EnviroPredict API v2.0", "status": "running"}


@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": PredictionService.model is not None}


@app.get("/locations", response_model=LocationsResponse)
def get_locations():
    """Returns all districts and their available locations."""
    return LocationService.get_all()


@app.post("/predict/manual", response_model=PredictionResponse)
def predict_manual(req: ManualPredictionRequest):
    """Predict AQI using manually entered pollutant parameters."""
    params = {
        "pm25": req.pm25, "pm10": req.pm10, "no2": req.no2,
        "so2": req.so2, "co": req.co, "o3": req.o3,
        "temp": req.temp, "humidity": req.humidity,
    }
    return PredictionService.predict(req.location, req.district, params)


@app.post("/predict/auto", response_model=PredictionResponse)
def predict_auto(req: AutoPredictionRequest):
    """Predict AQI by automatically fetching live data for the location."""
    lat, lon = LocationService.geocode(req.location, req.district)
    params = WeatherService.fetch(lat, lon)
    result = PredictionService.predict(req.location, req.district, params)
    result["coordinates"] = {"lat": lat, "lon": lon}
    result["data_source"] = "LIVE (Open-Meteo API)"
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api:app", host="0.0.0.0", port=8000, reload=True)
