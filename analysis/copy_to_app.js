const fs = require('fs');
const path = require('path');

function copyOutputs() {
  const baseDir = path.dirname(__dirname);
  const srcDir = path.join(baseDir, 'analysis', 'outputs');
  const destDir = path.join(baseDir, 'app', 'lib', 'data');

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = ['driver_features.json', 'vehicle_features.json', 'trip_features.json', 'fleet_summary.json', 'methodology.json'];

  console.log(`Copying files from ${srcDir} to ${destDir}...`);
  
  files.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  Copied ${file}`);
    } else {
      console.warn(`  [Warning] Source file ${file} not found at ${srcPath}`);
    }
  });

  console.log('=== DATA DEPLOYMENT TO APP COMPLETE ===');
}

copyOutputs();
