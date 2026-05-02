"""Service for AQI prediction using the trained XGBoost model."""
import pandas as pd
from datetime import datetime
from fastapi import HTTPException
from src.predict import load_model, get_aqi_category


def calculate_indian_aqi(params: dict) -> int:
    """Calculate AQI using official Indian CPCB sub-index breakpoint method.
    
    Uses the National Air Quality Index (NAQI) breakpoint concentrations.
    The highest sub-index among all pollutants becomes the overall AQI.
    """
    # CPCB Breakpoint tables: (Conc_lo, Conc_hi, AQI_lo, AQI_hi)
    breakpoints = {
        'pm25': [  # PM2.5 (ug/m3) - 24hr avg
            (0, 30, 0, 50), (31, 60, 51, 100), (61, 90, 101, 200),
            (91, 120, 201, 300), (121, 250, 301, 400), (251, 500, 401, 500),
        ],
        'pm10': [  # PM10 (ug/m3) - 24hr avg
            (0, 50, 0, 50), (51, 100, 51, 100), (101, 250, 101, 200),
            (251, 350, 201, 300), (351, 430, 301, 400), (431, 600, 401, 500),
        ],
        'no2': [  # NO2 (ug/m3) - 24hr avg
            (0, 40, 0, 50), (41, 80, 51, 100), (81, 180, 101, 200),
            (181, 280, 201, 300), (281, 400, 301, 400), (401, 600, 401, 500),
        ],
        'so2': [  # SO2 (ug/m3) - 24hr avg
            (0, 40, 0, 50), (41, 80, 51, 100), (81, 380, 101, 200),
            (381, 800, 201, 300), (801, 1600, 301, 400), (1601, 2400, 401, 500),
        ],
        'co': [  # CO (mg/m3) - 8hr avg
            (0, 1, 0, 50), (1.1, 2, 51, 100), (2.1, 10, 101, 200),
            (10.1, 17, 201, 300), (17.1, 34, 301, 400), (34.1, 50, 401, 500),
        ],
        'o3': [  # O3 (ug/m3) - 8hr avg
            (0, 50, 0, 50), (51, 100, 51, 100), (101, 168, 101, 200),
            (169, 208, 201, 300), (209, 748, 301, 400), (749, 1000, 401, 500),
        ],
    }

    def sub_index(conc, bp_table):
        """Calculate sub-index for a single pollutant."""
        if conc <= 0:
            return 0
        for c_lo, c_hi, a_lo, a_hi in bp_table:
            if c_lo <= conc <= c_hi:
                return round(((a_hi - a_lo) / (c_hi - c_lo)) * (conc - c_lo) + a_lo)
        return 500  # Beyond highest breakpoint

    # Convert ppb values back to ug/m3 for CPCB formula
    no2_ugm3 = params.get('no2', 0) * 46.01 / 24.45 if params.get('no2', 0) else 0
    so2_ugm3 = params.get('so2', 0) * 64.06 / 24.45 if params.get('so2', 0) else 0
    o3_ugm3 = params.get('o3', 0) * 48.0 / 24.45 if params.get('o3', 0) else 0

    sub_indices = [
        sub_index(params.get('pm25', 0), breakpoints['pm25']),
        sub_index(params.get('pm10', 0), breakpoints['pm10']),
        sub_index(no2_ugm3, breakpoints['no2']),
        sub_index(so2_ugm3, breakpoints['so2']),
        sub_index(params.get('co', 0), breakpoints['co']),
        sub_index(o3_ugm3, breakpoints['o3']),
    ]

    return max(sub_indices) if sub_indices else 0


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
            if location in cls.le.classes_:
                loc_encoded = cls.le.transform([location])[0]
            else:
                # Fallback to a known location for the model encoder
                fallback_map = {'Kalahandi': 'Bhawanipatna', 'Dhenkanal': 'Dhenkanal', 'Khordha': 'Bhubaneswar'}
                loc_encoded = cls.le.transform([fallback_map.get(district, cls.le.classes_[0])])[0]
                
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

        # Calculate real-time AQI using official Indian CPCB formula
        real_time_aqi = calculate_indian_aqi(params)
        rt_category, rt_emoji = get_aqi_category(real_time_aqi)

        return {
            "predicted_aqi": predicted_aqi,
            "real_time_aqi": real_time_aqi,
            "category": category,
            "emoji": emoji,
            "rt_category": rt_category,
            "parameters": params,
            "location": location,
            "district": district,
        }
