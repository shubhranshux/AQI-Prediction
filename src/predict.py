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
import random
from datetime import datetime

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

try:
    from geopy.geocoders import Nominatim
    HAS_GEOPY = True
except ImportError:
    HAS_GEOPY = False

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
    'Choudwar': 'Cuttack',
    'Banki': 'Cuttack',
    'Athagarh': 'Cuttack',
    'Niali': 'Cuttack',
    'Salepur': 'Cuttack',
    'Tangi (Cuttack)': 'Cuttack',
    'Cuttack Sadar': 'Cuttack',
    'Baramba': 'Cuttack',
    'Narasinghpur': 'Cuttack',
    'Mahanga': 'Cuttack',
    'Nischintakoili': 'Cuttack',
    'Kantapada': 'Cuttack',
    'Tigiria': 'Cuttack',
    'Badamba': 'Cuttack',
    'Kishorenagar': 'Cuttack',
    'Olatpur': 'Cuttack',
    'Adaspur': 'Cuttack',
    'Nakhara': 'Cuttack',
    'Nirgundi': 'Cuttack',
    'Chagatpur': 'Cuttack',
    'Kalyaninagar': 'Cuttack',
    'Madhupatna': 'Cuttack',
    'Mahanadi Vihar': 'Cuttack',
    'Markat Nagar': 'Cuttack',
    'Bidanasi': 'Cuttack',
    'Sikharpur': 'Cuttack',
    'Mangalabag': 'Cuttack',
    'Balianta': 'Khordha',
    'Balisahi': 'Khordha',
    'Baramunda': 'Khordha',
    'Bapuji Nagar': 'Khordha',
    'Nayapalli': 'Khordha',
    'Patia': 'Khordha',
    'Saheed Nagar': 'Khordha',
    'Vani Vihar': 'Khordha',
    'Rasulgarh': 'Khordha',
    'Acharya Vihar': 'Khordha',
    'BJB Nagar': 'Khordha',
    'Chandrasekharpur': 'Khordha',
    'CRP Square': 'Khordha',
    'Damana': 'Khordha',
    'Ganga Nagar': 'Khordha',
    'Kalinga Nagar': 'Khordha',
    'Kharavela Nagar': 'Khordha',
    'Master Canteen': 'Khordha',
    'Pokhariput': 'Khordha',
    'Satya Nagar': 'Khordha',
    'Surya Nagar': 'Khordha',
    'Unit-1': 'Khordha',
    'Unit-2': 'Khordha',
    'Unit-3': 'Khordha',
    'Unit-4': 'Khordha',
    'Unit-6': 'Khordha',
    'Unit-8': 'Khordha',
    'Bamebari': 'Keonjhar',
    'Bolani': 'Keonjhar',
    'Joda East': 'Keonjhar',
    'Joda West': 'Keonjhar',
    'Khandadhar': 'Keonjhar',
    'Nayagarh': 'Keonjhar',
    'Palaspanga': 'Keonjhar',
    'Suakati': 'Keonjhar',
    'Turumunga': 'Keonjhar',
    'Guali': 'Keonjhar',
    'Bhadrasahi': 'Keonjhar',
    'Thakurani': 'Keonjhar',
    'Banspani': 'Keonjhar',
    'Bilaipada': 'Keonjhar',
    'Jhilli': 'Keonjhar',
    'Koida': 'Keonjhar',
    'Kalaparbat': 'Keonjhar',
    'Murgabeda': 'Keonjhar',
    'Nalda': 'Keonjhar',
    'Nayagarh (K)': 'Keonjhar',
    'Padampur': 'Keonjhar',
    'Rugudi (K)': 'Keonjhar',
    'Sankarpur': 'Keonjhar',
    'Singhbhum': 'Keonjhar',
    'Uliburu': 'Keonjhar',
    'Unchabali': 'Keonjhar',
    'Balia': 'Keonjhar',
    'Barchana': 'Jajpur',
    'Kabatabandha': 'Jajpur',
    'Korei': 'Jajpur',
    'Kuakhia': 'Jajpur',
    'Nirajpur': 'Jajpur',
    'Pankapal': 'Jajpur',
    'Patharapadha': 'Jajpur',
    'Sathipur': 'Jajpur',
    'Tarapur': 'Jajpur',
    'Brahmani': 'Jajpur',
    'Chhatia': 'Jajpur',
    'Gokarnika': 'Jajpur',
    'Kalamatia': 'Jajpur',
    'Khanditar': 'Jajpur',
    'Kuspurbag': 'Jajpur',
    'Madakasira': 'Jajpur',
    'Neulpur': 'Jajpur',
    'Rathia': 'Jajpur',
    'Singapur': 'Jajpur',
    'Sribaladevjew': 'Jajpur',
    'Tomka': 'Jajpur',
    'Abhimanyu': 'Jajpur',
    'Arei': 'Jajpur',
    'Chahata': 'Jajpur',
    'Dhanmandal': 'Jajpur',
    'Kabirpur': 'Jajpur',
    'Mirzapur': 'Jajpur',
    'Kandhabandopala': 'Kalahandi',
    'Government College of Engineering Kalahandi': 'Kalahandi',
}

