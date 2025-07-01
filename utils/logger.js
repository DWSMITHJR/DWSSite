const fs = require('fs').promises;
const path = require('path');

// Ensure logs directory exists
const LOGS_DIR = path.join(__dirname, '../logs');
const LOG_FILE = path.join(LOGS_DIR, 'access.log');

async function ensureLogsDir() {
    try {
        await fs.mkdir(LOGS_DIR, { recursive: true });
    } catch (err) {
        console.error('Error creating logs directory:', err);
    }
}

// Format log entry
function formatLogEntry(req, clientInfo = {}) {
    const timestamp = new Date().toISOString();
    const ip = req.clientIp || 'unknown';
    const url = req.originalUrl || req.url;
    const method = req.method;
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    return {
        timestamp,
        ip,
        method,
        url,
        userAgent,
        ...clientInfo
    };
}

// Log to file
async function logAccess(req, clientInfo = {}) {
    try {
        await ensureLogsDir();
        const logEntry = formatLogEntry(req, clientInfo);
        const logLine = JSON.stringify(logEntry) + '\n';
        await fs.appendFile(LOG_FILE, logLine, 'utf8');
    } catch (err) {
        console.error('Error writing to log file:', err);
    }
}

module.exports = { logAccess };
