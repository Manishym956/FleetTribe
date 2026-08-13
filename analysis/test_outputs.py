import os
import json

def test_json_outputs(output_dir):
    print("=== STARTING ANALYTICAL VALIDATION ===")
    
    files = ['driver_features.json', 'vehicle_features.json', 'trip_features.json', 'fleet_summary.json', 'methodology.json']
    
    for filename in files:
        filepath = os.path.join(output_dir, filename)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Missing output file: {filename}")
            
        with open(filepath, 'r') as f:
            data = json.load(f)
            
        print(f"Validated JSON format for '{filename}': Loaded successfully.")
        
        # Test for NaN or Infinite values serialized incorrectly
        def check_no_nans(val, path=""):
            if isinstance(val, float):
                if not np_isfinite_val(val):
                    raise ValueError(f"Invalid float (NaN/Inf) found at: {path} = {val}")
            elif isinstance(val, dict):
                for k, v in val.items():
                    check_no_nans(v, f"{path}.{k}" if path else k)
            elif isinstance(val, list):
                for i, v in enumerate(val):
                    check_no_nans(v, f"{path}[{i}]")
                    
        def np_isfinite_val(x):
            import math
            return not (math.isnan(x) or math.isinf(x))
            
        check_no_nans(data)
        
        # Specific sheet structure validations
        if filename == 'driver_features.json':
            if len(data) != 30:
                raise ValueError(f"Drivers record count should be exactly 30. Got: {len(data)}")
            # Check keys
            required_keys = ['Driver_ID', 'Driver_Name', 'risk_score', 'risk_level', 'score_speed', 'score_accel', 'score_gyro', 'score_variability', 'explanation', 'top_factors']
            for idx, item in enumerate(data):
                for k in required_keys:
                    if k not in item:
                        raise ValueError(f"Driver record {idx} is missing key: '{k}'")
                        
        elif filename == 'vehicle_features.json':
            if len(data) != 30:
                raise ValueError(f"Vehicles record count should be exactly 30. Got: {len(data)}")
            required_keys = ['Vehicle_ID', 'health_score', 'health_status', 'anomaly_vibration', 'anomaly_gyro', 'explanation', 'top_signals']
            for idx, item in enumerate(data):
                for k in required_keys:
                    if k not in item:
                        raise ValueError(f"Vehicle record {idx} is missing key: '{k}'")
                        
        elif filename == 'fleet_summary.json':
            required_keys = ['total_drivers', 'total_vehicles', 'total_trips', 'total_distance_km', 'avg_driver_risk_score', 'avg_vehicle_health_score', 'drivers_by_risk_level', 'vehicles_by_health_status', 'highest_risk_drivers', 'vehicles_requiring_attention']
            for k in required_keys:
                if k not in data:
                    raise ValueError(f"Fleet summary is missing key: '{k}'")
                    
    print("=== ANALYTICAL VALIDATION PASSED SECURELY ===")

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    outputs_folder = os.path.join(base_dir, 'analysis', 'outputs')
    test_json_outputs(outputs_folder)