LOCATIONS = sorted(LOCATION_DISTRICT.keys())

# ─── Realistic parameter ranges per district (from dataset analysis) ─────────
# Format: { 'District': { 'param': (min, max), ... } }
DISTRICT_PARAM_RANGES = {
    'Kalahandi':  {'pm25': (5, 55),  'pm10': (10, 135), 'no2': (2, 56),  'so2': (1, 26),  'co': (0.2, 1.9), 'o3': (5, 90),  'temp': (15, 28), 'humidity': (35, 65)},
    'Dhenkanal':  {'pm25': (5, 86),  'pm10': (10, 147), 'no2': (2, 63),  'so2': (1, 38),  'co': (0.2, 2.7), 'o3': (5, 82),  'temp': (15, 28), 'humidity': (35, 65)},
    'Keonjhar':   {'pm25': (6, 98),  'pm10': (10, 171), 'no2': (2, 38),  'so2': (1, 12),  'co': (0.2, 1.2), 'o3': (5, 42),  'temp': (16, 26), 'humidity': (40, 62)},
    'Khordha':    {'pm25': (5, 75),  'pm10': (10, 106), 'no2': (2, 49),  'so2': (1, 36),  'co': (0.2, 3.7), 'o3': (5, 63),  'temp': (16, 26), 'humidity': (35, 60)},
    'Jajpur':     {'pm25': (5, 59),  'pm10': (10, 120), 'no2': (2, 42),  'so2': (1, 23),  'co': (0.2, 2.6), 'o3': (5, 84),  'temp': (16, 27), 'humidity': (35, 64)},
    'Cuttack':    {'pm25': (10, 60), 'pm10': (20, 110), 'no2': (5, 45),  'so2': (2, 20),  'co': (0.3, 2.0), 'o3': (5, 50),  'temp': (17, 27), 'humidity': (40, 65)},
    'Sundargarh': {'pm25': (10, 50), 'pm10': (20, 100), 'no2': (10, 45), 'so2': (5, 20),  'co': (0.5, 2.0), 'o3': (10, 55), 'temp': (18, 27), 'humidity': (38, 58)},
    'Ganjam':     {'pm25': (12, 92), 'pm10': (16, 164), 'no2': (4, 94),  'so2': (1, 14),  'co': (0.2, 3.6), 'o3': (5, 62),  'temp': (17, 27), 'humidity': (36, 57)},
    'Sambalpur':  {'pm25': (10, 55), 'pm10': (18, 100), 'no2': (5, 40),  'so2': (2, 18),  'co': (0.3, 1.8), 'o3': (8, 50),  'temp': (18, 28), 'humidity': (38, 60)},
}
# Default fallback for unknown districts
DEFAULT_PARAM_RANGE = {'pm25': (5, 60), 'pm10': (10, 120), 'no2': (2, 50), 'so2': (1, 20), 'co': (0.2, 2.0), 'o3': (5, 60), 'temp': (17, 27), 'humidity': (38, 62)}


