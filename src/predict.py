"""
AQI Prediction CLI Interface
Load the trained XGBoost model and predict AQI from user inputs.
Supports both interactive mode and batch CSV prediction.
"""

import pandas as pd
import numpy as np
import os
import sys
import joblib

# ─── Paths ───────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
MODEL_PATH = os.path.join(MODELS_DIR, 'xgboost_model.pkl')
ENCODER_PATH = os.path.join(MODELS_DIR, 'label_encoder.pkl')
DISTRICT_ENCODER_PATH = os.path.join(MODELS_DIR, 'district_encoder.pkl')
FEATURES_PATH = os.path.join(MODELS_DIR, 'feature_columns.pkl')

# AQI Categories
AQI_CATEGORIES = {
    (0, 50): ('Good', '🟢'),
    (51, 100): ('Satisfactory', '🟡'),
    (101, 200): ('Moderate', '🟠'),
    (201, 300): ('Poor', '🔴'),
    (301, 400): ('Very Poor', '🟣'),
    (401, 500): ('Severe', '⚫'),
}

# Location → District mapping
LOCATION_DISTRICT = {
    # ── Kalahandi District (~100 Locations) ──────────────────────
    # Urban & Major Towns
    'Bhawanipatna':    'Kalahandi',
    'Kesinga':         'Kalahandi',
    'Dharmagarh':      'Kalahandi',
    'Junagarh':        'Kalahandi',
    'Jaypatna':        'Kalahandi',
    'Madanpur Rampur': 'Kalahandi',
    # Industrial / Mining
    'Lanjigarh':       'Kalahandi',
    'Biswanathpur':    'Kalahandi',
    'Narayanpur':      'Kalahandi',
    # Block HQs & Key Hubs
    'Kalampur':        'Kalahandi',
    'Karlamunda':      'Kalahandi',
    'Thuamul Rampur':  'Kalahandi',
    'Golamunda':       'Kalahandi',
    'Narla':           'Kalahandi',
    'Koksara':         'Kalahandi',
    'Lanjigarh Road':  'Kalahandi',
    'Ampani':          'Kalahandi',
    'Utkela':          'Kalahandi',
    'Boden':           'Kalahandi',
    'Risida':          'Kalahandi',
    'Parla':           'Kalahandi',
    # North Kalahandi Villages
    'Belkhandi':       'Kalahandi',
    'Musiguda':        'Kalahandi',
    'Pastikudi':       'Kalahandi',
    'Brundabahal':     'Kalahandi',
    'Kusurla':         'Kalahandi',
    'Gajabahapda':     'Kalahandi',
    'Deypur':          'Kalahandi',
    'Kankeri':         'Kalahandi',
    'Santpur':         'Kalahandi',
    'Rupra':           'Kalahandi',
    # South Kalahandi Villages
    'Mukhiguda':       'Kalahandi',
    'Motar':           'Kalahandi',
    'Ladugaon':        'Kalahandi',
    'Behera':          'Kalahandi',
    'Baldhimal':       'Kalahandi',
    'Charbahal':       'Kalahandi',
    'Chilpa':          'Kalahandi',
    'Gambhariguda':    'Kalahandi',
    'Habaspur':        'Kalahandi',
    'Kalam':           'Kalahandi',
    # West Kalahandi / Dharmagarh Area
    'Kutumara':        'Kalahandi',
    'Karchala':        'Kalahandi',
    'Sanchergaon':     'Kalahandi',
    'Sankrakhol':      'Kalahandi',
    'Kankutru':        'Kalahandi',
    'Duhuria':         'Kalahandi',
    'Gudialipadar':    'Kalahandi',
    'Jogimunda':       'Kalahandi',
    'Kankupa':         'Kalahandi',
    'Pujariguda':      'Kalahandi',
    # East Kalahandi / M.Rampur Area
    'Urladani':        'Kalahandi',
    'Mohangiri':       'Kalahandi',
    'Manikera':        'Kalahandi',
    'Madanpur':        'Kalahandi',
    'Salepali':        'Kalahandi',
    'Bhursha':         'Kalahandi',
    'Gogula':          'Kalahandi',
    'Barabandha':      'Kalahandi',
    'Risida (Karlamunda)':'Kalahandi',
    'Regoda':          'Kalahandi',
    # Thuamul Rampur Area
    'Adri':            'Kalahandi',
    'Gopinathpur':     'Kalahandi',
    'Kanakpur':        'Kalahandi',
    'Kerpai':          'Kalahandi',
    'Mahulpatna':      'Kalahandi',
    'Maland':          'Kalahandi',
    'Nakrundi':        'Kalahandi',
    'Podapadar':       'Kalahandi',
    'Sindhipadar':     'Kalahandi',
    'Talampadar':      'Kalahandi',
    # Narla / Kesinga Area
    'Balanpada':       'Kalahandi',
    'Budhipadar':      'Kalahandi',
    'Ghantiguda':      'Kalahandi',
    'Kandel':          'Kalahandi',
    'Luhura':          'Kalahandi',
    'Mandinga':        'Kalahandi',
    'Palam':           'Kalahandi',
    'Rakamal':         'Kalahandi',
    'Siletpada':       'Kalahandi',
    'Tulapada':        'Kalahandi',
    # More Villages
    'Arebeda':         'Kalahandi',
    'Badakara':        'Kalahandi',
    'Bhimkela':        'Kalahandi',
    'Chancher':        'Kalahandi',
    'Dalguma':         'Kalahandi',
    'Gudigaon':        'Kalahandi',
    'Karlapada':       'Kalahandi',
    'Khasiguda':       'Kalahandi',
    'Mahichala':       'Kalahandi',
    'Pastikudi (Junagarh)':'Kalahandi',
    'Saganbhadi':      'Kalahandi',
    'Tundla':          'Kalahandi',
    'Uditnarayanpur':  'Kalahandi',
    'Amathola':        'Kalahandi',
    'Boria':           'Kalahandi',
    'Daspur':          'Kalahandi',
    'Kalopala':        'Kalahandi',
    'Kusumkhunti':     'Kalahandi',
    'Majhiguda':       'Kalahandi',
    'Nuagaon':         'Kalahandi',
    'Pharad':          'Kalahandi',
    'Sialjodi':        'Kalahandi',
    'Tentulikhunti':   'Kalahandi',
    'Chapria':         'Kalahandi',
    'Dhanrabhata':     'Kalahandi',
    'Gotamunda':       'Kalahandi',
    'Kaigam':          'Kalahandi',
    'Phalsapada':      'Kalahandi',
    # Dhenkanal (All Gram Panchayats)
    'Dhenkanal':           'Dhenkanal',
    'Kamakhyanagar':       'Dhenkanal',
    'Hindol':              'Dhenkanal',
    'Bhuban':              'Dhenkanal',
    'Parjang':             'Dhenkanal',
    'Odapada':             'Dhenkanal',
    'Gondia':              'Dhenkanal',
    'Kankadahad':          'Dhenkanal',
    'Sarang':              'Dhenkanal',
    'Motanga':             'Dhenkanal',
    'Rasol':               'Dhenkanal',
    'Nihalprasad':         'Dhenkanal',
    'Kantilo':             'Dhenkanal',
    'Joranda':             'Dhenkanal',
    'Sadangi':             'Dhenkanal',
    'Tumusinga':           'Dhenkanal',
    'Mahisapat':           'Dhenkanal',
    'Balimi':              'Dhenkanal',
    'Meramundali':         'Dhenkanal',
    'Baladibandha':        'Dhenkanal',
    'Balarampur':          'Dhenkanal',
    'Baliamba':            'Dhenkanal',
    'Banasingh':           'Dhenkanal',
    'Barada':              'Dhenkanal',
    'Beltikiri':           'Dhenkanal',
    'Bhalibol Kateni':     'Dhenkanal',
    'Bhapur':              'Dhenkanal',
    'Chaulia':             'Dhenkanal',
    'Dhirapatna':          'Dhenkanal',
    'Gadasila':            'Dhenkanal',
    'Gengutia':            'Dhenkanal',
    'Ghagaramunda':        'Dhenkanal',
    'Ghatipiri':           'Dhenkanal',
    'Gobinda Prasad':      'Dhenkanal',
    'Gobindapur':          'Dhenkanal',
    'Gunadei':             'Dhenkanal',
    'Gundicha Pada':       'Dhenkanal',
    'Indipur':             'Dhenkanal',
    'Kaimati':             'Dhenkanal',
    'Kankadpal':           'Dhenkanal',
    'Sadasivapur':         'Dhenkanal',
    'Sankulei':            'Dhenkanal',
    'Saptasajya':          'Dhenkanal',
    'Siminai':             'Dhenkanal',
    'Sogarpasi':           'Dhenkanal',
    'Dharanipatana':       'Dhenkanal',
    'Ganeshwarpur':        'Dhenkanal',
    'Arakhapal':           'Dhenkanal',
    'Balibo':              'Dhenkanal',
    'Baruan (B)':          'Dhenkanal',
    'Bhusal':              'Dhenkanal',
    'Dayanabili':          'Dhenkanal',
    'Dhalapada':           'Dhenkanal',
    'Dighi':               'Dhenkanal',
    'Ekatali':             'Dhenkanal',
    'Jamunakote':          'Dhenkanal',
    'Jiral':               'Dhenkanal',
    'Kuninda':             'Dhenkanal',
    'Mahulpal':            'Dhenkanal',
    'Marthapur':           'Dhenkanal',
    'Mathakaragola':       'Dhenkanal',
    'Mrudanga':            'Dhenkanal',
    'Surapratapapur':      'Dhenkanal',
    'Bampa':               'Dhenkanal',
    'Baunsa Pokhari':      'Dhenkanal',
    'Gulehi':              'Dhenkanal',
    'Hatura':              'Dhenkanal',
    'Kansara':             'Dhenkanal',
    'Kantamila':           'Dhenkanal',
    'Madhapur':            'Dhenkanal',
    'Mahalunda':           'Dhenkanal',
    'Nuabag':              'Dhenkanal',
    'Analabereni':         'Dhenkanal',
    'Badasuanlo':          'Dhenkanal',
    'Baisinga':            'Dhenkanal',
    'Baligorada':          'Dhenkanal',
    'Bankuala':            'Dhenkanal',
    'Baruan (K)':          'Dhenkanal',
    'Baunsapal':           'Dhenkanal',
    'Bhairpur':            'Dhenkanal',
    'Budhibil':            'Dhenkanal',
    'Jagannathpur':        'Dhenkanal',
    'Kadua':               'Dhenkanal',
    'Kanapura':            'Dhenkanal',
    'Kantapal':            'Dhenkanal',
    'Kantiokateni':        'Dhenkanal',
    'Kantioputasahi':      'Dhenkanal',
    'Kotagara':            'Dhenkanal',
    'Kusumjodi':           'Dhenkanal',
    'Mahulpal (K)':        'Dhenkanal',
    'Ray Narasinghpur':    'Dhenkanal',
    'Saruali':             'Dhenkanal',
    'Sogar':               'Dhenkanal',
    'Badalo':              'Dhenkanal',
    'Balaramprasad':       'Dhenkanal',
    'Bangurisingh':        'Dhenkanal',
    'Bido':                'Dhenkanal',
    'Kalanga':             'Dhenkanal',
    'Kamalanga':           'Dhenkanal',
    'Kandabindha':         'Dhenkanal',
    'Kasiadihi':           'Dhenkanal',
    'Khadag Prasad':       'Dhenkanal',
    'Khuntujhari':         'Dhenkanal',
    'Kottam':              'Dhenkanal',
    'Kusupunga':           'Dhenkanal',
    'Mangalpur (O)':       'Dhenkanal',
    'Mottanga':            'Dhenkanal',
    'Nadhera':             'Dhenkanal',
    'Nimidha':             'Dhenkanal',
    'Sadashibpur':         'Dhenkanal',
    'Sibapur':             'Dhenkanal',
    'Akhuapal':            'Dhenkanal',
    'Ambapalasa':          'Dhenkanal',
    'Badajhara':           'Dhenkanal',
    'Barihapur':           'Dhenkanal',
    'Basoi':               'Dhenkanal',
    'Basulei':             'Dhenkanal',
    'Chandapur':           'Dhenkanal',
    'Damol':               'Dhenkanal',
    'Jayapurakateni':      'Dhenkanal',
    'Kalda':               'Dhenkanal',
    'Kandarsinga':         'Dhenkanal',
    'Kankadasoda':         'Dhenkanal',
    'Kankil':              'Dhenkanal',
    'Kantore':             'Dhenkanal',
    'Kualo':               'Dhenkanal',
    'Kumusi':              'Dhenkanal',
    'Lodhani':             'Dhenkanal',
    'Manikmara':           'Dhenkanal',
    'Muktapas':            'Dhenkanal',
    'Mundeilo':            'Dhenkanal',
    'Patarapada':          'Dhenkanal',
    'Patharakhamba':       'Dhenkanal',
    'Pitiri':              'Dhenkanal',
    'Renthapat':           'Dhenkanal',
    'Roda':                'Dhenkanal',
    'Sanda':               'Dhenkanal',
    'Saranga':             'Dhenkanal',
    'Bainsia':             'Dhenkanal',
    'Bega':                'Dhenkanal',
    'Bidharpur':           'Dhenkanal',
    'Dasamanapatana':      'Dhenkanal',
    'Deogan':              'Dhenkanal',
    'Digambarpur':         'Dhenkanal',
    'Gundurapasi':         'Dhenkanal',
    'Kabera':              'Dhenkanal',
    'Kaluria':             'Dhenkanal',
    'Karamula':            'Dhenkanal',
    'Kasipur':             'Dhenkanal',
    'Khandabandha':        'Dhenkanal',
    'Khankira':            'Dhenkanal',
    'Laulai':              'Dhenkanal',
    'Letheka':             'Dhenkanal',
    'Mandar':              'Dhenkanal',
    'Mathatentulia':       'Dhenkanal',
    'Neulpoi':             'Dhenkanal',
    'Pingua':              'Dhenkanal',
    'Poruhakhoja':         'Dhenkanal',
    'Raitala':             'Dhenkanal',
    'Ratanpur':            'Dhenkanal',
    'Santhapur':           'Dhenkanal',
    'Sorisiapada':         'Dhenkanal',
    'Balikuma':            'Dhenkanal',
    'Bam':                 'Dhenkanal',
    'Batagaon':            'Dhenkanal',
    'Birasal':             'Dhenkanal',
    'Biribolei':           'Dhenkanal',
    'Chandpur':            'Dhenkanal',
    'Dasipur':             'Dhenkanal',
    'Garhpalasuni':        'Dhenkanal',
    'Jhili':               'Dhenkanal',
    'Kantol':              'Dhenkanal',
    'Karagola':            'Dhenkanal',
    'Kerajoli':            'Dhenkanal',
    'Kuturia':             'Dhenkanal',
    'Mahabirod (K)':       'Dhenkanal',
    'Makuakateni':         'Dhenkanal',
    'Maruabili':           'Dhenkanal',
    'Pangatira':           'Dhenkanal',
    'Raibol':              'Dhenkanal',
    # Keonjhar (18 locations)
    'Keonjhar':        'Keonjhar',
    'Barbil':          'Keonjhar',
    'Joda':            'Keonjhar',
    'Anandapur':       'Keonjhar',
    'Champua':         'Keonjhar',
    'Ghatgaon':        'Keonjhar',
    'Harichandanpur':  'Keonjhar',
    'Telkoi':          'Keonjhar',
    'Saharpada':       'Keonjhar',
    'Patna':           'Keonjhar',
    'Banspal':         'Keonjhar',
    'Jhumpura':        'Keonjhar',
    'Hatadihi':        'Keonjhar',
    'Ghasipura':       'Keonjhar',
    'Kanjipani':       'Keonjhar',
    'Rugudi':          'Keonjhar',
    'Nandipada':       'Keonjhar',
    'Ramchandrapur':   'Keonjhar',
    # Khordha (18 locations)
    'Bhubaneswar':     'Khordha',
    'Jatni':           'Khordha',
    'Khordha':         'Khordha',
    'Balugaon':        'Khordha',
    'Banapur':         'Khordha',
    'Tangi':           'Khordha',
    'Bolagarh':        'Khordha',
    'Chilika':         'Khordha',
    'Begunia':         'Khordha',
    'Hanspal':         'Khordha',
    'Chandaka':        'Khordha',
    'Mancheswar':      'Khordha',
    'Aiginia':         'Khordha',
    'Khandagiri':      'Khordha',
    'Sundarpada':      'Khordha',
    'Janla':           'Khordha',
    'Mendhasala':      'Khordha',
    'Tapang':          'Khordha',
    # Jajpur (18 locations)
    'Jajpur':          'Jajpur',
    'Jajpur Road':     'Jajpur',
    'Vyasanagar':      'Jajpur',
    'Sukinda':         'Jajpur',
    'Dharmasala':      'Jajpur',
    'Binjharpur':      'Jajpur',
    'Dasarathpur':     'Jajpur',
    'Panikoili':       'Jajpur',
    'Bari':            'Jajpur',
    'Badachana':       'Jajpur',
    'Rasulpur':        'Jajpur',
    'Danagadi':        'Jajpur',
    'Mangalpur':       'Jajpur',
    'Jenapur':         'Jajpur',
    'Balichandrapur':  'Jajpur',
    'Chandipur':       'Jajpur',
    'Darpan':          'Jajpur',
    'Kalyanpur':       'Jajpur',
    # Other major cities
    'Cuttack':         'Cuttack',
    'Rourkela':        'Sundargarh',
    'Sambalpur':       'Sambalpur',
    'Berhampur':       'Ganjam',
}

