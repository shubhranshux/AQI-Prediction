"""Service for fetching live weather and air quality data from Open-Meteo."""
import requests
from fastapi import HTTPException


# ─── Per-District Calibration Factors ────────────────────────────────────────
# Satellite/reanalysis data (Open-Meteo) systematically underestimates ground-
# level pollution.  These factors align live readings with the training-data
# distribution per district.  Each key maps a pollutant to its correction
# multiplier.  Values were derived by comparing Open-Meteo medians against the
# training-set medians per district.
DISTRICT_CALIBRATION = {
    'Kalahandi':  {'pm25': 1.35, 'pm10': 1.40, 'no2': 1.30, 'so2': 1.25, 'co': 1.20, 'o3': 1.15},
    'Dhenkanal':  {'pm25': 1.50, 'pm10': 1.55, 'no2': 1.45, 'so2': 1.40, 'co': 1.35, 'o3': 1.20},
    'Keonjhar':   {'pm25': 2.00, 'pm10': 2.10, 'no2': 1.60, 'so2': 1.30, 'co': 1.25, 'o3': 1.15},
    'Khordha':    {'pm25': 1.80, 'pm10': 1.75, 'no2': 1.55, 'so2': 1.50, 'co': 1.45, 'o3': 1.25},
    'Jajpur':     {'pm25': 1.70, 'pm10': 1.65, 'no2': 1.45, 'so2': 1.35, 'co': 1.40, 'o3': 1.20},
    'Cuttack':    {'pm25': 1.85, 'pm10': 1.80, 'no2': 1.50, 'so2': 1.40, 'co': 1.35, 'o3': 1.20},
    'Sundargarh': {'pm25': 1.90, 'pm10': 1.85, 'no2': 1.55, 'so2': 1.45, 'co': 1.40, 'o3': 1.25},
    'Ganjam':     {'pm25': 1.60, 'pm10': 1.55, 'no2': 1.50, 'so2': 1.30, 'co': 1.35, 'o3': 1.15},
    'Sambalpur':  {'pm25': 1.75, 'pm10': 1.70, 'no2': 1.45, 'so2': 1.35, 'co': 1.30, 'o3': 1.20},
}
DEFAULT_CALIBRATION = {'pm25': 1.50, 'pm10': 1.50, 'no2': 1.40, 'so2': 1.30, 'co': 1.30, 'o3': 1.15}


class WeatherService:
    """Fetches real-time pollutant and weather data from Open-Meteo APIs."""

    AQ_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
    WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

    @staticmethod
    def fetch(lat: float, lon: float, district: str = None) -> dict:
        """Fetch air quality + weather data and return normalized parameters.

        All pollutant values are returned in the same units the model was
        trained on:
          - PM2.5, PM10 : µg/m³
          - NO2, SO2, O3: µg/m³  (CPCB breakpoint standard)
          - CO           : mg/m³
        """
        try:
            aq = requests.get(
                WeatherService.AQ_URL,
                params={"latitude": lat, "longitude": lon,
                        "current": "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone"},
                timeout=10
            ).json()
            weather = requests.get(
                WeatherService.WEATHER_URL,
                params={"latitude": lat, "longitude": lon,
                        "current": "temperature_2m,relative_humidity_2m"},
                timeout=10
            ).json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Open-Meteo API error: {e}")

        if "current" not in aq or "current" not in weather:
            raise HTTPException(status_code=500, detail="Invalid Open-Meteo response")

        a, w = aq["current"], weather["current"]

        # ── Raw values from API (all in µg/m³ except CO) ─────────────────
        pm25_raw = a.get("pm2_5", 0) or 0
        pm10_raw = a.get("pm10", 0) or 0
        co_raw   = (a.get("carbon_monoxide", 0) or 0) / 1000.0   # µg/m³ → mg/m³
        no2_raw  = a.get("nitrogen_dioxide", 0) or 0              # µg/m³ (keep as-is)
        so2_raw  = a.get("sulphur_dioxide", 0) or 0               # µg/m³ (keep as-is)
        o3_raw   = a.get("ozone", 0) or 0                         # µg/m³ (keep as-is)

        # ── Apply per-district, per-pollutant calibration ────────────────
        cal = DISTRICT_CALIBRATION.get(district, DEFAULT_CALIBRATION)

        return {
            "pm25":     round(pm25_raw * cal['pm25'], 2),
            "pm10":     round(pm10_raw * cal['pm10'], 2),
            "co":       round(co_raw   * cal['co'],   2),
            "no2":      round(no2_raw  * cal['no2'],  2),
            "so2":      round(so2_raw  * cal['so2'],  2),
            "o3":       round(o3_raw   * cal['o3'],   2),
            "temp":     w.get("temperature_2m", 25.0),
            "humidity": w.get("relative_humidity_2m", 50.0),
        }
