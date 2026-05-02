import requests
import json
import sys

def test_api():
    print("Testing GET /locations")
    res = requests.get("http://localhost:8000/locations")
    if res.status_code == 200:
        print("Success! Districts:", len(res.json()["districts"]))
    else:
        print("Failed /locations:", res.text)
        sys.exit(1)

    print("\nTesting POST /predict/manual")
    manual_data = {
        "district": "Kalahandi",
        "location": "Bhawanipatna",
        "pm25": 45.0,
        "pm10": 60.0,
        "no2": 15.0,
        "so2": 10.0,
        "co": 0.5,
        "o3": 20.0,
        "temp": 30.0,
        "humidity": 50.0
    }
    res = requests.post("http://localhost:8000/predict/manual", json=manual_data)
    if res.status_code == 200:
        print("Success! Prediction:", res.json())
    else:
        print("Failed /predict/manual:", res.text)

    print("\nTesting POST /predict/auto")
    auto_data = {
        "district": "Khordha",
        "location": "Bhubaneswar"
    }
    res = requests.post("http://localhost:8000/predict/auto", json=auto_data)
    if res.status_code == 200:
        print("Success! Prediction:", json.dumps(res.json(), indent=2))
    else:
        print("Failed /predict/auto:", res.text)

if __name__ == "__main__":
    test_api()
