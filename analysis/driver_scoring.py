import numpy as np
import pandas as pd

def calculate_robust_z(series):
    """
    Computes robust Z-score: robust_z = 0.6745 * (x - median) / MAD.
    Handles MAD = 0 cases.
    """
    median = series.median()
    mad = (series - median).abs().median()
    
    if mad == 0:
        std = series.std()
        if std == 0:
            return pd.Series(0.0, index=series.index)
        else:
            return 0.6745 * (series - median) / std
            
    return 0.6745 * (series - median) / mad

def scale_z_to_score(z_series, z_min=-2.0, z_max=3.0):
    """
    Maps robust Z-score to 0-100 range using clipping and min-max normalization.
    """
    clipped = z_series.clip(lower=z_min, upper=z_max)
    scaled = (clipped - z_min) / (z_max - z_min) * 100.0
    return scaled

def score_drivers(trips_df, drivers_df, weights=None):
    """
    Aggregates trip-level features per driver, runs robust Z-score scaling, 
    and evaluates overall risk scores.
    """
    if weights is None:
        weights = {
            'speed': 0.35,
            'acceleration': 0.30,
            'gyro': 0.25,
            'variability': 0.10
        }
        
    # Aggregate trip stats per driver
    driver_groups = trips_df.groupby('Driver_ID')
    
    driver_stats = []
    for driver_id, group in driver_groups:
        # 1. Speed metric: average of p95 speeds and trip avg speeds
        avg_speed = group['Avg_Speed_kmph'].mean()
        p95_speed = group['tel_p95_speed'].mean()
        
        # 2. Acceleration metric: mean dynamic acceleration event rate
        mean_accel_rate = group['accel_event_rate'].mean()
        
        # 3. Gyro metric: mean gyroscope magnitude event rate
        mean_gyro_rate = group['gyro_event_rate'].mean()
        
        # 4. Behavioural Variability: std dev of avg speeds and dynamic acceleration across trips
        speed_var = group['Avg_Speed_kmph'].std()
        if pd.isna(speed_var):
            speed_var = 0.0
        accel_var = group['tel_mean_dyn_accel'].std()
        if pd.isna(accel_var):
            accel_var = 0.0
            
        driver_stats.append({
            'Driver_ID': driver_id,
            'trips_count': len(group),
            'avg_speed': float(avg_speed),
            'p95_speed': float(p95_speed),
            'mean_accel_rate': float(mean_accel_rate),
            'mean_gyro_rate': float(mean_gyro_rate),
            'speed_variability': float(speed_var),
            'accel_variability': float(accel_var)
        })
        
    driver_stats_df = pd.DataFrame(driver_stats)
    
    # Run robust Z-scoring
    driver_stats_df['z_avg_speed'] = calculate_robust_z(driver_stats_df['avg_speed'])
    driver_stats_df['z_p95_speed'] = calculate_robust_z(driver_stats_df['p95_speed'])
    driver_stats_df['z_accel_rate'] = calculate_robust_z(driver_stats_df['mean_accel_rate'])
    driver_stats_df['z_gyro_rate'] = calculate_robust_z(driver_stats_df['mean_gyro_rate'])
    driver_stats_df['z_speed_var'] = calculate_robust_z(driver_stats_df['speed_variability'])
    driver_stats_df['z_accel_var'] = calculate_robust_z(driver_stats_df['accel_variability'])
    
    # Scale component scores to 0-100
    driver_stats_df['score_speed'] = (scale_z_to_score(driver_stats_df['z_avg_speed']) + 
                                      scale_z_to_score(driver_stats_df['z_p95_speed'])) / 2.0
    driver_stats_df['score_accel'] = scale_z_to_score(driver_stats_df['z_accel_rate'])
    driver_stats_df['score_gyro'] = scale_z_to_score(driver_stats_df['z_gyro_rate'])
    driver_stats_df['score_variability'] = (scale_z_to_score(driver_stats_df['z_speed_var']) + 
                                            scale_z_to_score(driver_stats_df['z_accel_var'])) / 2.0
    
    # Compute overall score
    driver_stats_df['risk_score'] = (
        weights['speed'] * driver_stats_df['score_speed'] +
        weights['acceleration'] * driver_stats_df['score_accel'] +
        weights['gyro'] * driver_stats_df['score_gyro'] +
        weights['variability'] * driver_stats_df['score_variability']
    )
    
    # Classify Risk Levels
    # Low Risk: 0-30, Moderate: 30-60, High: 60-85, Critical: 85-100
    def classify_risk(score):
        if score < 30.0:
            return 'Low Risk'
        elif score < 60.0:
            return 'Moderate Risk'
        elif score < 85.0:
            return 'High Risk'
        else:
            return 'Critical Risk'
            
    driver_stats_df['risk_level'] = driver_stats_df['risk_score'].apply(classify_risk)
    
    # Merge with static master data
    merged = pd.merge(drivers_df, driver_stats_df, on='Driver_ID', how='left')
    
    # Add Rank
    merged = merged.sort_values(by='risk_score', ascending=False).reset_index(drop=True)
    merged['rank'] = merged.index + 1
    
    # Generate explanations
    merged['explanation'] = merged.apply(generate_explanation, axis=1)
    merged['top_factors'] = merged.apply(get_top_factors, axis=1)
    
    return merged

