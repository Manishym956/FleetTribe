import os
import shutil

def copy_outputs_to_app():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    src_dir = os.path.join(base_dir, 'analysis', 'outputs')
    dest_dir = os.path.join(base_dir, 'app', 'lib', 'data')
    
    os.makedirs(dest_dir, exist_ok=True)
    
    files = ['driver_features.json', 'vehicle_features.json', 'trip_features.json', 'fleet_summary.json', 'methodology.json']
    
    print(f"Copying files from {src_dir} to {dest_dir}...")
    for filename in files:
        src_path = os.path.join(src_dir, filename)
        dest_path = os.path.join(dest_dir, filename)
        
        if os.path.exists(src_path):
            shutil.copy(src_path, dest_path)
            print(f"  Copied {filename}")
        else:
            print(f"  [Warning] Source file {filename} not found.")
            
    print("=== DATA DEPLOYMENT TO APP COMPLETE ===")

if __name__ == '__main__':
    copy_outputs_to_app()
