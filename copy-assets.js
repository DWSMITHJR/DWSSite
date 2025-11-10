const fs = require('fs-extra');
const path = require('path');

// Define source and destination directories
const srcDir = __dirname;
const destDir = path.join(__dirname, 'public');

// Files and directories to copy
const assetsToCopy = [
    'index.html',
    'about.html',
    'family.html',
    'info.html',
    'link.html',
    'privacy.html',
    'services.html',
    'solutions.html',
    'suggest.html',
    'terms.html',
    'css',
    'js',
    'files'
].filter(asset => {
    const exists = fs.existsSync(path.join(srcDir, asset));
    if (!exists) {
        console.warn(`Warning: ${asset} not found, skipping...`);
    }
    return exists;
});

// Create dist directory if it doesn't exist
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Copy each asset
assetsToCopy.forEach(asset => {
    const srcPath = path.join(srcDir, asset);
    const destPath = path.join(destDir, asset);
    
    try {
        if (fs.existsSync(srcPath)) {
            // If it's a directory, copy the entire directory
            if (fs.lstatSync(srcPath).isDirectory()) {
                fs.copySync(srcPath, destPath, { overwrite: true });
                console.log(`Copied directory: ${asset}`);
            } else {
                // If it's a file, copy the file
                fs.copyFileSync(srcPath, destPath);
                console.log(`Copied file: ${asset}`);
            }
        } else {
            console.warn(`Warning: ${asset} not found, skipping...`);
        }
    } catch (err) {
        console.error(`Error copying ${asset}:`, err);
    }
});

console.log('Asset copy complete!');