LOCATIONS = sorted(LOCATION_DISTRICT.keys())


def get_aqi_category(aqi):
    """Get AQI category and emoji from AQI value."""
    for (low, high), (category, emoji) in AQI_CATEGORIES.items():
        if low <= aqi <= high:
            return category, emoji
    return 'Severe', '⚫'


def load_model():
    """Load the trained model and supporting files."""
    if not os.path.exists(MODEL_PATH):
        print("\n  ❌ Model not found! Please run train.py first.")
        print(f"     Expected: {MODEL_PATH}")
        sys.exit(1)

    model = joblib.load(MODEL_PATH)
    le = joblib.load(ENCODER_PATH)
    le_district = joblib.load(DISTRICT_ENCODER_PATH)
    feature_cols = joblib.load(FEATURES_PATH)

    print("  ✅ Model loaded successfully!")
    return model, le, le_district, feature_cols


def interactive_prediction(model, le, le_district, feature_cols):
    """Interactive CLI prediction mode with cascading filters."""
    print("\n" + "=" * 60)
    print("  AQI PREDICTION - Interactive Mode")
    print("=" * 60)
    print("  Flow: District → Location → Parameters → Prediction")
    print("  Type 'quit' or 'q' at any prompt to exit.\n")

    # Build district → locations mapping
    district_locations = {}
    for loc, dist in LOCATION_DISTRICT.items():
        district_locations.setdefault(dist, []).append(loc)
    for dist in district_locations:
        district_locations[dist].sort()

    districts = sorted(district_locations.keys())

    while True:
        print("-" * 60)
        try:
            # ── STEP 1: Select District ──────────────────────────
            print("\n  ┌─ STEP 1: Select District")
            print("  │")
            for i, dist in enumerate(districts, 1):
                count = len(district_locations[dist])
                print(f"  │  {i:2d}. {dist:<15s} ({count} locations)")
            print("  │")
            dist_input = input("  └─ Enter district number (or name): ").strip()

            if dist_input.lower() in ('quit', 'q', 'exit'):
                break

            # Parse district
            if dist_input.isdigit():
                dist_idx = int(dist_input) - 1
                if 0 <= dist_idx < len(districts):
                    district = districts[dist_idx]
                else:
                    print("  ❌ Invalid district number!")
                    continue
            else:
                district = dist_input.title()
                if district not in districts:
                    print(f"  ❌ Unknown district: {district}")
                    continue

            # ── STEP 2: Select Location ──────────────────────────
            locs = district_locations[district]
            print(f"\n  ┌─ STEP 2: Select Location in {district}")
            print("  │")
            for i, loc in enumerate(locs, 1):
                print(f"  │  {i:2d}. {loc}")
            print("  │")
            loc_input = input("  └─ Enter location number (or name): ").strip()

            if loc_input.lower() in ('quit', 'q', 'exit'):
                break

            if loc_input.isdigit():
                loc_idx = int(loc_input) - 1
                if 0 <= loc_idx < len(locs):
                    location = locs[loc_idx]
                else:
                    print("  ❌ Invalid location number!")
                    continue
            else:
                location = loc_input.title()
                if location not in locs:
                    print(f"  ❌ '{location}' not found in {district}!")
                    continue

            # ── STEP 3: Enter Parameters ─────────────────────────
            print(f"\n  ┌─ STEP 3: Enter Parameters for {location}, {district}")
            print("  │")
            pm25 = float(input("  │  PM2.5 (µg/m³)   : "))
            pm10 = float(input("  │  PM10  (µg/m³)   : "))
            no2  = float(input("  │  NO2   (ppb)     : "))
            so2  = float(input("  │  SO2   (ppb)     : "))
            co   = float(input("  │  CO    (mg/m³)   : "))
            o3   = float(input("  │  O3    (ppb)     : "))
            temp = float(input("  │  Temperature (°C): "))
            hum  = float(input("  │  Humidity (%)    : "))
            month = int(input("  │  Month (1-12)    : "))
            year  = int(input("  │  Year (e.g. 2025): "))
            print("  │")

            # Calculate day of year (approximate)
            from datetime import datetime
            day_of_year = datetime(year, month, 15).timetuple().tm_yday

            # Encode location and district
            try:
                loc_encoded = le.transform([location])[0]
                dist_encoded = le_district.transform([district])[0]
            except ValueError:
                print("  ❌ Location/District not recognized by encoder!")
                continue

            # Create feature array
            features = pd.DataFrame([[
                pm25, pm10, no2, so2, co, o3,
                temp, hum, month, year, day_of_year, loc_encoded, dist_encoded
            ]], columns=feature_cols)

            # Predict
            predicted_aqi = model.predict(features)[0]
            predicted_aqi = max(0, round(predicted_aqi))
            category, emoji = get_aqi_category(predicted_aqi)

            # Display result
            print("  └─ PREDICTION RESULT")
            print("\n" + "=" * 60)
            print(f"  📍 District  : {district}")
            print(f"  📍 Location  : {location}")
            print(f"  📅 Period    : {month}/{year}")
            print(f"  🌡️  AQI      : {predicted_aqi}")
            print(f"  {emoji} Category : {category}")
            print("=" * 60)

        except ValueError:
            print("  ❌ Invalid input! Please enter numeric values.")
        except KeyboardInterrupt:
            print("\n\n  Exiting...")
            break


