import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import os
import joblib
from sklearn.metrics import confusion_matrix, classification_report, precision_recall_curve, f1_score, average_precision_score
from sklearn.preprocessing import label_binarize
import warnings
warnings.filterwarnings('ignore')

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, 'data', 'odisha_aqi_data.csv')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
OUTPUT_DIR = os.path.join(BASE_DIR, 'kalahandi_figures')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def get_aqi_category(aqi):
    if aqi <= 50: return 'Good'
    elif aqi <= 100: return 'Satisfactory'
    elif aqi <= 200: return 'Moderate'
    elif aqi <= 300: return 'Poor'
    elif aqi <= 400: return 'Very Poor'
    else: return 'Severe'

AQI_CLASSES = ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe']

def main():
    print("Loading data...")
    df = pd.read_csv(DATA_PATH)
    
    # Filter for Kalahandi
    kalahandi_df = df[df['District'].str.lower() == 'kalahandi'].copy()
    if len(kalahandi_df) == 0:
        print("No data found for Kalahandi")
        return
        
    print(f"Found {len(kalahandi_df)} records for Kalahandi.")
    
    kalahandi_df['Date'] = pd.to_datetime(kalahandi_df['Date'])
    kalahandi_df['Month'] = kalahandi_df['Date'].dt.month
    kalahandi_df['Year'] = kalahandi_df['Date'].dt.year
    kalahandi_df['DayOfYear'] = kalahandi_df['Date'].dt.dayofyear
    
    le_location = joblib.load(os.path.join(MODELS_DIR, 'label_encoder.pkl'))
    le_district = joblib.load(os.path.join(MODELS_DIR, 'district_encoder.pkl'))
    
    # Handle unseen labels by setting them to 0 or ignoring. Assuming all locations in dataset were in training.
    # Safe transform
    location_classes = list(le_location.classes_)
    kalahandi_df['Location'] = kalahandi_df['Location'].apply(lambda x: x if x in location_classes else location_classes[0])
    
    kalahandi_df['Location_Encoded'] = le_location.transform(kalahandi_df['Location'])
    kalahandi_df['District_Encoded'] = le_district.transform(kalahandi_df['District'])
    
    feature_cols = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3',
                    'Temperature', 'Humidity', 'Month', 'Year',
                    'DayOfYear', 'Location_Encoded', 'District_Encoded']
    
    X = kalahandi_df[feature_cols]
    y_true = kalahandi_df['AQI']
    
    print("Loading model...")
    model = joblib.load(os.path.join(MODELS_DIR, 'xgboost_model.pkl'))
    y_pred = model.predict(X)
    
    kalahandi_df['Predicted_AQI'] = y_pred
    
    # Generate Figure 5.1: Actual vs Predicted AQI Scatter Plot
    plt.figure(figsize=(8, 6))
    plt.scatter(y_true, y_pred, alpha=0.5, color='#4C72B0')
    min_val = min(y_true.min(), y_pred.min())
    max_val = max(y_true.max(), y_pred.max())
    plt.plot([min_val, max_val], [min_val, max_val], 'r--', linewidth=2, label='Perfect Prediction')
    plt.xlabel('Actual AQI')
    plt.ylabel('Predicted AQI')
    plt.title('Figure 5.1: Actual vs Predicted AQI (Kalahandi)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'Figure_5.1_Actual_vs_Predicted.png'), dpi=300)
    plt.close()
    
    # Generate Figure 5.2: Residual Plot
    residuals = y_true - y_pred
    plt.figure(figsize=(8, 6))
    plt.scatter(y_pred, residuals, alpha=0.5, color='#DD8452')
    plt.axhline(0, color='r', linestyle='--')
    plt.xlabel('Predicted AQI')
    plt.ylabel('Residual (Actual - Predicted)')
    plt.title('Figure 5.2: Residual Plot (Kalahandi)')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'Figure_5.2_Residual_Plot.png'), dpi=300)
    plt.close()
    
    # Generate Figure 5.3: Error Distribution Histogram
    plt.figure(figsize=(8, 6))
    sns.histplot(residuals, bins=30, kde=True, color='#55A868')
    plt.xlabel('Prediction Error (Actual - Predicted)')
    plt.ylabel('Frequency')
    plt.title('Figure 5.3: Error Distribution Histogram (Kalahandi)')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'Figure_5.3_Error_Distribution.png'), dpi=300)
    plt.close()
    
    # Generate Figure 5.4: Feature Importance Analysis
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    plt.figure(figsize=(10, 6))
    sns.barplot(x=importances[indices], y=[feature_cols[i] for i in indices], palette='viridis')
    plt.xlabel('Feature Importance Score')
    plt.ylabel('Features')
    plt.title('Figure 5.4: Feature Importance Analysis (Global Model)')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'Figure_5.4_Feature_Importance.png'), dpi=300)
    plt.close()
    
    # AQI Categories
    y_true_cat = y_true.apply(get_aqi_category)
    y_pred_cat = pd.Series(y_pred).apply(get_aqi_category)
    
    labels_present = list(set(y_true_cat) | set(y_pred_cat))
    ordered_labels = [c for c in AQI_CLASSES if c in labels_present]
    
    # Generate Figure 5.5: Confusion Matrix
    cm = confusion_matrix(y_true_cat, y_pred_cat, labels=ordered_labels)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=ordered_labels, yticklabels=ordered_labels)
    plt.xlabel('Predicted Category')
    plt.ylabel('Actual Category')
    plt.title('Figure 5.5: Confusion Matrix for AQI Categories (Kalahandi)')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'Figure_5.5_Confusion_Matrix.png'), dpi=300)
    plt.close()
    
    # Generate Figure 5.6: AQI Category Distribution Plot
    dist_df = pd.DataFrame({
        'Category': list(y_true_cat) + list(y_pred_cat),
        'Type': ['Actual'] * len(y_true_cat) + ['Predicted'] * len(y_pred_cat)
    })
    plt.figure(figsize=(10, 6))
    sns.countplot(data=dist_df, x='Category', hue='Type', order=ordered_labels, palette='muted')
    plt.xlabel('AQI Category')
    plt.ylabel('Count')
    plt.title('Figure 5.6: AQI Category Distribution (Kalahandi)')
    plt.legend(title='Value Type')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'Figure_5.6_Category_Distribution.png'), dpi=300)
    plt.close()
    
    # Generate Figure 5.7: Precision-Recall Curve
    try:
        y_true_bin = label_binarize(y_true_cat, classes=ordered_labels)
        y_pred_bin = label_binarize(y_pred_cat, classes=ordered_labels)
        
        plt.figure(figsize=(10, 6))
        
        for i, class_name in enumerate(ordered_labels):
            if np.sum(y_true_bin[:, i]) > 0:  # Only plot if class exists in true labels
                precision, recall, _ = precision_recall_curve(y_true_bin[:, i], y_pred_bin[:, i])
                avg_precision = average_precision_score(y_true_bin[:, i], y_pred_bin[:, i])
                plt.plot(recall, precision, lw=2, label=f'{class_name} (AP = {avg_precision:.2f})')
                
        plt.xlabel('Recall')
        plt.ylabel('Precision')
        plt.title('Figure 5.7: Precision-Recall Curve (Kalahandi)')
        plt.legend(loc='best')
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(os.path.join(OUTPUT_DIR, 'Figure_5.7_Precision_Recall_Curve.png'), dpi=300)
        plt.close()
    except Exception as e:
        print(f"Skipping PR Curve due to error: {e}")
    
    # Generate Figure 5.8: F1-Score Comparison Across Categories
    try:
        report = classification_report(y_true_cat, y_pred_cat, labels=ordered_labels, output_dict=True, zero_division=0)
        f1_scores = {k: v['f1-score'] for k, v in report.items() if k in ordered_labels}
        
        plt.figure(figsize=(8, 6))
        sns.barplot(x=list(f1_scores.keys()), y=list(f1_scores.values()), palette='coolwarm')
        plt.xlabel('AQI Category')
        plt.ylabel('F1-Score')
        plt.title('Figure 5.8: F1-Score Comparison Across Categories (Kalahandi)')
        plt.ylim(0, 1.05)
        plt.grid(axis='y', alpha=0.3)
        plt.tight_layout()
        plt.savefig(os.path.join(OUTPUT_DIR, 'Figure_5.8_F1_Score_Comparison.png'), dpi=300)
        plt.close()
    except Exception as e:
        print(f"Skipping F1 Score plot due to error: {e}")

    print("All figures generated successfully in the 'kalahandi_figures' directory.")

if __name__ == '__main__':
    main()
