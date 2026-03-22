"""
Exploratory Data Analysis (EDA) for Odisha AQI Dataset
Generates statistical summaries and visualisation charts saved to plots/.
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import os

# ─── Paths ───────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'odisha_aqi_data.csv')
PLOTS_DIR = os.path.join(BASE_DIR, 'plots')
os.makedirs(PLOTS_DIR, exist_ok=True)

# ─── Style ───────────────────────────────────────────────────────────────────

sns.set_theme(style='whitegrid', palette='viridis')
plt.rcParams.update({
    'figure.figsize': (12, 7),
    'font.size': 12,
    'axes.titlesize': 14,
    'axes.labelsize': 12,
})

AQI_COLORS = {
    'Good': '#009966',
    'Satisfactory': '#FFDE33',
    'Moderate': '#FF9933',
    'Poor': '#CC0033',
    'Very Poor': '#660099',
    'Severe': '#7E0023',
}

AQI_ORDER = ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe']


def load_data():
    """Load and prepare the dataset."""
    print("Loading dataset...")
    df = pd.read_csv(DATA_PATH)
    df['Date'] = pd.to_datetime(df['Date'])
    df['Month'] = df['Date'].dt.month
    df['Year'] = df['Date'].dt.year
    df['AQI_Category'] = pd.Categorical(df['AQI_Category'], categories=AQI_ORDER, ordered=True)
    return df


def print_basic_stats(df):
    """Print basic dataset statistics."""
    print("\n" + "=" * 60)
    print("  DATASET OVERVIEW")
    print("=" * 60)
    print(f"\n  Shape: {df.shape}")
    print(f"  Date Range: {df['Date'].min().date()} to {df['Date'].max().date()}")
    print(f"  Locations: {df['Location'].nunique()}")
    print(f"\n  Column Types:")
    print(df.dtypes.to_string())
    print(f"\n  Missing Values:")
    print(df.isnull().sum().to_string())
    print(f"\n  Descriptive Statistics:")
    print(df.describe().round(2).to_string())
    print("=" * 60)


def plot_aqi_distribution(df):
    """Plot AQI value distribution."""
    fig, axes = plt.subplots(1, 2, figsize=(16, 6))

    # Histogram
    axes[0].hist(df['AQI'], bins=50, color='#4C72B0', edgecolor='black', alpha=0.8)
    axes[0].set_title('AQI Value Distribution')
    axes[0].set_xlabel('AQI')
    axes[0].set_ylabel('Frequency')
    axes[0].axvline(df['AQI'].mean(), color='red', linestyle='--', label=f"Mean: {df['AQI'].mean():.1f}")
    axes[0].legend()

    # Category pie chart
    cat_counts = df['AQI_Category'].value_counts().reindex(AQI_ORDER).dropna()
    colors = [AQI_COLORS[c] for c in cat_counts.index]
    axes[1].pie(cat_counts, labels=cat_counts.index, colors=colors, autopct='%1.1f%%',
                startangle=90, textprops={'fontsize': 10})
    axes[1].set_title('AQI Category Distribution')

    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'aqi_distribution.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  Saved: {path}")


def plot_correlation_heatmap(df):
    """Plot correlation heatmap of numerical features."""
    numeric_cols = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3', 'Temperature', 'Humidity', 'AQI']
    corr = df[numeric_cols].corr()

    fig, ax = plt.subplots(figsize=(10, 8))
    mask = np.triu(np.ones_like(corr, dtype=bool))
    sns.heatmap(corr, mask=mask, annot=True, fmt='.2f', cmap='RdYlGn_r',
                center=0, square=True, linewidths=1, ax=ax,
                vmin=-1, vmax=1)
    ax.set_title('Feature Correlation Heatmap')

    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'correlation_heatmap.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  Saved: {path}")


def plot_location_wise_aqi(df):
    """Plot AQI distribution by location."""
    fig, ax = plt.subplots(figsize=(14, 7))

    location_order = df.groupby('Location')['AQI'].median().sort_values(ascending=False).index
    sns.boxplot(data=df, x='Location', y='AQI', order=location_order,
                palette='coolwarm', ax=ax)
    ax.set_title('AQI Distribution by Location (Odisha)')
    ax.set_xlabel('Location')
    ax.set_ylabel('AQI')
    plt.xticks(rotation=45, ha='right')

    # Add horizontal lines for AQI categories
    for val, label, color in [(50, 'Good', '#009966'), (100, 'Satisfactory', '#FFDE33'),
                               (200, 'Moderate', '#FF9933'), (300, 'Poor', '#CC0033')]:
        ax.axhline(y=val, color=color, linestyle='--', alpha=0.5, label=label)

    ax.legend(loc='upper right', fontsize=9)
    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'location_wise_aqi.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  Saved: {path}")


def plot_monthly_trend(df):
    """Plot monthly AQI trend."""
    monthly = df.groupby(['Year', 'Month'])['AQI'].mean().reset_index()
    monthly['Date'] = pd.to_datetime(monthly[['Year', 'Month']].assign(DAY=1))

    fig, ax = plt.subplots(figsize=(14, 6))
    ax.plot(monthly['Date'], monthly['AQI'], marker='o', color='#E24A33', linewidth=2, markersize=5)
    ax.fill_between(monthly['Date'], monthly['AQI'], alpha=0.2, color='#E24A33')
    ax.set_title('Monthly Average AQI Trend (2022-2025)')
    ax.set_xlabel('Date')
    ax.set_ylabel('Average AQI')
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'monthly_aqi_trend.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  Saved: {path}")


def plot_pollutant_distributions(df):
    """Plot distribution of each pollutant."""
    pollutants = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3']
    fig, axes = plt.subplots(2, 3, figsize=(18, 10))
    axes = axes.flatten()

    for i, pol in enumerate(pollutants):
        axes[i].hist(df[pol], bins=40, color=sns.color_palette('viridis', 6)[i],
                     edgecolor='black', alpha=0.8)
        axes[i].set_title(f'{pol} Distribution')
        axes[i].set_xlabel(pol)
        axes[i].set_ylabel('Frequency')
        axes[i].axvline(df[pol].mean(), color='red', linestyle='--',
                        label=f"Mean: {df[pol].mean():.1f}")
        axes[i].legend(fontsize=9)

    plt.suptitle('Pollutant Concentration Distributions', fontsize=16, y=1.02)
    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'pollutant_distributions.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  Saved: {path}")


def plot_seasonal_analysis(df):
    """Plot seasonal AQI patterns."""
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    fig, ax = plt.subplots(figsize=(12, 6))
    monthly_aqi = df.groupby('Month')['AQI'].agg(['mean', 'std'])
    bars = ax.bar(range(1, 13), monthly_aqi['mean'], yerr=monthly_aqi['std'],
                  color=sns.color_palette('RdYlGn_r', 12), edgecolor='black',
                  capsize=3, alpha=0.85)
    ax.set_xticks(range(1, 13))
    ax.set_xticklabels(month_names)
    ax.set_title('Seasonal AQI Pattern (Monthly Average)')
    ax.set_xlabel('Month')
    ax.set_ylabel('Average AQI')
    ax.grid(axis='y', alpha=0.3)

    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'seasonal_aqi_pattern.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  Saved: {path}")


# ─── Dhenkanal-Focused Analysis ─────────────────────────────────────────────

def plot_dhenkanal_location_aqi(df):
    """Plot AQI distribution across Dhenkanal locations."""
    dhenkanal = df[df['District'] == 'Dhenkanal']
    if dhenkanal.empty:
        print("  ⚠ No Dhenkanal data found, skipping.")
        return

    fig, ax = plt.subplots(figsize=(18, 8))
    location_order = dhenkanal.groupby('Location')['AQI'].median().sort_values(ascending=False).index
    # Show top 30 locations for readability
    top_locs = location_order[:30]
    sns.boxplot(data=dhenkanal[dhenkanal['Location'].isin(top_locs)],
                x='Location', y='AQI', order=top_locs,
                palette='coolwarm', ax=ax)
    ax.set_title('AQI Distribution by Location — Dhenkanal District (Top 30)')
    ax.set_xlabel('Location')
    ax.set_ylabel('AQI')
    plt.xticks(rotation=55, ha='right', fontsize=9)

    for val, label, color in [(50, 'Good', '#009966'), (100, 'Satisfactory', '#FFDE33'),
                               (200, 'Moderate', '#FF9933'), (300, 'Poor', '#CC0033')]:
        ax.axhline(y=val, color=color, linestyle='--', alpha=0.5, label=label)
    ax.legend(loc='upper right', fontsize=9)

    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'dhenkanal_location_aqi.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  Saved: {path}")


def plot_dhenkanal_monthly_trend(df):
    """Plot monthly AQI trend for Dhenkanal vs other districts."""
    dhenkanal = df[df['District'] == 'Dhenkanal'].groupby('Month')['AQI'].mean()
    others = df[df['District'] != 'Dhenkanal'].groupby('Month')['AQI'].mean()

    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(range(1, 13), dhenkanal.values, marker='o', linewidth=2.5,
            color='#E24A33', markersize=8, label='Dhenkanal', zorder=3)
    ax.fill_between(range(1, 13), dhenkanal.values, alpha=0.15, color='#E24A33')
    ax.plot(range(1, 13), others.values, marker='s', linewidth=2,
            color='#348ABD', markersize=6, label='Other Districts', alpha=0.7)
    ax.set_xticks(range(1, 13))
    ax.set_xticklabels(month_names)
    ax.set_title('Monthly AQI Trend — Dhenkanal vs Other Districts')
    ax.set_xlabel('Month')
    ax.set_ylabel('Average AQI')
    ax.legend(fontsize=11)
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'dhenkanal_monthly_trend.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  Saved: {path}")


def plot_dhenkanal_category_distribution(df):
    """Plot AQI category distribution for Dhenkanal district."""
    dhenkanal = df[df['District'] == 'Dhenkanal']
    if dhenkanal.empty:
        print("  ⚠ No Dhenkanal data found, skipping.")
        return

    fig, axes = plt.subplots(1, 2, figsize=(16, 6))

    # Dhenkanal pie
    cat_counts = dhenkanal['AQI_Category'].value_counts().reindex(AQI_ORDER).dropna()
    colors = [AQI_COLORS[c] for c in cat_counts.index]
    axes[0].pie(cat_counts, labels=cat_counts.index, colors=colors, autopct='%1.1f%%',
                startangle=90, textprops={'fontsize': 10})
    axes[0].set_title('Dhenkanal — AQI Categories')

    # All districts comparison bar chart
    district_cat = df.groupby(['District', 'AQI_Category']).size().unstack(fill_value=0)
    district_cat = district_cat.reindex(columns=AQI_ORDER, fill_value=0)
    district_pct = district_cat.div(district_cat.sum(axis=1), axis=0) * 100
    district_pct.plot(kind='barh', stacked=True, ax=axes[1],
                      color=[AQI_COLORS[c] for c in district_pct.columns],
                      edgecolor='white', linewidth=0.5)
    axes[1].set_title('AQI Category % by District')
    axes[1].set_xlabel('Percentage (%)')
    axes[1].set_ylabel('District')
    axes[1].legend(fontsize=8, loc='lower right')

    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'dhenkanal_category_distribution.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  Saved: {path}")


def run_eda():
    """Execute all EDA steps."""
    df = load_data()
    print_basic_stats(df)

    print("\n  Generating visualisations...")
    plot_aqi_distribution(df)
    plot_correlation_heatmap(df)
    plot_location_wise_aqi(df)
    plot_monthly_trend(df)
    plot_pollutant_distributions(df)
    plot_seasonal_analysis(df)

    print("\n  Generating Dhenkanal-focused analysis...")
    plot_dhenkanal_location_aqi(df)
    plot_dhenkanal_monthly_trend(df)
    plot_dhenkanal_category_distribution(df)

    print(f"\n  All charts saved to: {PLOTS_DIR}")
    print("  EDA complete!\n")


if __name__ == '__main__':
    run_eda()

