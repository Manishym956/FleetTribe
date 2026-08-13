import numpy as np
import pandas as pd

def compute_telemetry_signals(telemetry_df):
    """
    Computes vector magnitudes for acceleration and gyroscope velocity.
    """
    # 1. Acceleration Magnitude: sqrt(x^2 + y^2 + z^2)
    accel_cols = ['Accel_X_g', 'Accel_Y_g', 'Accel_Z_g']
    accel_sq = telemetry_df[accel_cols].pow(2).sum(axis=1)
    telemetry_df['accel_magnitude'] = np.sqrt(accel_sq)
    
    # 2. Dynamic Acceleration: abs(accel_magnitude - 1.0)
    telemetry_df['dynamic_acceleration'] = (telemetry_df['accel_magnitude'] - 1.0).abs()
    
    # 3. Gyroscope Magnitude: sqrt(x^2 + y^2 + z^2) - angular velocity in dps
    gyro_cols = ['Gyro_X_dps', 'Gyro_Y_dps', 'Gyro_Z_dps']
    gyro_sq = telemetry_df[gyro_cols].pow(2).sum(axis=1)
    telemetry_df['gyro_magnitude'] = np.sqrt(gyro_sq)
    
    return telemetry_df

def aggregate_trip_features(telemetry_df, trips_df, accel_event_thresh=0.3, gyro_event_thresh=30.0):
    """
    Aggregates minute-level telemetry to trip-level statistics.
    """
    # Compute signals if not already done
    if 'accel_magnitude' not in telemetry_df.columns:
        telemetry_df = compute_telemetry_signals(telemetry_df)
    
    # Aggregate telemetry per Trip_ID
    trip_groups = telemetry_df.groupby('Trip_ID')
    
    trip_features = []
    
    for trip_id, group in trip_groups:
        total_points = len(group)
        if total_points == 0:
            continue
            
        # Event counts (hypotheses)
        accel_events = (group['dynamic_acceleration'] > accel_event_thresh).sum()
        gyro_events = (group['gyro_magnitude'] > gyro_event_thresh).sum()
        
        # Event rates (Rule 4.2: events / telemetry_points)
        accel_event_rate = accel_events / total_points
        gyro_event_rate = gyro_events / total_points
        
        # Speed stats
        mean_speed = group['Speed_kmph'].mean()
        max_speed = group['Speed_kmph'].max()
        p95_speed = group['Speed_kmph'].quantile(0.95)
        
        # Sensor volatility / variance stats
        mean_dyn_accel = group['dynamic_acceleration'].mean()
        var_dyn_accel = group['dynamic_acceleration'].var()
        if pd.isna(var_dyn_accel):
            var_dyn_accel = 0.0
            
        mean_gyro = group['gyro_magnitude'].mean()
        var_gyro = group['gyro_magnitude'].var()
        if pd.isna(var_gyro):
            var_gyro = 0.0
            
        trip_features.append({
            'Trip_ID': trip_id,
            'telemetry_points': total_points,
            'accel_events': int(accel_events),
            'gyro_events': int(gyro_events),
            'accel_event_rate': float(accel_event_rate),
            'gyro_event_rate': float(gyro_event_rate),
            'tel_mean_speed': float(mean_speed),
            'tel_max_speed': float(max_speed),
            'tel_p95_speed': float(p95_speed),
            'tel_mean_dyn_accel': float(mean_dyn_accel),
            'tel_var_dyn_accel': float(var_dyn_accel),
            'tel_mean_gyro': float(mean_gyro),
            'tel_var_gyro': float(var_gyro)
        })
        
    trip_features_df = pd.DataFrame(trip_features)
    
    # Merge with static Trips master data
    merged_trips = pd.merge(trips_df, trip_features_df, on='Trip_ID', how='left')
    return merged_trips