def batch_prediction(model, le, le_district, feature_cols, csv_path):
    """Predict AQI from a CSV file."""
    print(f"\n  Loading data from: {csv_path}")

    if not os.path.exists(csv_path):
        print(f"  ❌ File not found: {csv_path}")
        return

    df = pd.read_csv(csv_path)
    print(f"  Loaded {len(df)} rows.")

    # Prepare features
    if 'Date' in df.columns:
        df['Date'] = pd.to_datetime(df['Date'])
        df['Month'] = df['Date'].dt.month
        df['Year'] = df['Date'].dt.year
        df['DayOfYear'] = df['Date'].dt.dayofyear

    if 'Location' in df.columns:
        df['Location_Encoded'] = le.transform(df['Location'])

    if 'District' in df.columns:
        df['District_Encoded'] = le_district.transform(df['District'])

    X = df[feature_cols]
    predictions = model.predict(X)
    df['Predicted_AQI'] = np.round(predictions).astype(int).clip(0)
    df['Predicted_Category'] = df['Predicted_AQI'].apply(lambda x: get_aqi_category(x)[0])

    # Save results
    output_path = csv_path.replace('.csv', '_predictions.csv')
    df.to_csv(output_path, index=False)
    print(f"\n  ✅ Predictions saved to: {output_path}")
    print(f"\n  Preview:")
    if 'Location' in df.columns:
        print(df[['Location', 'Predicted_AQI', 'Predicted_Category']].head(10).to_string(index=False))
    else:
        print(df[['Predicted_AQI', 'Predicted_Category']].head(10).to_string(index=False))


def main():
    """Main entry point."""
    print("\n" + "=" * 60)
    print("  AQI PREDICTION SYSTEM - Odisha")
    print("  Powered by XGBoost Machine Learning")
    print("=" * 60)

    model, le, le_district, feature_cols = load_model()

    if len(sys.argv) > 1:
        # Batch mode: python predict.py path/to/data.csv
        csv_path = sys.argv[1]
        batch_prediction(model, le, le_district, feature_cols, csv_path)
    else:
        # Interactive mode
        interactive_prediction(model, le, le_district, feature_cols)

    print("\n  Thank you for using AQI Prediction System!")
    print("=" * 60)


if __name__ == '__main__':
    main()
