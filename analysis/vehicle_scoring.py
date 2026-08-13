import numpy as np
import pandas as pd
from analysis.driver_scoring import calculate_robust_z, scale_z_to_score

def score_vehicles(trips_df, vehicles_df):
    """
    Aggregates trip-level features per vehicle, evaluates robust Z-score abnormality,
    and maps to a 0-100 normality index.
    """
    # Aggregate trip stats per vehicle
    vehicle_groups = trips_df.groupby('Vehicle_ID')
    
    vehicle_stats = []
    for vehicle_id, group in vehicle_groups:
        mean_vib_var = group['tel_var_dyn_accel'].mean()
        mean_gyro_var = group['tel_var_gyro'].mean()
        mean_dyn_accel = group['tel_mean_dyn_accel'].mean()
        mean_gyro_speed = group['tel_mean_gyro'].mean()
        
        vehicle_stats.append({
            'Vehicle_ID': vehicle_id,
            'trips_count': len(group),
            'vibration_variance': float(mean_vib_var),
            'gyro_variance': float(mean_gyro_var),
            'mean_dynamic_accel': float(mean_dyn_accel),
            'mean_gyro_speed': float(mean_gyro_speed)
        })
        
    vehicle_stats_df = pd.DataFrame(vehicle_stats)
    
    # Calculate robust Z-scores
    vehicle_stats_df['z_vibration'] = calculate_robust_z(vehicle_stats_df['vibration_variance'])
    vehicle_stats_df['z_gyro'] = calculate_robust_z(vehicle_stats_df['gyro_variance'])
    
    # Scale components (higher Z means more anomalous, i.e. higher abnormality)
    vehicle_stats_df['anomaly_vibration'] = scale_z_to_score(vehicle_stats_df['z_vibration'])
    vehicle_stats_df['anomaly_gyro'] = scale_z_to_score(vehicle_stats_df['z_gyro'])
    
    # Overall anomaly is the average of vibration and gyro anomalies
    vehicle_stats_df['sensor_abnormality_score'] = (
        vehicle_stats_df['anomaly_vibration'] + 
        vehicle_stats_df['anomaly_gyro']
    ) / 2.0
    
    # Health Score = 100 - Abnormality Score
    vehicle_stats_df['health_score'] = 100.0 - vehicle_stats_df['sensor_abnormality_score']
    
    # Classify Health Status
    # Healthy: 80-100, Monitor: 50-80, Maintenance Attention: 0-50
    def classify_health(score):
        if score >= 80.0:
            return 'Healthy'
        elif score >= 50.0:
            return 'Monitor'
        else:
            return 'Maintenance Attention'
            
    vehicle_stats_df['health_status'] = vehicle_stats_df['health_score'].apply(classify_health)
    
    # Merge with static master data
    merged = pd.merge(vehicles_df, vehicle_stats_df, on='Vehicle_ID', how='left')
    
    # Add rank based on health_score (ascending, lower health is top priority for maintenance)
    merged = merged.sort_values(by='health_score', ascending=True).reset_index(drop=True)
    merged['rank'] = merged.index + 1
    
    # Generate explanations
    merged['explanation'] = merged.apply(generate_explanation, axis=1)
    merged['top_signals'] = merged.apply(get_top_signals, axis=1)
    
    return merged

def get_top_signals(row):
    """
    Identifies the top abnormal sensor components.
    """
    signals = {
        'Vibration Anomaly': row['anomaly_vibration'],
        'Gyro Anomaly': row['anomaly_gyro']
    }
    sorted_sigs = sorted(signals.items(), key=lambda x: x[1], reverse=True)
    return [sorted_sigs[0][0], sorted_sigs[1][0]]

def generate_explanation(row):
    """
    Generates explainable maintenance warning.
    """
    status = row['health_status']
    id_val = row['Vehicle_ID']
    score = int(round(row['health_score']))
    
    if status == 'Maintenance Attention':
        return (f"Vehicle {id_val} exhibits an abnormal sensor signature (Health Score: {score}/100) "
                f"characterized by elevated sensor anomalies. It is flagged as high inspection priority.")
    elif status == 'Monitor':
        return (f"Vehicle {id_val} shows moderate deviation in physical vibration signatures "
                f"(Health Score: {score}/100). Monitor sensor profiles during next routine service.")
    else:
        return (f"Vehicle {id_val} sensor readings are normal relative to the fleet (Health Score: {score}/100). "
                f"No immediate maintenance inspection is indicated.")
