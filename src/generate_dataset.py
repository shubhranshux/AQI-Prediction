"""
AQI Dataset Generator for Odisha Locations
Generates exactly 5,000 rows of synthetic AQI data across 15 Odisha cities
over 4 years (Jan 2022 - Dec 2025) with realistic seasonal and location-based variations.
"""

import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

# Seed for reproducibility
np.random.seed(42)

# ─── Configuration ───────────────────────────────────────────────────────────

TOTAL_ROWS = 20000

# Odisha locations with district, type, pollution characteristics, and row weight
# Kalahandi locations get weight=3 for MAJOR focus (dominant data share)
LOCATIONS = {
    # ── Kalahandi District (100 Locations - Massive Focus) ───────
    # Urban & Major Towns
    'Bhawanipatna':     {'district': 'Kalahandi', 'type': 'urban',      'pollution_factor': 0.95, 'weight': 3},
    'Kesinga':          {'district': 'Kalahandi', 'type': 'urban',      'pollution_factor': 0.85, 'weight': 3},
    'Dharmagarh':       {'district': 'Kalahandi', 'type': 'urban',      'pollution_factor': 0.75, 'weight': 3},
    'Junagarh':         {'district': 'Kalahandi', 'type': 'urban',      'pollution_factor': 0.70, 'weight': 3},
    'Jaypatna':         {'district': 'Kalahandi', 'type': 'semi-urban', 'pollution_factor': 0.65, 'weight': 3},
    'Madanpur Rampur':  {'district': 'Kalahandi', 'type': 'semi-urban', 'pollution_factor': 0.60, 'weight': 3},
    
    # Industrial / Mining Areas
    'Lanjigarh':        {'district': 'Kalahandi', 'type': 'industrial', 'pollution_factor': 1.45, 'weight': 3},
    'Biswanathpur':     {'district': 'Kalahandi', 'type': 'mining',     'pollution_factor': 1.10, 'weight': 3},
    'Narayanpur':       {'district': 'Kalahandi', 'type': 'industrial', 'pollution_factor': 0.90, 'weight': 3},
    
    # Block Headquarters & Key Rural Hubs
    'Kalampur':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.55, 'weight': 3},
    'Karlamunda':       {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.52, 'weight': 3},
    'Thuamul Rampur':   {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.48, 'weight': 3},
    'Golamunda':        {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.50, 'weight': 3},
    'Narla':            {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.55, 'weight': 3},
    'Koksara':          {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.50, 'weight': 3},
    'Lanjigarh Road':   {'district': 'Kalahandi', 'type': 'semi-urban', 'pollution_factor': 0.75, 'weight': 3},
    'Ampani':           {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Utkela':           {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.50, 'weight': 3},
    'Boden':            {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.47, 'weight': 3},
    'Risida':           {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Parla':            {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    
    # Gram Panchayats & Villages (North Kalahandi)
    'Belkhandi':        {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Musiguda':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.48, 'weight': 3},
    'Pastikudi':        {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Brundabahal':      {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.40, 'weight': 3},
    'Kusurla':          {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Gajabahapda':      {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Deypur':           {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Kankeri':          {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Santpur':          {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Rupra':            {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.52, 'weight': 3},
    
    # Gram Panchayats & Villages (South Kalahandi)
    'Mukhiguda':        {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.48, 'weight': 3},
    'Motar':            {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Ladugaon':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Behera':           {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.47, 'weight': 3},
    'Baldhimal':        {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Charbahal':        {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Chilpa':           {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Gambhariguda':     {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Habaspur':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Kalam':            {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    
    # Gram Panchayats & Villages (West Kalahandi / Dharmagarh Sub-div)
    'Kutumara':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.40, 'weight': 3},
    'Karchala':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Sanchergaon':      {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Sankrakhol':       {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Kankutru':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Duhuria':          {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Gudialipadar':     {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Jogimunda':        {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Kankupa':          {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Pujariguda':       {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    
    # Gram Panchayats & Villages (East Kalahandi / Madanpur Rampur area)
    'Urladani':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.38, 'weight': 3},
    'Mohangiri':        {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.40, 'weight': 3},
    'Manikera':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Madanpur':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Salepali':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Bhursha':          {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Gogula':           {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Barabandha':       {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Risida (Karlamunda)':{'district': 'Kalahandi', 'type': 'rural',    'pollution_factor': 0.46, 'weight': 3}, # Distinguished from other Risida
    'Regoda':           {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.40, 'weight': 3},
    
    # Gram Panchayats & Villages (Thuamul Rampur / Tribal Area)
    'Adri':             {'district': 'Kalahandi', 'type': 'forest',     'pollution_factor': 0.35, 'weight': 3},
    'Gopinathpur':      {'district': 'Kalahandi', 'type': 'forest',     'pollution_factor': 0.36, 'weight': 3},
    'Kanakpur':         {'district': 'Kalahandi', 'type': 'forest',     'pollution_factor': 0.38, 'weight': 3},
    'Kerpai':           {'district': 'Kalahandi', 'type': 'forest',     'pollution_factor': 0.34, 'weight': 3},
    'Mahulpatna':       {'district': 'Kalahandi', 'type': 'forest',     'pollution_factor': 0.37, 'weight': 3},
    'Maland':           {'district': 'Kalahandi', 'type': 'forest',     'pollution_factor': 0.35, 'weight': 3},
    'Nakrundi':         {'district': 'Kalahandi', 'type': 'forest',     'pollution_factor': 0.33, 'weight': 3},
    'Podapadar':        {'district': 'Kalahandi', 'type': 'forest',     'pollution_factor': 0.36, 'weight': 3},
    'Sindhipadar':      {'district': 'Kalahandi', 'type': 'forest',     'pollution_factor': 0.35, 'weight': 3},
    'Talampadar':       {'district': 'Kalahandi', 'type': 'forest',     'pollution_factor': 0.34, 'weight': 3},
    
    # Gram Panchayats & Villages (Narla / Kesinga area)
    'Balanpada':        {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Budhipadar':       {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.47, 'weight': 3},
    'Ghantiguda':       {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Kandel':           {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Luhura':           {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Mandinga':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Palam':            {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Rakamal':          {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Siletpada':        {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Tulapada':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    
    # More Villages across blocks
    'Arebeda':          {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Badakara':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Bhimkela':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Chancher':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Dalguma':          {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Gudigaon':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Karlapada':        {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Khasiguda':        {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Mahichala':        {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Pastikudi (Junagarh)':{'district': 'Kalahandi', 'type': 'rural',   'pollution_factor': 0.42, 'weight': 3},
    'Saganbhadi':       {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.40, 'weight': 3},
    'Tundla':           {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Uditnarayanpur':   {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Amathola':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Boria':            {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Daspur':           {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Kalopala':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Kusumkhunti':      {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Majhiguda':        {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Nuagaon':          {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Pharad':           {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Sialjodi':         {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Tentulikhunti':    {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Chapria':          {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Dhanrabhata':      {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Gotamunda':        {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.40, 'weight': 3},
    'Kaigam':           {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Phalsapada':       {'district': 'Kalahandi', 'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    # ── Dhenkanal District (All Gram Panchayats - Major Focus) ──
    # Urban & Major Towns / Block HQs
    'Dhenkanal':        {'district': 'Dhenkanal',   'type': 'urban',      'pollution_factor': 0.95, 'weight': 3},
    'Kamakhyanagar':    {'district': 'Dhenkanal',   'type': 'semi-urban', 'pollution_factor': 0.72, 'weight': 3},
    'Hindol':           {'district': 'Dhenkanal',   'type': 'semi-urban', 'pollution_factor': 0.65, 'weight': 3},
    'Bhuban':           {'district': 'Dhenkanal',   'type': 'semi-urban', 'pollution_factor': 0.70, 'weight': 3},
    'Parjang':          {'district': 'Dhenkanal',   'type': 'semi-urban', 'pollution_factor': 0.62, 'weight': 3},
    'Odapada':          {'district': 'Dhenkanal',   'type': 'semi-urban', 'pollution_factor': 0.60, 'weight': 3},
    'Gondia':           {'district': 'Dhenkanal',   'type': 'industrial', 'pollution_factor': 1.10, 'weight': 3},
    'Kankadahad':       {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.58, 'weight': 3},
    'Sarang':           {'district': 'Dhenkanal',   'type': 'industrial', 'pollution_factor': 0.90, 'weight': 3},
    'Motanga':          {'district': 'Dhenkanal',   'type': 'industrial', 'pollution_factor': 0.85, 'weight': 3},
    'Rasol':            {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.55, 'weight': 3},
    'Nihalprasad':      {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.52, 'weight': 3},
    'Kantilo':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.55, 'weight': 3},
    'Joranda':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.50, 'weight': 3},
    'Sadangi':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.48, 'weight': 3},
    'Tumusinga':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.47, 'weight': 3},
    'Mahisapat':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.56, 'weight': 3},
    'Balimi':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Meramundali':      {'district': 'Dhenkanal',   'type': 'industrial', 'pollution_factor': 1.05, 'weight': 3},
    # ── Dhenkanal Sadar Block GPs ────────────────────────────────
    'Baladibandha':     {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Balarampur':       {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.48, 'weight': 3},
    'Baliamba':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Banasingh':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Barada':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Beltikiri':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Bhalibol Kateni':  {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Bhapur':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.47, 'weight': 3},
    'Chandrasekhar Prasad':{'district': 'Dhenkanal','type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Chaulia':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Dhirapatna':       {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Gadasila':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Gengutia':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Ghagaramunda':     {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Ghatipiri':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Gobinda Prasad':   {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Gobindapur':       {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Gunadei':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Gundicha Pada':    {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Indipur':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.47, 'weight': 3},
    'Kaimati':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Kankadpal':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Sadasivapur':      {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Sankulei':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Saptasajya':       {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Siminai':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Sogarpasi':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Dharanipatana':    {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Ganeshwarpur':     {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.50, 'weight': 3},
    # ── Bhuban Block GPs ────────────────────────────────────────
    'Arakhapal':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Balibo':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Baruan (B)':       {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Bhusal':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Dayanabili':       {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Dhalapada':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.47, 'weight': 3},
    'Dighi':            {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Ekatali':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Gada Nrusingha Prasad':{'district':'Dhenkanal','type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Jamunakote':       {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Jiral':            {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.48, 'weight': 3},
    'Kuninda':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Mahulpal':         {'district': 'Dhenkanal',   'type': 'forest',     'pollution_factor': 0.35, 'weight': 3},
    'Marthapur':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Mathakaragola':    {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Mrudanga':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Surapratapapur':   {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    # ── Hindol Block GPs ────────────────────────────────────────
    'Bampa':            {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Baunsa Pokhari':   {'district': 'Dhenkanal',   'type': 'forest',     'pollution_factor': 0.36, 'weight': 3},
    'Gulehi':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Hatura':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Kansara':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Kantamila':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Madhapur':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Mahalunda':        {'district': 'Dhenkanal',   'type': 'forest',     'pollution_factor': 0.37, 'weight': 3},
    'Nuabag':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    # ── Kamakhyanagar Block GPs ─────────────────────────────────
    'Analabereni':      {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Badasuanlo':       {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Baisinga':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Baligorada':       {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Bankuala':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Baruan (K)':       {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.47, 'weight': 3},
    'Baunsapal':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Bhairpur':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Budhibil':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Jagannathpur':     {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Kadua':            {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Kanapura':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Kantapal':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Kantiokateni':     {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Kantioputasahi':   {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Kotagara':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Kusumjodi':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Mahulpal (K)':     {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Ray Narasinghpur': {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.47, 'weight': 3},
    'Saruali':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Sogar':            {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    # ── Odapada Block GPs ───────────────────────────────────────
    'Badalo':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Balaramprasad':    {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Bangurisingh':     {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Bido':             {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Kalanga':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Kamalanga':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Kandabindha':      {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Kasiadihi':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Khadag Prasad':    {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.47, 'weight': 3},
    'Khuntujhari':      {'district': 'Dhenkanal',   'type': 'forest',     'pollution_factor': 0.36, 'weight': 3},
    'Kottam':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Kusupunga':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Mangalpur (O)':    {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Mottanga':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.48, 'weight': 3},
    'Nadhera':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Nayabhagirathipur':{'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Nimidha':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Sadashibpur':      {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Sibapur':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    # ── Parjang Block GPs ───────────────────────────────────────
    'Akhuapal':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Ambapalasa':       {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Badajhara':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Barihapur':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Basoi':            {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Basulei':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Chandapur':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Damol':            {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Jayapurakateni':   {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Kalda':            {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Kandarsinga':      {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Kankadasoda':      {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Kankil':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Kantore':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Kualo':            {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Kumusi':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Lodhani':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Manikmara':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Muktapas':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Mundeilo':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Patarapada':       {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Patharakhamba':    {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Pitiri':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Renthapat':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Roda':             {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Sanda':            {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Saranga':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    # ── Gondia Block GPs ────────────────────────────────────────
    'Bainsia':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Bega':             {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Bidharpur':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Dasamanapatana':   {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Deogan':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Digambarpur':      {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Gundurapasi':      {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Kabera':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Kaluria':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Karamula':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Kasipur':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Khandabandha':     {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Khankira':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Laulai':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Letheka':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Mandar':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Mathatentulia':    {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Neulpoi':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Pingua':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Poruhakhoja':      {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Raitala':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Ratanpur':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Santhapur':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Sorisiapada':      {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    # ── Kankadahad Block GPs ────────────────────────────────────
    'Balikuma':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Bam':              {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Batagaon':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Birasal':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Biribolei':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Chandpur':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Dasipur':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Garhpalasuni':     {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Jhili':            {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Kantol':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.41, 'weight': 3},
    'Karagola':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Kerajoli':         {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Kuturia':          {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    'Mahabirod (K)':    {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.46, 'weight': 3},
    'Makuakateni':      {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.44, 'weight': 3},
    'Maruabili':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.43, 'weight': 3},
    'Pangatira':        {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.45, 'weight': 3},
    'Raibol':           {'district': 'Dhenkanal',   'type': 'rural',      'pollution_factor': 0.42, 'weight': 3},
    # ── Keonjhar District (18 Locations) ─────────────────────────
    'Keonjhar':         {'district': 'Keonjhar',    'type': 'urban',      'pollution_factor': 1.0,  'weight': 1},
    'Barbil':           {'district': 'Keonjhar',    'type': 'industrial', 'pollution_factor': 1.55, 'weight': 1},
    'Joda':             {'district': 'Keonjhar',    'type': 'industrial', 'pollution_factor': 1.50, 'weight': 1},
    'Anandapur':        {'district': 'Keonjhar',    'type': 'rural',      'pollution_factor': 0.65, 'weight': 1},
    'Champua':          {'district': 'Keonjhar',    'type': 'industrial', 'pollution_factor': 1.35, 'weight': 1},
    'Ghatgaon':         {'district': 'Keonjhar',    'type': 'rural',      'pollution_factor': 0.60, 'weight': 1},
    'Harichandanpur':   {'district': 'Keonjhar',    'type': 'rural',      'pollution_factor': 0.55, 'weight': 1},
    'Telkoi':           {'district': 'Keonjhar',    'type': 'rural',      'pollution_factor': 0.58, 'weight': 1},
    'Saharpada':        {'district': 'Keonjhar',    'type': 'rural',      'pollution_factor': 0.50, 'weight': 1},
    'Patna':            {'district': 'Keonjhar',    'type': 'rural',      'pollution_factor': 0.52, 'weight': 1},
    'Banspal':          {'district': 'Keonjhar',    'type': 'rural',      'pollution_factor': 0.45, 'weight': 1},
    'Jhumpura':         {'district': 'Keonjhar',    'type': 'rural',      'pollution_factor': 0.48, 'weight': 1},
    'Hatadihi':         {'district': 'Keonjhar',    'type': 'rural',      'pollution_factor': 0.53, 'weight': 1},
    'Ghasipura':        {'district': 'Keonjhar',    'type': 'rural',      'pollution_factor': 0.50, 'weight': 1},
    'Kanjipani':        {'district': 'Keonjhar',    'type': 'industrial', 'pollution_factor': 1.25, 'weight': 1},
    'Rugudi':           {'district': 'Keonjhar',    'type': 'rural',      'pollution_factor': 0.46, 'weight': 1},
    'Nandipada':        {'district': 'Keonjhar',    'type': 'rural',      'pollution_factor': 0.44, 'weight': 1},
    'Ramchandrapur':    {'district': 'Keonjhar',    'type': 'rural',      'pollution_factor': 0.47, 'weight': 1},
    # ── Khordha District (18 Locations) ──────────────────────────
    'Bhubaneswar':      {'district': 'Khordha',     'type': 'urban',      'pollution_factor': 1.2,  'weight': 1},
    'Jatni':            {'district': 'Khordha',     'type': 'rural',      'pollution_factor': 0.80, 'weight': 1},
    'Khordha':          {'district': 'Khordha',     'type': 'urban',      'pollution_factor': 0.90, 'weight': 1},
    'Balugaon':         {'district': 'Khordha',     'type': 'rural',      'pollution_factor': 0.65, 'weight': 1},
    'Banapur':          {'district': 'Khordha',     'type': 'rural',      'pollution_factor': 0.60, 'weight': 1},
    'Tangi':            {'district': 'Khordha',     'type': 'rural',      'pollution_factor': 0.62, 'weight': 1},
    'Bolagarh':         {'district': 'Khordha',     'type': 'rural',      'pollution_factor': 0.55, 'weight': 1},
    'Chilika':          {'district': 'Khordha',     'type': 'coastal',    'pollution_factor': 0.45, 'weight': 1},
    'Begunia':          {'district': 'Khordha',     'type': 'rural',      'pollution_factor': 0.50, 'weight': 1},
    'Hanspal':          {'district': 'Khordha',     'type': 'urban',      'pollution_factor': 1.05, 'weight': 1},
    'Chandaka':         {'district': 'Khordha',     'type': 'rural',      'pollution_factor': 0.55, 'weight': 1},
    'Mancheswar':       {'district': 'Khordha',     'type': 'industrial', 'pollution_factor': 1.10, 'weight': 1},
    'Aiginia':          {'district': 'Khordha',     'type': 'urban',      'pollution_factor': 0.95, 'weight': 1},
    'Khandagiri':       {'district': 'Khordha',     'type': 'urban',      'pollution_factor': 1.00, 'weight': 1},
    'Sundarpada':       {'district': 'Khordha',     'type': 'urban',      'pollution_factor': 0.92, 'weight': 1},
    'Janla':            {'district': 'Khordha',     'type': 'rural',      'pollution_factor': 0.58, 'weight': 1},
    'Mendhasala':       {'district': 'Khordha',     'type': 'rural',      'pollution_factor': 0.52, 'weight': 1},
    'Tapang':           {'district': 'Khordha',     'type': 'rural',      'pollution_factor': 0.48, 'weight': 1},
    # ── Jajpur District (18 Locations) ───────────────────────────
    'Jajpur':           {'district': 'Jajpur',      'type': 'urban',      'pollution_factor': 0.95, 'weight': 1},
    'Jajpur Road':      {'district': 'Jajpur',      'type': 'urban',      'pollution_factor': 1.0,  'weight': 1},
    'Vyasanagar':       {'district': 'Jajpur',      'type': 'urban',      'pollution_factor': 0.90, 'weight': 1},
    'Sukinda':          {'district': 'Jajpur',      'type': 'industrial', 'pollution_factor': 1.45, 'weight': 1},
    'Dharmasala':       {'district': 'Jajpur',      'type': 'rural',      'pollution_factor': 0.60, 'weight': 1},
    'Binjharpur':       {'district': 'Jajpur',      'type': 'rural',      'pollution_factor': 0.55, 'weight': 1},
    'Dasarathpur':      {'district': 'Jajpur',      'type': 'rural',      'pollution_factor': 0.52, 'weight': 1},
    'Panikoili':        {'district': 'Jajpur',      'type': 'rural',      'pollution_factor': 0.58, 'weight': 1},
    'Bari':             {'district': 'Jajpur',      'type': 'rural',      'pollution_factor': 0.50, 'weight': 1},
    'Badachana':        {'district': 'Jajpur',      'type': 'rural',      'pollution_factor': 0.53, 'weight': 1},
    'Rasulpur':         {'district': 'Jajpur',      'type': 'rural',      'pollution_factor': 0.48, 'weight': 1},
    'Danagadi':         {'district': 'Jajpur',      'type': 'industrial', 'pollution_factor': 1.30, 'weight': 1},
    'Mangalpur':        {'district': 'Jajpur',      'type': 'rural',      'pollution_factor': 0.50, 'weight': 1},
    'Jenapur':          {'district': 'Jajpur',      'type': 'rural',      'pollution_factor': 0.55, 'weight': 1},
    'Balichandrapur':   {'district': 'Jajpur',      'type': 'rural',      'pollution_factor': 0.47, 'weight': 1},
    'Chandipur':        {'district': 'Jajpur',      'type': 'rural',      'pollution_factor': 0.45, 'weight': 1},
    'Darpan':           {'district': 'Jajpur',      'type': 'rural',      'pollution_factor': 0.44, 'weight': 1},
    'Kalyanpur':        {'district': 'Jajpur',      'type': 'rural',      'pollution_factor': 0.46, 'weight': 1},
    # ── Other Major Odisha Cities ────────────────────────────────
    'Cuttack':          {'district': 'Cuttack',     'type': 'urban',      'pollution_factor': 1.15, 'weight': 1},
    'Rourkela':         {'district': 'Sundargarh',  'type': 'industrial', 'pollution_factor': 1.5,  'weight': 1},
    'Sambalpur':        {'district': 'Sambalpur',   'type': 'urban',      'pollution_factor': 1.05, 'weight': 1},
    'Berhampur':        {'district': 'Ganjam',      'type': 'urban',      'pollution_factor': 1.0,  'weight': 1},
}

# Date range: 4 years
START_DATE = datetime(2022, 1, 1)
END_DATE = datetime(2025, 12, 31)

# ─── Seasonal Multiplier ────────────────────────────────────────────────────

def get_seasonal_factor(month):
    """
    Returns a seasonal pollution multiplier.
    Winter months (Nov-Feb) have higher pollution due to temperature inversion.
    Monsoon (Jun-Sep) has lower pollution due to rain washout.
    """
    seasonal_map = {
        1: 1.4,   # January  - peak winter
        2: 1.3,   # February - winter
        3: 1.1,   # March    - transition
        4: 1.0,   # April    - pre-summer
        5: 1.05,  # May      - summer
        6: 0.7,   # June     - monsoon start
        7: 0.6,   # July     - peak monsoon
        8: 0.65,  # August   - monsoon
        9: 0.75,  # September - monsoon end
        10: 0.9,  # October  - post-monsoon
        11: 1.2,  # November - early winter
        12: 1.45, # December - peak winter
    }
    return seasonal_map[month]


def get_temperature(month):
    """Returns realistic temperature for Odisha based on month."""
    temp_map = {
        1: (15, 25), 2: (18, 28), 3: (22, 34), 4: (26, 38),
        5: (27, 40), 6: (26, 36), 7: (25, 33), 8: (25, 32),
        9: (24, 32), 10: (22, 32), 11: (18, 30), 12: (14, 26),
    }
    low, high = temp_map[month]
    return round(np.random.uniform(low, high), 1)


def get_humidity(month):
    """Returns realistic humidity for Odisha based on month."""
    humidity_map = {
        1: (40, 65), 2: (35, 60), 3: (30, 55), 4: (30, 55),
        5: (35, 60), 6: (60, 85), 7: (70, 95), 8: (75, 95),
        9: (65, 90), 10: (55, 80), 11: (45, 70), 12: (40, 65),
    }
    low, high = humidity_map[month]
    return round(np.random.uniform(low, high), 1)


# ─── AQI Sub-Index Calculation (India CPCB Standard) ────────────────────────

def calculate_pm25_subindex(pm25):
    """Calculate AQI sub-index for PM2.5 using Indian CPCB breakpoints."""
    breakpoints = [
        (0, 30, 0, 50),
        (31, 60, 51, 100),
        (61, 90, 101, 200),
        (91, 120, 201, 300),
        (121, 250, 301, 400),
        (250, 500, 401, 500),
    ]
    for bp_lo, bp_hi, aqi_lo, aqi_hi in breakpoints:
        if bp_lo <= pm25 <= bp_hi:
            return ((aqi_hi - aqi_lo) / (bp_hi - bp_lo)) * (pm25 - bp_lo) + aqi_lo
    return min(pm25 * 1.5, 500)


def calculate_pm10_subindex(pm10):
    """Calculate AQI sub-index for PM10 using Indian CPCB breakpoints."""
    breakpoints = [
        (0, 50, 0, 50),
        (51, 100, 51, 100),
        (101, 250, 101, 200),
        (251, 350, 201, 300),
        (351, 430, 301, 400),
        (430, 600, 401, 500),
    ]
    for bp_lo, bp_hi, aqi_lo, aqi_hi in breakpoints:
        if bp_lo <= pm10 <= bp_hi:
            return ((aqi_hi - aqi_lo) / (bp_hi - bp_lo)) * (pm10 - bp_lo) + aqi_lo
    return min(pm10 * 1.2, 500)


def calculate_no2_subindex(no2):
    breakpoints = [
        (0, 40, 0, 50),
        (41, 80, 51, 100),
        (81, 180, 101, 200),
        (181, 280, 201, 300),
        (281, 400, 301, 400),
        (400, 600, 401, 500),
    ]
    for bp_lo, bp_hi, aqi_lo, aqi_hi in breakpoints:
        if bp_lo <= no2 <= bp_hi:
            return ((aqi_hi - aqi_lo) / (bp_hi - bp_lo)) * (no2 - bp_lo) + aqi_lo
    return min(no2 * 1.0, 500)


def calculate_so2_subindex(so2):
    breakpoints = [
        (0, 40, 0, 50),
        (41, 80, 51, 100),
        (81, 380, 101, 200),
        (381, 800, 201, 300),
        (801, 1600, 301, 400),
        (1600, 2400, 401, 500),
    ]
    for bp_lo, bp_hi, aqi_lo, aqi_hi in breakpoints:
        if bp_lo <= so2 <= bp_hi:
            return ((aqi_hi - aqi_lo) / (bp_hi - bp_lo)) * (so2 - bp_lo) + aqi_lo
    return min(so2 * 0.5, 500)


def calculate_co_subindex(co):
    breakpoints = [
        (0, 1.0, 0, 50),
        (1.1, 2.0, 51, 100),
        (2.1, 10, 101, 200),
        (10.1, 17, 201, 300),
        (17.1, 34, 301, 400),
        (34, 50, 401, 500),
    ]
    for bp_lo, bp_hi, aqi_lo, aqi_hi in breakpoints:
        if bp_lo <= co <= bp_hi:
            return ((aqi_hi - aqi_lo) / (bp_hi - bp_lo)) * (co - bp_lo) + aqi_lo
    return min(co * 10, 500)


def calculate_o3_subindex(o3):
    breakpoints = [
        (0, 50, 0, 50),
        (51, 100, 51, 100),
        (101, 168, 101, 200),
        (169, 208, 201, 300),
        (209, 748, 301, 400),
        (748, 1000, 401, 500),
    ]
    for bp_lo, bp_hi, aqi_lo, aqi_hi in breakpoints:
        if bp_lo <= o3 <= bp_hi:
            return ((aqi_hi - aqi_lo) / (bp_hi - bp_lo)) * (o3 - bp_lo) + aqi_lo
    return min(o3 * 0.8, 500)


def calculate_aqi(pm25, pm10, no2, so2, co, o3):
    """AQI = max of all sub-indices (Indian CPCB standard)."""
    sub_indices = [
        calculate_pm25_subindex(pm25),
        calculate_pm10_subindex(pm10),
        calculate_no2_subindex(no2),
        calculate_so2_subindex(so2),
        calculate_co_subindex(co),
        calculate_o3_subindex(o3),
    ]
    return round(max(sub_indices))


def get_aqi_category(aqi):
    """Classify AQI into Indian CPCB categories."""
    if aqi <= 50:
        return 'Good'
    elif aqi <= 100:
        return 'Satisfactory'
    elif aqi <= 200:
        return 'Moderate'
    elif aqi <= 300:
        return 'Poor'
    elif aqi <= 400:
        return 'Very Poor'
    else:
        return 'Severe'


# ─── Data Generation ────────────────────────────────────────────────────────

def generate_dataset():
    """Generate the complete AQI dataset."""
    print("=" * 60)
    print("  AQI Dataset Generator - Odisha Locations")
    print("=" * 60)

    # Calculate rows per location using weights (Kalahandi gets 2x)
    locations = list(LOCATIONS.keys())
    total_weight = sum(config['weight'] for config in LOCATIONS.values())
    base_rows_per_weight = TOTAL_ROWS // total_weight

    # Generate date range for 4 years
    total_days = (END_DATE - START_DATE).days + 1

    data = []
    rows_assigned = 0

    for i, (location, config) in enumerate(LOCATIONS.items()):
        # Weight-based allocation; last location gets remainder to hit exactly 5000
        if i == len(LOCATIONS) - 1:
            n_rows = TOTAL_ROWS - rows_assigned
        else:
            n_rows = base_rows_per_weight * config['weight']
            rows_assigned += n_rows
        pf = config['pollution_factor']

        print(f"  Generating {n_rows:>4d} rows for {location:<15s} ({config['district']}, {config['type']})")


        for _ in range(n_rows):
            # Random date within the 4-year range
            random_day = np.random.randint(0, total_days)
            date = START_DATE + timedelta(days=random_day)
            month = date.month

            sf = get_seasonal_factor(month)
            combined_factor = pf * sf

            # Generate pollutant concentrations with realistic ranges
            pm25 = round(max(5, np.random.gamma(3, 10) * combined_factor + np.random.normal(0, 5)), 1)
            pm10 = round(max(10, pm25 * np.random.uniform(1.3, 2.5) + np.random.normal(0, 10)), 1)
            no2  = round(max(2, np.random.gamma(2, 8) * combined_factor + np.random.normal(0, 3)), 1)
            so2  = round(max(1, np.random.gamma(1.5, 5) * combined_factor + np.random.normal(0, 2)), 1)
            co   = round(max(0.2, np.random.gamma(1.5, 0.5) * combined_factor + np.random.normal(0, 0.1)), 2)
            o3   = round(max(5, np.random.gamma(2.5, 12) * combined_factor * 0.8 + np.random.normal(0, 5)), 1)

            temperature = get_temperature(month)
            humidity = get_humidity(month)

            # Calculate AQI
            aqi = calculate_aqi(pm25, pm10, no2, so2, co, o3)
            aqi_category = get_aqi_category(aqi)

            data.append({
                'Date': date.strftime('%Y-%m-%d'),
                'Location': location,
                'District': config['district'],
                'PM2.5': pm25,
                'PM10': pm10,
                'NO2': no2,
                'SO2': so2,
                'CO': co,
                'O3': o3,
                'Temperature': temperature,
                'Humidity': humidity,
                'AQI': aqi,
                'AQI_Category': aqi_category,
            })

    # Create DataFrame
    df = pd.DataFrame(data)

    # Sort by date and location
    df = df.sort_values(['Date', 'Location']).reset_index(drop=True)

    # Save to CSV
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, 'odisha_aqi_data.csv')
    try:
        df.to_csv(output_path, index=False)
    except PermissionError:
        # File may be open in editor, save with alternate name
        output_path = os.path.join(output_dir, 'odisha_aqi_data_new.csv')
        df.to_csv(output_path, index=False)
        print(f"\n  ⚠ Original file locked! Saved as: {output_path}")

    # Print summary
    print("\n" + "=" * 60)
    print("  Dataset Summary")
    print("=" * 60)
    print(f"  Total Rows       : {len(df)}")
    print(f"  Date Range       : {df['Date'].min()} to {df['Date'].max()}")
    print(f"  Locations         : {df['Location'].nunique()}")
    print(f"  Columns           : {list(df.columns)}")
    print(f"\n  AQI Category Distribution:")
    for cat, count in df['AQI_Category'].value_counts().sort_index().items():
        print(f"    {cat:15s} : {count:5d} ({count/len(df)*100:.1f}%)")
    print(f"\n  AQI Statistics:")
    print(f"    Min  : {df['AQI'].min()}")
    print(f"    Max  : {df['AQI'].max()}")
    print(f"    Mean : {df['AQI'].mean():.1f}")
    print(f"    Std  : {df['AQI'].std():.1f}")
    print(f"\n  Saved to: {output_path}")
    print("=" * 60)

    return df


if __name__ == '__main__':
    df = generate_dataset()
