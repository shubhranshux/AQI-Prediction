"""Get actual model metrics."""
import pandas as pd
import numpy as np
import os, joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

BASE = os.path.dirname(__file__)
DATA = os.path.join(BASE, 'data', 'odisha_aqi_data.csv')
MODELS = os.path.join(BASE, 'models')

model = joblib.load(os.path.join(MODELS, 'xgboost_model.pkl'))
le = joblib.load(os.path.join(MODELS, 'label_encoder.pkl'))
le_dist = joblib.load(os.path.join(MODELS, 'district_encoder.pkl'))
feat_cols = joblib.load(os.path.join(MODELS, 'feature_columns.pkl'))

df = pd.read_csv(DATA)
df['Date'] = pd.to_datetime(df['Date'])
df['Month'] = df['Date'].dt.month
df['Year'] = df['Date'].dt.year
df['DayOfYear'] = df['Date'].dt.dayofyear
df['Location_Encoded'] = le.transform(df['Location'])
df['District_Encoded'] = le_dist.transform(df['District'])

X = df[feat_cols]
y = df['AQI']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

preds = model.predict(X_test)
preds_clipped = np.clip(np.round(preds), 0, 500).astype(int)

# Regression
r2 = r2_score(y_test, preds)
mae = mean_absolute_error(y_test, preds)
rmse = np.sqrt(mean_squared_error(y_test, preds))

print("=== REGRESSION ===")
print(f"R2:   {r2:.4f}")
print(f"MAE:  {mae:.2f}")
print(f"RMSE: {rmse:.2f}")

# Classification
def aqi_cat(val):
    if val <= 50: return 'Good'
    elif val <= 100: return 'Satisfactory'
    elif val <= 200: return 'Moderate'
    elif val <= 300: return 'Poor'
    elif val <= 400: return 'Very Poor'
    else: return 'Severe'

y_cat = [aqi_cat(v) for v in y_test]
p_cat = [aqi_cat(v) for v in preds_clipped]

acc = accuracy_score(y_cat, p_cat)
prec = precision_score(y_cat, p_cat, average='weighted', zero_division=0)
rec = recall_score(y_cat, p_cat, average='weighted', zero_division=0)
f1 = f1_score(y_cat, p_cat, average='weighted', zero_division=0)

print("\n=== CLASSIFICATION ===")
print(f"Accuracy:  {acc:.4f} ({acc*100:.2f}%)")
print(f"Precision: {prec:.4f}")
print(f"Recall:    {rec:.4f}")
print(f"F1-Score:  {f1:.4f}")

# Cross-validation
cv = cross_val_score(model, X, y, cv=5, scoring='r2', n_jobs=-1)
print(f"\n=== CROSS-VALIDATION ===")
print(f"CV R2: {cv.round(4)}")
print(f"Mean:  {cv.mean():.4f} +/- {cv.std():.4f}")