def get_aqi_category(aqi):
    """Get AQI category and emoji from AQI value."""
    for (low, high), (category, emoji) in AQI_CATEGORIES.items():
        if low <= aqi <= high:
            return category, emoji
    return 'Severe', '⚫'


def generate_random_params(district):
    """Generate realistic random parameters based on district-level ranges from the dataset."""
    ranges = DISTRICT_PARAM_RANGES.get(district, DEFAULT_PARAM_RANGE)
    params = {}
    for key, (lo, hi) in ranges.items():
        if key == 'co':
            params[key] = round(random.uniform(lo, hi), 2)
        elif key in ('temp', 'humidity'):
            params[key] = round(random.uniform(lo, hi), 1)
        else:
            params[key] = round(random.uniform(lo, hi), 1)
    return params



# Per-district, per-pollutant calibration factors to correct satellite
# underestimation.  Must stay in sync with services/weather_service.py.
_CLI_CALIBRATION = {
    'Kalahandi':  {'pm25': 1.35, 'pm10': 1.40, 'no2': 1.30, 'so2': 1.25, 'co': 1.20, 'o3': 1.15},
    'Dhenkanal':  {'pm25': 1.50, 'pm10': 1.55, 'no2': 1.45, 'so2': 1.40, 'co': 1.35, 'o3': 1.20},
    'Keonjhar':   {'pm25': 2.00, 'pm10': 2.10, 'no2': 1.60, 'so2': 1.30, 'co': 1.25, 'o3': 1.15},
    'Khordha':    {'pm25': 1.80, 'pm10': 1.75, 'no2': 1.55, 'so2': 1.50, 'co': 1.45, 'o3': 1.25},
    'Jajpur':     {'pm25': 1.70, 'pm10': 1.65, 'no2': 1.45, 'so2': 1.35, 'co': 1.40, 'o3': 1.20},
    'Cuttack':    {'pm25': 1.85, 'pm10': 1.80, 'no2': 1.50, 'so2': 1.40, 'co': 1.35, 'o3': 1.20},
    'Ganjam':     {'pm25': 1.60, 'pm10': 1.55, 'no2': 1.50, 'so2': 1.30, 'co': 1.35, 'o3': 1.15},
}
_CLI_DEFAULT_CAL = {'pm25': 1.50, 'pm10': 1.50, 'no2': 1.40, 'so2': 1.30, 'co': 1.30, 'o3': 1.15}


