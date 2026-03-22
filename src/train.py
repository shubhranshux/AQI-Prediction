"""
AQI Prediction Model Training
Trains Linear Regression, Random Forest, and XGBoost models.
Evaluates, compares, and saves the best model (XGBoost).
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import os
import joblib
import warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# ─── Paths ───────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'odisha_aqi_data.csv')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
PLOTS_DIR = os.path.join(BASE_DIR, 'plots')
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(PLOTS_DIR, exist_ok=True)


def load_and_prepare_data():
    """Load dataset and prepare features for training."""
    print("=" * 60)
    print("  Loading and Preparing Data")
    print("=" * 60)

    df = pd.read_csv(DATA_PATH)
    df['Date'] = pd.to_datetime(df['Date'])

    # Extract temporal features
    df['Month'] = df['Date'].dt.month
    df['Year'] = df['Date'].dt.year
    df['DayOfYear'] = df['Date'].dt.dayofyear

    # Encode Location and District using Label Encoding
    le_location = LabelEncoder()
    le_district = LabelEncoder()
    df['Location_Encoded'] = le_location.fit_transform(df['Location'])
    df['District_Encoded'] = le_district.fit_transform(df['District'])

    # Save label encoders for prediction
    joblib.dump(le_location, os.path.join(MODELS_DIR, 'label_encoder.pkl'))
    joblib.dump(le_district, os.path.join(MODELS_DIR, 'district_encoder.pkl'))

    # Feature columns
    feature_cols = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3',
                    'Temperature', 'Humidity', 'Month', 'Year',
                    'DayOfYear', 'Location_Encoded', 'District_Encoded']
    target_col = 'AQI'

    X = df[feature_cols]
    y = df[target_col]

    print(f"  Features: {feature_cols}")
    print(f"  Target  : {target_col}")
    print(f"  Shape   : X={X.shape}, y={y.shape}")

    return X, y, df, le_location


def train_and_evaluate(X_train, X_test, y_train, y_test):
    """Train XGBoost model and return results."""
    print("\n" + "=" * 60)
    print("  Training Model (XGBoost Only)")
    print("=" * 60)

    results = {}

    # ── XGBoost with Hyperparameter Tuning ──────────────────────────
    print("\n  Training XGBoost (with GridSearchCV tuning)...")
    xgb_params = {
        'n_estimators': [200, 300],
        'max_depth': [6, 8, 10],
        'learning_rate': [0.05, 0.1],
        'subsample': [0.8, 0.9],
        'colsample_bytree': [0.8, 0.9],
    }

    xgb_base = XGBRegressor(
        random_state=42,
        tree_method='hist',
        verbosity=0,
    )

    grid_search = GridSearchCV(
        estimator=xgb_base,
        param_grid=xgb_params,
        cv=3,
        scoring='r2',
        n_jobs=-1,
        verbose=0,
    )
    grid_search.fit(X_train, y_train)

    xgb_best = grid_search.best_estimator_
    xgb_pred = xgb_best.predict(X_test)
    results['XGBoost'] = {
        'model': xgb_best,
        'predictions': xgb_pred,
        'r2': r2_score(y_test, xgb_pred),
        'mae': mean_absolute_error(y_test, xgb_pred),
        'rmse': np.sqrt(mean_squared_error(y_test, xgb_pred)),
        'best_params': grid_search.best_params_,
        'best_estimator': xgb_best # Store the estimator directly
    }
    print(f"    R² = {results['XGBoost']['r2']:.4f}")
    print(f"    Best Params: {grid_search.best_params_}")

    return results


def print_comparison(results):
    """Print model comparison table."""
    print("\n" + "=" * 60)
    print("  MODEL COMPARISON")
    print("=" * 60)
    print(f"\n  {'Model':<22} {'R²':>8} {'MAE':>10} {'RMSE':>10}")
    print("  " + "-" * 52)

    best_model_name = None
    best_r2 = -float('inf')

    for name, res in results.items():
        star = ""
        if res['r2'] > best_r2:
            best_r2 = res['r2']
            best_model_name = name
        print(f"  {name:<22} {res['r2']:>8.4f} {res['mae']:>10.2f} {res['rmse']:>10.2f}")

    print(f"\n  ★ Best Model: {best_model_name} (R² = {best_r2:.4f})")
    print("=" * 60)

    return best_model_name


def plot_actual_vs_predicted(y_test, results):
    """Plot actual vs predicted for the model."""
    # Handle single model case
    n_models = len(results)
    fig, axes = plt.subplots(1, n_models, figsize=(7 * n_models, 6))
    
    # Ensure axes is iterable even if single model
    if n_models == 1:
        axes = [axes]

    for i, (name, res) in enumerate(results.items()):
        ax = axes[i]
        ax.scatter(y_test, res['predictions'], alpha=0.4, s=10, color='#4C72B0')
        min_val = min(y_test.min(), res['predictions'].min())
        max_val = max(y_test.max(), res['predictions'].max())
        ax.plot([min_val, max_val], [min_val, max_val], 'r--', linewidth=2, label='Perfect Prediction')
        ax.set_title(f'{name}\nR²={res["r2"]:.4f} | MAE={res["mae"]:.2f}')
        ax.set_xlabel('Actual AQI')
        ax.set_ylabel('Predicted AQI')
        ax.legend()
        ax.grid(True, alpha=0.3)

    plt.suptitle('Actual vs Predicted AQI', fontsize=16)
    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'actual_vs_predicted.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  Saved: {path}")


def plot_feature_importance(model, feature_names, model_name):
    """Plot feature importance for the best model."""
    if hasattr(model, 'feature_importances_'):
        importance = model.feature_importances_
        indices = np.argsort(importance)[::-1]

        fig, ax = plt.subplots(figsize=(12, 7))
        colors = sns.color_palette('viridis', len(feature_names))
        bars = ax.barh(range(len(importance)), importance[indices],
                       color=[colors[i] for i in range(len(importance))],
                       edgecolor='black', alpha=0.85)
        ax.set_yticks(range(len(importance)))
        ax.set_yticklabels([feature_names[i] for i in indices])
        ax.set_xlabel('Feature Importance')
        ax.set_title(f'Feature Importance ({model_name})')
        ax.invert_yaxis()
        ax.grid(axis='x', alpha=0.3)

        plt.tight_layout()
        path = os.path.join(PLOTS_DIR, 'feature_importance.png')
        plt.savefig(path, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"  Saved: {path}")


def plot_residuals(y_test, predictions, model_name):
    """Plot residual distribution."""
    residuals = y_test - predictions

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Residual distribution
    axes[0].hist(residuals, bins=50, color='#4C72B0', edgecolor='black', alpha=0.8)
    axes[0].set_title(f'Residual Distribution ({model_name})')
    axes[0].set_xlabel('Residual (Actual - Predicted)')
    axes[0].set_ylabel('Frequency')
    axes[0].axvline(0, color='red', linestyle='--')

    # Residual vs Predicted
    axes[1].scatter(predictions, residuals, alpha=0.3, s=10, color='#DD8452')
    axes[1].axhline(0, color='red', linestyle='--')
    axes[1].set_title(f'Residuals vs Predicted ({model_name})')
    axes[1].set_xlabel('Predicted AQI')
    axes[1].set_ylabel('Residual')
    axes[1].grid(True, alpha=0.3)

    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'residual_analysis.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  Saved: {path}")


def cross_validate_best_model(model, X, y, model_name):
    """Perform cross-validation on the best model."""
    print(f"\n  Cross-Validation ({model_name}, 5-fold)...")
    cv_scores = cross_val_score(model, X, y, cv=5, scoring='r2', n_jobs=-1)
    print(f"    CV R² Scores : {cv_scores.round(4)}")
    print(f"    Mean R²      : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    return cv_scores


def save_model(model, model_name):
    """Save the best model."""
    path = os.path.join(MODELS_DIR, 'xgboost_model.pkl')
    joblib.dump(model, path)
    print(f"\n  Model saved: {path}")
    return path


def run_training():
    """Execute full training pipeline."""
    # Load data
    X, y, df, le = load_and_prepare_data()

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"\n  Train size: {X_train.shape[0]} | Test size: {X_test.shape[0]}")

    # Train & evaluate
    results = train_and_evaluate(X_train, X_test, y_train, y_test)

    # Print comparison
    best_model_name = print_comparison(results)

    # Plots
    print("\n  Generating evaluation charts...")
    plot_actual_vs_predicted(y_test, results)

    best_model = results[best_model_name]['model']
    feature_names = X.columns.tolist()
    plot_feature_importance(best_model, feature_names, best_model_name)
    plot_residuals(y_test, results[best_model_name]['predictions'], best_model_name)

    # Cross-validation
    cross_validate_best_model(best_model, X, y, best_model_name)

    # Save model
    save_model(best_model, best_model_name)

    # Save feature columns for prediction
    joblib.dump(feature_names, os.path.join(MODELS_DIR, 'feature_columns.pkl'))

    print("\n  Training pipeline complete!")
    print("=" * 60)


if __name__ == '__main__':
    run_training()
