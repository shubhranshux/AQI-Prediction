# AQI Prediction System - Odisha

A machine learning-based Air Quality Index (AQI) prediction system for 15 locations across Odisha, India. Uses **XGBoost** for accurate AQI predictions based on pollutant concentrations and weather data.

## Features

- Synthetic dataset with **5,000 rows** across **15 Odisha locations** over **4 years (2022-2025)**
- **Exploratory Data Analysis** with 6 publication-ready charts
- Comparison of **3 ML models**: Linear Regression, Random Forest, XGBoost
- **XGBoost with GridSearchCV** hyperparameter tuning
- **CLI prediction interface** (interactive + batch CSV mode)
- AQI calculated using **Indian CPCB breakpoints**

## AQI Parameters

| Parameter   | Unit  | Description               |
| ----------- | ----- | ------------------------- |
| PM2.5       | µg/m³ | Fine particulate matter   |
| PM10        | µg/m³ | Coarse particulate matter |
| NO2         | ppb   | Nitrogen Dioxide          |
| SO2         | ppb   | Sulfur Dioxide            |
| CO          | mg/m³ | Carbon Monoxide           |
| O3          | ppb   | Ozone                     |
| Temperature | °C    | Ambient temperature       |
| Humidity    | %     | Relative humidity         |

## Odisha Locations

Bhubaneswar, Cuttack, Rourkela, Berhampur, Sambalpur, Puri, Balasore, Bhadrak, Baripada, Jharsuguda, Angul, Talcher, Paradip, Jeypore, Koraput

## Setup

```bash
# Install dependencies
pip install -r requirements.txt
```

## Usage

### Step 1: Generate Dataset

```bash
python src/generate_dataset.py
```

Creates `data/odisha_aqi_data.csv` with 5,000 rows.

### Step 2: Run EDA

```bash
python src/eda.py
```

Generates charts in `plots/` directory.

### Step 3: Train Models

```bash
python src/train.py
```

Trains all 3 models, prints comparison, and saves the best model to `models/`.

### Step 4: Make Predictions

```bash
# Interactive mode
python src/predict.py

# Batch mode (from CSV)
python src/predict.py path/to/input.csv
```

## Project Structure

```
AQI Prediction/
├── data/                         # Dataset
│   └── odisha_aqi_data.csv
├── models/                       # Saved model & encoders
│   ├── xgboost_model.pkl
│   ├── label_encoder.pkl
│   └── feature_columns.pkl
├── plots/                        # EDA & evaluation charts
├── src/
│   ├── generate_dataset.py       # Dataset generation
│   ├── eda.py                    # Exploratory data analysis
│   ├── train.py                  # Model training & evaluation
│   └── predict.py                # CLI prediction interface
├── requirements.txt
└── README.md
```

## AQI Categories (Indian CPCB)

| AQI Range | Category     | Color     |
| --------- | ------------ | --------- |
| 0 - 50    | Good         | 🟢 Green  |
| 51 - 100  | Satisfactory | 🟡 Yellow |
| 101 - 200 | Moderate     | 🟠 Orange |
| 201 - 300 | Poor         | 🔴 Red    |
| 301 - 400 | Very Poor    | 🟣 Purple |
| 401 - 500 | Severe       | ⚫ Black  |

## Tech Stack

- **Python 3.8+**
- **XGBoost** - Primary prediction model
- **scikit-learn** - Preprocessing, evaluation, baseline models
- **pandas / numpy** - Data manipulation
- **matplotlib / seaborn** - Visualisations