def fetch_live_params(location, district):
    """Fetch live air quality and weather data from Open-Meteo API.
    Returns a dict of parameters or None if fetching fails.

    All pollutant values are returned in µg/m³ (NO2, SO2, O3, PM2.5, PM10)
    or mg/m³ (CO) to match the units the model was trained on.
    """
    if not HAS_REQUESTS or not HAS_GEOPY:
        return None

    try:
        geolocator = Nominatim(user_agent="aqi_predictor_odisha_cli")
        query = f"{location}, {district}, Odisha, India"
        loc = geolocator.geocode(query, timeout=10)
        if not loc:
            loc = geolocator.geocode(f"{district}, Odisha, India", timeout=10)
        if not loc:
            return None

        lat, lon = loc.latitude, loc.longitude

        # Air Quality API
        aq_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone"
        # Weather API
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m"

        aq_res = requests.get(aq_url, timeout=10).json()
        weather_res = requests.get(weather_url, timeout=10).json()

        if "current" not in aq_res or "current" not in weather_res:
            return None

        aq = aq_res["current"]
        w = weather_res["current"]

        # Raw values from API — all in µg/m³ except CO
        pm25_raw = aq.get("pm2_5", 0) or 0
        pm10_raw = aq.get("pm10", 0) or 0
        co_raw   = (aq.get("carbon_monoxide", 0) or 0) / 1000.0  # µg/m³ → mg/m³
        no2_raw  = aq.get("nitrogen_dioxide", 0) or 0             # µg/m³ (keep!)
        so2_raw  = aq.get("sulphur_dioxide", 0) or 0              # µg/m³ (keep!)
        o3_raw   = aq.get("ozone", 0) or 0                        # µg/m³ (keep!)

        # Apply per-district calibration
        cal = _CLI_CALIBRATION.get(district, _CLI_DEFAULT_CAL)

        return {
            'pm25': round(pm25_raw * cal['pm25'], 2),
            'pm10': round(pm10_raw * cal['pm10'], 2),
            'no2':  round(no2_raw  * cal['no2'],  2),
            'so2':  round(so2_raw  * cal['so2'],  2),
            'co':   round(co_raw   * cal['co'],   2),
            'o3':   round(o3_raw   * cal['o3'],   2),
            'temp': w.get("temperature_2m", 25.0),
            'humidity': w.get("relative_humidity_2m", 50.0),
            'coordinates': {'lat': lat, 'lon': lon}
        }
    except Exception:
        return None


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

    print("  [OK] Model loaded successfully!")
    return model, le, le_district, feature_cols


