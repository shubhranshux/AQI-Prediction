"""Service for AQI prediction using the trained XGBoost model."""
import pandas as pd
from datetime import datetime
from fastapi import HTTPException
from src.predict import load_model, get_aqi_category


class PredictionService:
    """Handles model loading and AQI prediction logic."""

    model = None
    le = None
    le_district = None
    feature_cols = None

    @classmethod
    def load(cls):
        """Load model and encoders at startup."""
        print("Loading models for API...")
        cls.model, cls.le, cls.le_district, cls.feature_cols = load_model()

    @classmethod
    def predict(cls, location: str, district: str, params: dict) -> dict:
        """Run AQI prediction with the given parameters."""
        now = datetime.now()

        try:
            loc_encoded = cls.le.transform([location])[0]
            dist_encoded = cls.le_district.transform([district])[0]
        except Exception:
            raise HTTPException(
                status_code=400,
                detail=f"Location '{location}' or District '{district}' not recognized."
            )

        features = pd.DataFrame([[
            params["pm25"], params["pm10"], params["no2"], params["so2"],
            params["co"], params["o3"], params["temp"], params["humidity"],
            now.month, now.year, now.timetuple().tm_yday,
            loc_encoded, dist_encoded
        ]], columns=cls.feature_cols)

        predicted_aqi = max(0, round(float(cls.model.predict(features)[0])))
        category, emoji = get_aqi_category(predicted_aqi)

        return {
            "predicted_aqi": predicted_aqi,
            "category": category,
            "emoji": emoji,
            "parameters": params,
            "location": location,
            "district": district,
        }
