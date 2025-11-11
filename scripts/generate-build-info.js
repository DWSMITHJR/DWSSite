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
  const files = execSync('git ls-files -z --full-name | xargs -0 -n1 -I{} -- git log -1 --format="%ai {}" -- "{}" | sort -r | head -n 5')
    .toString()
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const [date, time, tz, ...fileParts] = line.split(' ');
      return {
        file: fileParts.join(' '),
        modified: `${date} ${time} ${tz}`
      };
    });
  lastModifiedFiles = files;
} catch (e) {
  console.warn('Could not get last modified files:', e.message);
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

console.log('Build info generated successfully');
