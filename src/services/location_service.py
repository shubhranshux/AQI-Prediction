"""Service for location data and geocoding."""
from geopy.geocoders import Nominatim
from fastapi import HTTPException
from src.predict import LOCATION_DISTRICT


class LocationService:
    """Handles location lookups and geocoding."""

    _geolocator = Nominatim(user_agent="aqi_predictor_odisha")

    @staticmethod
    def get_all() -> dict:
        """Return all districts and their sorted location lists."""
        districts = {}
        for loc, dist in LOCATION_DISTRICT.items():
            districts.setdefault(dist, []).append(loc)
        for dist in districts:
            districts[dist].sort()
        return {"districts": sorted(districts.keys()), "locations": districts}

    @staticmethod
    def geocode(location: str, district: str) -> tuple:
        """Geocode a location to (lat, lon). Falls back to district-level."""
        try:
            query = f"{location}, {district}, Odisha, India"
            loc = LocationService._geolocator.geocode(query, timeout=10)
            if not loc:
                loc = LocationService._geolocator.geocode(f"{district}, Odisha, India", timeout=10)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Geocoding failed: {e}")

        if not loc:
            raise HTTPException(status_code=404, detail="Could not find coordinates for this location.")

        return loc.latitude, loc.longitude
