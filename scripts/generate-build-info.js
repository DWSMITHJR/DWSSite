const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get package version
const packageJson = require('../package.json');
const version = packageJson.version || '1.0.0';

// Get current date in ISO format
const buildDate = new Date().toISOString();

// Get last git commit hash (if available)
let commitHash = 'unknown';
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
  console.warn('Could not get git commit hash:', e.message);
}

// Get last modified files (top 5)
let lastModifiedFiles = [];
try {
  // Windows-compatible command to get last modified files
  const command = process.platform === 'win32' 
    ? 'powershell -Command "git ls-files | ForEach-Object { $file = $_; $log = git log -1 --format=\'%ai %H\' -- $file; Write-Output \"$log $file\" } | Sort-Object -Descending | Select-Object -First 5"'
    : 'git ls-files -z --full-name | xargs -0 -n1 -I{} -- git log -1 --format="%ai %H {}" -- "{}" | sort -r | head -n 5';
    
  const files = execSync(command)
    .toString()
    .split('\n')
    .filter(Boolean)
    .map(line => {
      // Handle both Windows and Unix output formats
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4) {
        const date = parts[0];
        const time = parts[1];
        const tz = parts[2];
        const file = parts.slice(3).join(' ');
        return {
          file,
          modified: `${date} ${time} ${tz}`,
          commit: parts[3] || 'unknown'
        };
      }
      return null;
    })
    .filter(Boolean);
    
  lastModifiedFiles = files;
} catch (e) {
  console.warn('Could not get last modified files:', e.message);
  // Fallback to empty array
  lastModifiedFiles = [];
}

const buildInfo = {
  version,
  buildDate,
  commitHash,
  lastModifiedFiles,
  environment: process.env.NODE_ENV || 'development'
};

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write build info to a JSON file
fs.writeFileSync(
  path.join(publicDir, 'build-info.json'),
  JSON.stringify(buildInfo, null, 2)
);

// Copy build-info.js to the public directory
const buildInfoJsPath = path.join(__dirname, '../js/build-info.js');
const publicJsDir = path.join(publicDir, 'js');

// Ensure the public/js directory exists
if (!fs.existsSync(publicJsDir)) {
  fs.mkdirSync(publicJsDir, { recursive: true });
}

// Copy the file
fs.copyFileSync(buildInfoJsPath, path.join(publicJsDir, 'build-info.js'));

console.log('Build info generated successfully');
