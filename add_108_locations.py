import pandas as pd
import numpy as np
import os
import random
from datetime import datetime, timedelta

def get_seasonal_factor(month):
    seasonal_map = {1:1.4, 2:1.3, 3:1.1, 4:1.0, 5:1.05, 6:0.7, 7:0.6, 8:0.65, 9:0.75, 10:0.9, 11:1.2, 12:1.45}
    return seasonal_map[month]

def calculate_aqi(pm25, pm10, no2, so2, co, o3):
    return int(max(pm25*1.5, pm10*1.2, no2, so2*0.5, co*10, o3*0.8, 20))

def get_aqi_category(aqi):
    if aqi <= 50: return 'Good'
    elif aqi <= 100: return 'Satisfactory'
    elif aqi <= 200: return 'Moderate'
    elif aqi <= 300: return 'Poor'
    elif aqi <= 400: return 'Very Poor'
    return 'Severe'

NEW_LOCATIONS = {
    'Cuttack': ['Choudwar', 'Banki', 'Athagarh', 'Niali', 'Salepur', 'Tangi (Cuttack)', 'Cuttack Sadar', 'Baramba', 'Narasinghpur', 'Mahanga', 'Nischintakoili', 'Kantapada', 'Tigiria', 'Badamba', 'Kishorenagar', 'Olatpur', 'Adaspur', 'Nakhara', 'Nirgundi', 'Chagatpur', 'Kalyaninagar', 'Madhupatna', 'Mahanadi Vihar', 'Markat Nagar', 'Bidanasi', 'Sikharpur', 'Mangalabag'],
    'Khordha': ['Balianta', 'Balisahi', 'Baramunda', 'Bapuji Nagar', 'Nayapalli', 'Patia', 'Saheed Nagar', 'Vani Vihar', 'Rasulgarh', 'Acharya Vihar', 'BJB Nagar', 'Chandrasekharpur', 'CRP Square', 'Damana', 'Ganga Nagar', 'Kalinga Nagar', 'Kharavela Nagar', 'Master Canteen', 'Pokhariput', 'Satya Nagar', 'Surya Nagar', 'Unit-1', 'Unit-2', 'Unit-3', 'Unit-4', 'Unit-6', 'Unit-8'],
    'Keonjhar': ['Bamebari', 'Bolani', 'Joda East', 'Joda West', 'Khandadhar', 'Nayagarh', 'Palaspanga', 'Suakati', 'Turumunga', 'Guali', 'Bhadrasahi', 'Thakurani', 'Banspani', 'Bilaipada', 'Jhilli', 'Koida', 'Kalaparbat', 'Murgabeda', 'Nalda', 'Nayagarh (K)', 'Padampur', 'Rugudi (K)', 'Sankarpur', 'Singhbhum', 'Uliburu', 'Unchabali', 'Balia'],
    'Jajpur': ['Barchana', 'Kabatabandha', 'Korei', 'Kuakhia', 'Nirajpur', 'Pankapal', 'Patharapadha', 'Sathipur', 'Tarapur', 'Brahmani', 'Chhatia', 'Gokarnika', 'Kalamatia', 'Khanditar', 'Kuspurbag', 'Madakasira', 'Neulpur', 'Rathia', 'Singapur', 'Sribaladevjew', 'Tomka', 'Abhimanyu', 'Arei', 'Chahata', 'Dhanmandal', 'Kabirpur', 'Mirzapur'],
    'Kalahandi': ['Kandhabandopala', 'Government College of Engineering Kalahandi']
}

TOTAL_NEW_ROWS = 5000
START_DATE = datetime(2022, 1, 1)

def inject():
    df = pd.read_csv('data/odisha_aqi_data.csv')
    
    # Check if they exist to avoid duplication
    existing_locs = set(df['Location'].unique())
    locs_to_add = []
    
    for dist, locs in NEW_LOCATIONS.items():
        for loc in locs:
            if loc not in existing_locs:
                locs_to_add.append((loc, dist))
                
    if not locs_to_add:
        print("All locations already exist!")
        return locs_to_add
        
    print(f"Injecting {len(locs_to_add)} new locations...")
    
    rows_per_loc = TOTAL_NEW_ROWS // len(locs_to_add)
    new_data = []
    
    for loc, dist in locs_to_add:
        for _ in range(rows_per_loc):
            date = START_DATE + timedelta(days=random.randint(0, 1400))
            month = date.month
            sf = get_seasonal_factor(month)
            
            pm25 = max(5, random.uniform(10, 50) * sf)
            pm10 = max(10, pm25 * random.uniform(1.5, 2.5))
            no2 = max(2, random.uniform(5, 30) * sf)
            so2 = max(1, random.uniform(2, 15) * sf)
            co = max(0.2, random.uniform(0.3, 1.2) * sf)
            o3 = max(5, random.uniform(10, 40) * sf)
            
            aqi = calculate_aqi(pm25, pm10, no2, so2, co, o3)
            
            new_data.append({
                'Date': date.strftime('%Y-%m-%d'),
                'Location': loc,
                'District': dist,
                'PM2.5': round(pm25, 1),
                'PM10': round(pm10, 1),
                'NO2': round(no2, 1),
                'SO2': round(so2, 1),
                'CO': round(co, 2),
                'O3': round(o3, 1),
                'Temperature': round(random.uniform(20, 35), 1),
                'Humidity': round(random.uniform(40, 80), 1),
                'AQI': aqi,
                'AQI_Category': get_aqi_category(aqi)
            })
            
    new_df = pd.DataFrame(new_data)
    df = pd.concat([df, new_df], ignore_index=True)
    df.to_csv('data/odisha_aqi_data.csv', index=False)
    print(f"Added {len(new_df)} rows. Total: {len(df)}")
    
    return locs_to_add

if __name__ == '__main__':
    locs = inject()
    if locs:
        print("Writing to predict.py...")
        # Patch predict.py
        with open('src/predict.py', 'r', encoding='utf-8') as f:
            content = f.read()
            
        insertion = "\n"
        for loc, dist in locs:
            insertion += f"    '{loc}': '{dist}',\n"
            
        content = content.replace("    'Berhampur':       'Ganjam',\n}", f"    'Berhampur':       'Ganjam',{insertion}}}")
        
        with open('src/predict.py', 'w', encoding='utf-8') as f:
            f.write(content)
            
        print("Done.")
