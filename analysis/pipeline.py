import os
import json
import pandas as pd
import numpy as np

# Ensure parent directory is imports-ready
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from analysis.validation import validate_dataset
from analysis.features import compute_telemetry_signals, aggregate_trip_features
from analysis.driver_scoring import score_drivers, run_sensitivity_analysis
from analysis.vehicle_scoring import score_vehicles

def run_pipeline(excel_path, output_dir):
    # 1. Validation & Load
    drivers, vehicles, trips, telemetry = validate_dataset(excel_path)
    
    # Define scoring hypotheses parameters (from distribution insights)
    # Thresholds are baseline hypotheses
    ACCEL_EVENT_THRESH = 0.3 # in g-units
    GYRO_EVENT_THRESH = 30.0  # in degrees per second (dps)
    
    baseline_weights = {
        'speed': 0.35,
        'acceleration': 0.30,
        'gyro': 0.25,
        'variability': 0.10
    }
    
    # 2. Telemetry Processing & Feature Extraction
    print("Computing telemetry vector magnitudes...")
    telemetry = compute_telemetry_signals(telemetry)
    
    # 3. Trip Aggregation
    print("Aggregating trip-level features...")
    trips_features = aggregate_trip_features(
        telemetry, trips, 
        accel_event_thresh=ACCEL_EVENT_THRESH, 
        gyro_event_thresh=GYRO_EVENT_THRESH
    )
    
    # 4. Driver Scoring
    print("Scoring driver safety risk...")
    scored_drivers = score_drivers(trips_features, drivers, weights=baseline_weights)
    
    # 5. Vehicle Scoring
    print("Scoring vehicle health signatures...")
    scored_vehicles = score_vehicles(trips_features, vehicles)
    
    # 6. Sensitivity Analysis
    print("Running sensitivity analysis...")
    sensitivity_results = run_sensitivity_analysis(trips_features, drivers, baseline_weights)
    
    # 7. Generate Fleet Summary
    print("Compiling fleet-wide statistics...")
    total_drivers = len(scored_drivers)
    total_vehicles = len(scored_vehicles)
    total_trips = len(trips)
    total_distance = float(trips['Distance_KM'].sum())
    
    avg_driver_risk = float(scored_drivers['risk_score'].mean())
    avg_vehicle_health = float(scored_vehicles['health_score'].mean())
    
    risk_counts = scored_drivers['risk_level'].value_counts().to_dict()
    health_counts = scored_vehicles['health_status'].value_counts().to_dict()
    
    highest_risk_drivers = scored_drivers.head(5)[
        ['Driver_ID', 'Driver_Name', 'risk_score', 'risk_level', 'explanation']
    ].to_dict(orient='records')
    
    vehicles_needing_attention = scored_vehicles[scored_vehicles['health_status'] == 'Maintenance Attention'][
        ['Vehicle_ID', 'Make', 'Model', 'health_score', 'health_status', 'explanation']
    ].to_dict(orient='records')
    
    fleet_summary = {
        'total_drivers': total_drivers,
        'total_vehicles': total_vehicles,
        'total_trips': total_trips,
        'total_distance_km': total_distance,
        'avg_driver_risk_score': avg_driver_risk,
        'avg_vehicle_health_score': avg_vehicle_health,
        'drivers_by_risk_level': {k: int(v) for k, v in risk_counts.items()},
        'vehicles_by_health_status': {k: int(v) for k, v in health_counts.items()},
        'highest_risk_drivers': highest_risk_drivers,
        'vehicles_requiring_attention': vehicles_needing_attention,
        'sensitivity_analysis': sensitivity_results
    }
    
    # 8. Methodology Info
    methodology = {
        'product': 'FleetTribe',
        'scoring_formulas': {
            'acceleration_magnitude': 'sqrt(Accel_X_g^2 + Accel_Y_g^2 + Accel_Z_g^2)',
            'dynamic_acceleration': 'abs(acceleration_magnitude - 1.0)',
            'gyroscope_magnitude': 'sqrt(Gyro_X_dps^2 + Gyro_Y_dps^2 + Gyro_Z_dps^2)'
        },
        'scoring_weights_baseline': baseline_weights,
        'thresholds_hypotheses': {
            'harsh_acceleration_g': ACCEL_EVENT_THRESH,
            'high_gyro_dps': GYRO_EVENT_THRESH
        },
        'normalization': {
            'method': 'Robust Z-score using Median and MAD',
            'formula': 'robust_z = 0.6745 * (x - median) / MAD',
            'scaling': 'Z-scores clipped to [-2.0, 3.0] and mapped to [0, 100]'
        }
    }
    
    # Save JSON files
    os.makedirs(output_dir, exist_ok=True)
    
    # Helper to sanitize dataframes for JSON conversion
    def df_to_json_records(df):
        # Convert timestamp objects to strings
        for col in df.columns:
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                df[col] = df[col].astype(str)
        return json.loads(df.to_json(orient='records'))
        
    print(f"Writing analytical outputs to: {output_dir}")
    
    with open(os.path.join(output_dir, 'driver_features.json'), 'w') as f:
        json.dump(df_to_json_records(scored_drivers), f, indent=2)
        
    with open(os.path.join(output_dir, 'vehicle_features.json'), 'w') as f:
        json.dump(df_to_json_records(scored_vehicles), f, indent=2)
        
    with open(os.path.join(output_dir, 'trip_features.json'), 'w') as f:
        json.dump(df_to_json_records(trips_features), f, indent=2)
        
    with open(os.path.join(output_dir, 'fleet_summary.json'), 'w') as f:
        json.dump(fleet_summary, f, indent=2)
        
    with open(os.path.join(output_dir, 'methodology.json'), 'w') as f:
        json.dump(methodology, f, indent=2)
        
    print("=== PIPELINE RUN COMPLETE ===")

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    excel_file = os.path.join(base_dir, 'VEXAR_Fleet_Dataset_CANDIDATE_VERSION.xlsx')
    output_folder = os.path.join(base_dir, 'analysis', 'outputs')
    run_pipeline(excel_file, output_folder)