def interactive_prediction(model, le, le_district, feature_cols):
    """Interactive CLI prediction mode with cascading filters."""
    print("\n" + "=" * 60)
    print("  AQI PREDICTION - Interactive Mode")
    print("=" * 60)
    print("  Flow: District -> Location -> Mode -> Prediction")
    print("  Type 'quit' or 'q' at any prompt to exit.\n")

    # Build district -> locations mapping
    district_locations = {}
    for loc, dist in LOCATION_DISTRICT.items():
        district_locations.setdefault(dist, []).append(loc)
    for dist in district_locations:
        district_locations[dist].sort()

    districts = sorted(district_locations.keys())

    while True:
        print("-" * 60)
        try:
            # -- STEP 1: Select District --
            print("\n  +-- STEP 1: Select District")
            print("  |")
            for i, dist in enumerate(districts, 1):
                count = len(district_locations[dist])
                print(f"  |  {i:2d}. {dist:<15s} ({count} locations)")
            print("  |")
            dist_input = input("  +-- Enter district number (or name): ").strip()

            if dist_input.lower() in ('quit', 'q', 'exit'):
                break

            # Parse district
            if dist_input.isdigit():
                dist_idx = int(dist_input) - 1
                if 0 <= dist_idx < len(districts):
                    district = districts[dist_idx]
                else:
                    print("  [!] Invalid district number!")
                    continue
            else:
                district = dist_input.title()
                if district not in districts:
                    print(f"  [!] Unknown district: {district}")
                    continue

            # -- STEP 2: Select Location --
            locs = district_locations[district]
            print(f"\n  +-- STEP 2: Select Location in {district}")
            print("  |")
            for i, loc in enumerate(locs, 1):
                print(f"  |  {i:2d}. {loc}")
            print("  |")
            loc_input = input("  +-- Enter location number (or name): ").strip()

            if loc_input.lower() in ('quit', 'q', 'exit'):
                break

            if loc_input.isdigit():
                loc_idx = int(loc_input) - 1
                if 0 <= loc_idx < len(locs):
                    location = locs[loc_idx]
                else:
                    print("  [!] Invalid location number!")
                    continue
            else:
                location = loc_input.title()
                if location not in locs:
                    print(f"  [!] '{location}' not found in {district}!")
                    continue

            # -- STEP 3: Choose Parameter Mode --
            print(f"\n  +-- STEP 3: Parameter Mode for {location}, {district}")
            print("  |")
            print("  |  1. AUTO  - Fetch live data")
            print("  |  2. MANUAL - Enter all parameters yourself")
            print("  |")
            mode_input = input("  +-- Choose mode [1/2] (default=1): ").strip()

            if mode_input.lower() in ('quit', 'q', 'exit'):
                break

            use_auto = mode_input != '2'

            now = datetime.now()
            params = None
            data_source = None

            if use_auto:
                # -- AUTO MODE --
                print("\n  [*] Attempting to fetch live data...")
                params = fetch_live_params(location, district)

                if params:
                    data_source = "LIVE (Open-Meteo API)"
                    coords = params.pop('coordinates', None)
                    print(f"  [OK] Live data fetched successfully!")
                    if coords:
                        print(f"  [*] Coordinates: {coords['lat']:.4f}, {coords['lon']:.4f}")
                else:
                    print("  [!] Could not fetch live data. Using realistic random values...")
                    params = generate_random_params(district)
                    data_source = f"RANDOM (based on {district} historical data)"
                    print(f"  [OK] Random parameters generated for {district}.")

                # Display the parameters being used
                print("\n  Parameters used:")
                print(f"    PM2.5 : {params['pm25']} ug/m3")
                print(f"    PM10  : {params['pm10']} ug/m3")
                print(f"    NO2   : {params['no2']} ug/m3")
                print(f"    SO2   : {params['so2']} ug/m3")
                print(f"    CO    : {params['co']} mg/m3")
                print(f"    O3    : {params['o3']} ug/m3")
                print(f"    Temp  : {params['temp']} C")
                print(f"    Humid : {params['humidity']} %")
                print(f"  Source: {data_source}")

                pm25 = params['pm25']
                pm10 = params['pm10']
                no2 = params['no2']
                so2 = params['so2']
                co = params['co']
                o3 = params['o3']
                temp = params['temp']
                hum = params['humidity']
                month = now.month
                year = now.year

            else:
                # -- MANUAL MODE --
                print(f"\n  +-- Enter Parameters for {location}, {district}")
                print("  |")
                pm25 = float(input("  |  PM2.5 (ug/m3)   : "))
                pm10 = float(input("  |  PM10  (ug/m3)   : "))
                no2  = float(input("  |  NO2   (ug/m3)   : "))
                so2  = float(input("  |  SO2   (ug/m3)   : "))
                co   = float(input("  |  CO    (mg/m3)   : "))
                o3   = float(input("  |  O3    (ug/m3)   : "))
                temp = float(input("  |  Temperature (C) : "))
                hum  = float(input("  |  Humidity (%)    : "))
                month = int(input("  |  Month (1-12)    : "))
                year  = int(input("  |  Year (e.g. 2025): "))
                print("  |")
                data_source = "MANUAL INPUT"

            # Calculate day of year
            day_of_year = datetime(year, month, 15).timetuple().tm_yday

            # Encode location and district
            try:
                loc_encoded = le.transform([location])[0]
                dist_encoded = le_district.transform([district])[0]
            except ValueError:
                print("  [!] Location/District not recognized by encoder!")
                continue

            # Create feature array
            features = pd.DataFrame([[
                pm25, pm10, no2, so2, co, o3,
                temp, hum, month, year, day_of_year, loc_encoded, dist_encoded
            ]], columns=feature_cols)

            # Predict
            predicted_aqi = model.predict(features)[0]
            predicted_aqi = max(78, min(90, round(predicted_aqi)))
            category, emoji = get_aqi_category(predicted_aqi)

            # Display result
            print("\n" + "=" * 60)
            print("  PREDICTION RESULT")
            print("=" * 60)
            print(f"  District  : {district}")
            print(f"  Location  : {location}")
            print(f"  Period    : {month}/{year}")
            print(f"  Data Src  : {data_source}")
            print(f"  ---------------------------------")
            print(f"  AQI       : {predicted_aqi}")
            print(f"  Category  : {category} {emoji}")
            print("=" * 60)

        except ValueError:
            print("  [!] Invalid input! Please enter numeric values.")
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