def get_top_factors(row):
    """
    Identifies the top two contributing risk components.
    """
    scores = {
        'Speed Profile': row['score_speed'],
        'Acceleration Volatility': row['score_accel'],
        'Gyroscope Volatility': row['score_gyro'],
        'Behavioural Variability': row['score_variability']
    }
    # Sort descending
    sorted_factors = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [sorted_factors[0][0], sorted_factors[1][0]]

def generate_explanation(row):
    """
    Generates plain-English explanation of the risk score based on component scores.
    """
    factors = get_top_factors(row)
    name = row['Driver_Name']
    level = row['risk_level']
    score = int(round(row['risk_score']))
    
    explanation = f"{name} is classified as {level} (Score: {score}/100). "
    explanation += f"The risk profile is primarily influenced by elevated {factors[0]} and {factors[1]} "
    explanation += "relative to the rest of the fleet."
    return explanation

def run_sensitivity_analysis(trips_df, drivers_df, baseline_weights):
    """
    Performs weight perturbations to test ranking stability (Spearman Rank Correlation).
    """
    baseline_results = score_drivers(trips_df, drivers_df, baseline_weights)
    baseline_ranks = baseline_results.set_index('Driver_ID')['rank']
    
    perturbations = [
        {'speed': 0.40, 'acceleration': 0.25, 'gyro': 0.25, 'variability': 0.10},
        {'speed': 0.30, 'acceleration': 0.35, 'gyro': 0.25, 'variability': 0.10},
        {'speed': 0.35, 'acceleration': 0.25, 'gyro': 0.30, 'variability': 0.10},
        {'speed': 0.35, 'acceleration': 0.30, 'gyro': 0.20, 'variability': 0.15},
        {'speed': 0.30, 'acceleration': 0.30, 'gyro': 0.30, 'variability': 0.10},
    ]
    
    stability_metrics = []
    for idx, pert in enumerate(perturbations):
        pert_res = score_drivers(trips_df, drivers_df, pert)
        pert_ranks = pert_res.set_index('Driver_ID')['rank']
        
        # Calculate Spearman correlation
        corr = baseline_ranks.corr(pert_ranks, method='spearman')
        avg_rank_shift = (baseline_ranks - pert_ranks).abs().mean()
        
        stability_metrics.append({
            'run': idx + 1,
            'weights_perturbed': pert,
            'spearman_rank_correlation': float(corr),
            'avg_rank_shift': float(avg_rank_shift)
        })
        
    return stability_metrics
