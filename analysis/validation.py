import os
import pandas as pd

def validate_dataset(excel_path):
    print("=== STARTING DATA AUDIT ===")
    if not os.path.exists(excel_path):
        raise FileNotFoundError(f"Source Excel dataset not found at: {excel_path}")
    
    xl = pd.ExcelFile(excel_path)
    required_sheets = ['Drivers', 'Vehicles', 'Trips', 'Telemetry']
    for sheet in required_sheets:
        if sheet not in xl.sheet_names:
            raise ValueError(f"Missing mandatory sheet '{sheet}' in dataset workbook.")
    
    # Load data with header offset
    drivers = xl.parse('Drivers', header=2)
    vehicles = xl.parse('Vehicles', header=2)
    trips = xl.parse('Trips', header=2)
    telemetry = xl.parse('Telemetry', header=2)
    
    # Check shapes
    print(f"Loaded 'Drivers': {drivers.shape}")
    print(f"Loaded 'Vehicles': {vehicles.shape}")
    print(f"Loaded 'Trips': {trips.shape}")
    print(f"Loaded 'Telemetry': {telemetry.shape}")
    
    # Check columns
    required_cols = {
        'Drivers': ['Driver_ID', 'Driver_Name', 'Age', 'Gender', 'License_Experience_Years', 'Date_Joined_Fleet', 'Primary_Vehicle_ID', 'Home_Hub'],
        'Vehicles': ['Vehicle_ID', 'Vehicle_Type', 'Make', 'Model', 'Manufacture_Year', 'Registration_Date', 'Odometer_KM_Start_of_Week', 'Last_Service_Date'],
        'Trips': ['Trip_ID', 'Driver_ID', 'Vehicle_ID', 'Trip_Date', 'Start_Time', 'End_Time', 'Duration_Min', 'Distance_KM', 'Avg_Speed_kmph', 'Max_Speed_kmph', 'Start_Latitude', 'Start_Longitude', 'End_Latitude', 'End_Longitude'],
        'Telemetry': ['Trip_ID', 'Driver_ID', 'Vehicle_ID', 'Timestamp', 'Latitude', 'Longitude', 'Speed_kmph', 'Accel_X_g', 'Accel_Y_g', 'Accel_Z_g', 'Gyro_X_dps', 'Gyro_Y_dps', 'Gyro_Z_dps']
    }
    
    for name, df in zip(['Drivers', 'Vehicles', 'Trips', 'Telemetry'], [drivers, vehicles, trips, telemetry]):
        missing_cols = [c for c in required_cols[name] if c not in df.columns]
        if missing_cols:
            raise ValueError(f"Sheet '{name}' is missing columns: {missing_cols}")
    
    # Check nulls
    for name, df in zip(['Drivers', 'Vehicles', 'Trips', 'Telemetry'], [drivers, vehicles, trips, telemetry]):
        nulls = df.isnull().sum()
        if nulls.sum() > 0:
            print(f"[Warning] Found null values in '{name}':")
            print(nulls[nulls > 0])
        else:
            print(f"Sheet '{name}': 0 missing values.")
            
    # Check key relationships
    driver_ids = set(drivers['Driver_ID'])
    vehicle_ids = set(vehicles['Vehicle_ID'])
    trip_ids = set(trips['Trip_ID'])
    
    missing_trip_drivers = set(trips['Driver_ID']) - driver_ids
    missing_trip_vehicles = set(trips['Vehicle_ID']) - vehicle_ids
    if missing_trip_drivers:
        raise ValueError(f"Trips contain invalid Driver_IDs not in master: {missing_trip_drivers}")
    if missing_trip_vehicles:
        raise ValueError(f"Trips contain invalid Vehicle_IDs not in master: {missing_trip_vehicles}")
        
    missing_tel_trips = set(telemetry['Trip_ID']) - trip_ids
    if missing_tel_trips:
        raise ValueError(f"Telemetry contains invalid Trip_IDs not in Trips log: {list(missing_tel_trips)[:5]}...")
        
    missing_tel_drivers = set(telemetry['Driver_ID']) - driver_ids
    missing_tel_vehicles = set(telemetry['Vehicle_ID']) - vehicle_ids
    if missing_tel_drivers:
        raise ValueError(f"Telemetry contains invalid Driver_IDs not in master: {missing_tel_drivers}")
    if missing_tel_vehicles:
        raise ValueError(f"Telemetry contains invalid Vehicle_IDs not in master: {missing_tel_vehicles}")
        
    trips_without_telemetry = trip_ids - set(telemetry['Trip_ID'])
    if trips_without_telemetry:
        print(f"[Warning] Found {len(trips_without_telemetry)} trips without telemetry.")
    else:
        print("All trips have matching telemetry coverage (100%).")
        
    print("=== DATA AUDIT PASSED SECURELY ===")
    return drivers, vehicles, trips, telemetry
