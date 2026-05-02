"""Service for fetching live weather and air quality data from Open-Meteo."""
import requests
from fastapi import HTTPException


class WeatherService:
    """Fetches real-time pollutant and weather data from Open-Meteo APIs."""

    AQ_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
    WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

    @staticmethod
    def fetch(lat: float, lon: float, district: str = None) -> dict:
        """Fetch air quality + weather data and return normalized parameters."""
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

        # Unit conversions (ug/m3 -> model units)
        co_ug = a.get("carbon_monoxide", 0) or 0
        no2_ug = a.get("nitrogen_dioxide", 0) or 0
        so2_ug = a.get("sulphur_dioxide", 0) or 0
        o3_ug = a.get("ozone", 0) or 0

        # Calculate base pollutants
        pm25 = round(a.get("pm2_5", 0) or 0, 2)
        pm10 = round(a.get("pm10", 0) or 0, 2)
        co = round(co_ug / 1000.0, 2)
        no2 = round((no2_ug * 24.45 / 46.01) if no2_ug else 0, 2)
        so2 = round((so2_ug * 24.45 / 64.06) if so2_ug else 0, 2)
        o3 = round((o3_ug * 24.45 / 48.00) if o3_ug else 0, 2)

        # Apply ML-aligned Calibration Multipliers to correct satellite underestimation
        multiplier = 1.0
        if district in ['Cuttack', 'Khordha']: multiplier = 2.05
        elif district == 'Jajpur': multiplier = 1.85
        elif district == 'Keonjhar': multiplier = 2.2
        elif district == 'Kalahandi': multiplier = 1.4

        return {
            "pm25": round(pm25 * multiplier, 2),
            "pm10": round(pm10 * multiplier, 2),
            "co": round(co * multiplier, 2),
            "no2": round(no2 * multiplier, 2),
            "so2": round(so2 * multiplier, 2),
            "o3": round(o3 * multiplier, 2),
            "temp": w.get("temperature_2m", 25.0),
            "humidity": w.get("relative_humidity_2m", 50.0),
        }
