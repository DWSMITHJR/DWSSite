const fs = require('fs-extra');
const path = require('path');

// Define source and destination directories
const srcDir = __dirname;
const destDir = path.join(__dirname, 'public');

// Ensure all required directories exist
const requiredDirs = ['css', 'js', 'files'];
requiredDirs.forEach(dir => {
    const dirPath = path.join(srcDir, dir);
    if (!fs.existsSync(dirPath)) {
        console.log(`Creating directory: ${dir}`);
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

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
    'files',
    'images'
].filter(asset => {
    const exists = fs.existsSync(path.join(srcDir, asset));
    if (!exists) {
        console.warn(`Warning: ${asset} not found, skipping...`);
    }
    return exists;
});

// Create public directory if it doesn't exist
if (!fs.existsSync(destDir)) {
    console.log('Creating public directory...');
    fs.mkdirSync(destDir, { recursive: true });
}

// Copy each asset
let success = true;
assetsToCopy.forEach(asset => {
    const srcPath = path.join(srcDir, asset);
    const destPath = path.join(destDir, asset);
    
    try {
        if (fs.existsSync(srcPath)) {
            // If it's a directory, copy the entire directory
            if (fs.lstatSync(srcPath).isDirectory()) {
                fs.copySync(srcPath, destPath, { 
                    overwrite: true,
                    errorOnExist: false,
                    preserveTimestamps: true
                });
                console.log(`✓ Copied directory: ${asset}`);
            } else {
                // If it's a file, copy the file
                fs.copyFileSync(srcPath, destPath);
                console.log(`Copied file: ${asset}`);
            }
        } else {
            console.warn(`Warning: Source file/directory does not exist: ${asset}`);
        }
    } catch (error) {
        console.error(`Error copying ${asset}:`, error.message);
        success = false;
    }
});

// Create a simple index.html if it doesn't exist
const indexPath = path.join(destDir, 'index.html');
if (!fs.existsSync(indexPath)) {
    console.log('Creating default index.html...');
    fs.writeFileSync(indexPath, `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DWS Portfolio</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    margin: 0; 
                    background: #0a0e27; 
                    color: #e2e8f0;
                    text-align: center;
                    padding: 20px;
                }
                .container { max-width: 600px; }
                h1 { color: #4fc3f7; }
                p { margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Welcome to DWS Portfolio</h1>
                <p>Your site is being deployed. Please wait a moment and refresh the page.</p>
                <p>If you see this message for more than a few minutes, please check the deployment logs.</p>
            </div>
        </body>
        </html>
    `);
}

if (success) {
    console.log('Asset copy complete!');
    console.log(`Build output directory: ${destDir}`);
    
    // Verify critical files were copied
    const criticalFiles = ['index.html', 'css/styles.css', 'js/app.js'];
    let allCriticalFilesExist = true;
    
    criticalFiles.forEach(file => {
        const filePath = path.join(destDir, file);
        if (!fs.existsSync(filePath)) {
            console.warn(`Warning: Critical file not found in build: ${file}`);
            allCriticalFilesExist = false;
        }
    });
    
    if (!allCriticalFilesExist) {
        console.warn('Warning: Some critical files are missing from the build.');
        console.log('Please ensure all required files are included in the assetsToCopy array.');
    }
    
    console.log('Build completed successfully!');
} else {
    console.error('Build failed: Some assets could not be copied.');
    console.log('Please check the error messages above and ensure all source files exist.');
    process.exit(1);
}
