import pandas as pd
import numpy as np
import joblib
import os
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, classification_report, accuracy_score

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, 'data', 'odisha_aqi_data.csv')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

def get_aqi_category(aqi):
    if aqi <= 50: return 'Good'
    elif aqi <= 100: return 'Satisfactory'
    elif aqi <= 200: return 'Moderate'
    elif aqi <= 300: return 'Poor'
    elif aqi <= 400: return 'Very Poor'
    else: return 'Severe'

def main():
    df = pd.read_csv(DATA_PATH)
    kalahandi_df = df[df['District'].str.lower() == 'kalahandi'].copy()
    
    kalahandi_df['Date'] = pd.to_datetime(kalahandi_df['Date'])
    kalahandi_df['Month'] = kalahandi_df['Date'].dt.month
    kalahandi_df['Year'] = kalahandi_df['Date'].dt.year
    kalahandi_df['DayOfYear'] = kalahandi_df['Date'].dt.dayofyear
    
    le_location = joblib.load(os.path.join(MODELS_DIR, 'label_encoder.pkl'))
    le_district = joblib.load(os.path.join(MODELS_DIR, 'district_encoder.pkl'))
    
    location_classes = list(le_location.classes_)
    kalahandi_df['Location'] = kalahandi_df['Location'].apply(lambda x: x if x in location_classes else location_classes[0])
    
    kalahandi_df['Location_Encoded'] = le_location.transform(kalahandi_df['Location'])
    kalahandi_df['District_Encoded'] = le_district.transform(kalahandi_df['District'])
    
    feature_cols = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3',
                    'Temperature', 'Humidity', 'Month', 'Year',
                    'DayOfYear', 'Location_Encoded', 'District_Encoded']
    
    X = kalahandi_df[feature_cols]
    y_true = kalahandi_df['AQI']
    
    model = joblib.load(os.path.join(MODELS_DIR, 'xgboost_model.pkl'))
    y_pred = model.predict(X)
    
    # Regression Metrics
    r2 = r2_score(y_true, y_pred)
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    
    print("=== Regression Analysis Metrics (Kalahandi) ===")
    print(f"Total Samples: {len(y_true)}")
    print(f"R-squared (R2): {r2:.4f}")
    print(f"Mean Absolute Error (MAE): {mae:.4f}")
    print(f"Root Mean Squared Error (RMSE): {rmse:.4f}")
    print("\n")
    
    # Classification Metrics
    y_true_cat = y_true.apply(get_aqi_category)
    y_pred_cat = pd.Series(y_pred).apply(get_aqi_category)
    
    accuracy = accuracy_score(y_true_cat, y_pred_cat)
    print("=== Classification Analysis Metrics (Kalahandi) ===")
    print(f"Overall Accuracy: {accuracy:.4f}\n")
    print("Classification Report:")
    report = classification_report(y_true_cat, y_pred_cat, zero_division=0)
    print(report)
    
    # Distribution
    print("=== Actual Category Distribution ===")
    print(y_true_cat.value_counts().to_string())
    print("\n=== Predicted Category Distribution ===")
    print(y_pred_cat.value_counts().to_string())

if __name__ == '__main__':
    main()
