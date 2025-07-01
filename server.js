const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const session = require('express-session');
const cors = require('cors');
const { logAccess } = require('./utils/logger');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable detailed logging
const log = (message, data = '') => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, data || '');
};

const logError = (message, error = '') => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, error || '');
};

// Log environment
console.log('Starting server with environment:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- PORT:', PORT);
console.log('- __dirname:', __dirname);

// Verify files directory exists
const FILES_DIR = path.join(__dirname, 'files');
fs.access(FILES_DIR).catch(() => {
    console.log(`Creating files directory: ${FILES_DIR}`);
    return fs.mkdir(FILES_DIR, { recursive: true });
}).catch(err => {
    console.error('Error creating files directory:', err);
});

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to get client IP and log basic access
app.use((req, res, next) => {
    // Get client IP
    req.clientIp = getClientIp(req);
    
    // Log basic access
    logAccess(req);
    
    next();
});

// API endpoint to receive tracking data from client
app.post('/api/track', express.json(), async (req, res) => {
    try {
        const clientInfo = req.body;
        clientInfo.ip = req.clientIp;
        
        // Log the detailed client info
        await logAccess(req, clientInfo);
        
        res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('Error processing tracking data:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Function to get client IP address
const getClientIp = (req) => {
    // Check for forwarded IPs (if behind proxy)
    const forwardedIps = req.headers['x-forwarded-for'];
    if (forwardedIps) {
        return Array.isArray(forwardedIps) ? forwardedIps[0] : forwardedIps.split(',')[0].trim();
    }
    return req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
};

// Function to get browser and OS info from user agent
const parseUserAgent = (userAgent) => {
    if (!userAgent) return {};
    
    // Simple parsing - in a real app, you might want to use a library like 'user-agents' or 'ua-parser-js'
    const browserMatch = userAgent.match(/(chrome|safari|firefox|msie|trident|edg|opera|opr|samsungbrowser)[\/\s]([\d.]+)/i);
    const osMatch = userAgent.match(/(windows nt|mac os|linux|iphone|ipad|android)[\s\/]?([\d._]*)/i);
    
    return {
        browser: browserMatch ? `${browserMatch[1]} ${browserMatch[2]}`.toLowerCase() : 'unknown',
        os: osMatch ? `${osMatch[1]} ${osMatch[2] || ''}`.trim() : 'unknown',
        userAgent: userAgent
    };
};

// Parse JSON and URL-encoded bodies (as sent by API clients)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests with detailed information
app.use((req, res, next) => {
    // Log basic request info
    const clientIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const referrer = req.headers.referer || 'none';
    
    log(`Request: ${req.method} ${req.url}`);
    log(`  IP: ${clientIp}`);
    log(`  User-Agent: ${userAgent}`);
    log(`  Referrer: ${referrer}`);
    
    if (req.session && req.session.authenticated) {
        log(`  Authenticated User: ${req.session.email || 'unknown'}`);
    }
    const timestamp = new Date().toISOString();
    const ip = getClientIp(req);
    const userAgentInfo = parseUserAgent(req.headers['user-agent']);
    
    // Log the basic request info
    console.log(`\n[${timestamp}] ${req.method} ${req.url}`);
    console.log(`  IP: ${ip}`);
    console.log(`  User-Agent: ${userAgentInfo.userAgent || 'none'}`);
    console.log(`  Browser: ${userAgentInfo.browser}`);
    console.log(`  OS: ${userAgentInfo.os}`);
    
    // Log referrer if available
    if (req.headers.referer) {
        console.log(`  Referrer: ${req.headers.referer}`);
    }
    
    // Log authentication status if available
    if (req.session && req.session.authenticated) {
        console.log(`  Authenticated User: ${req.session.email || 'unknown'}`);
    }
    
    // Log request body for non-GET requests (useful for debugging POST requests)
    if (req.method !== 'GET' && Object.keys(req.body).length > 0) {
        console.log('  Request Body:', JSON.stringify(req.body, null, 2));
    }
    
    // Store request info for later use
    req.clientInfo = {
        ip,
        timestamp,
        ...userAgentInfo
    };
    
    next();
});

// Session configuration with enhanced security
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // In production, use environment variable
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware to parse JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static('.'));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.authenticated) {
        return next();
    }
    res.status(401).json({ error: 'Authentication required' });
};

// Generate hash function (must match client-side)
function generateEmailHash(email) {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        const char = email.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    // Ensure positive number and get last 6 digits
    const positiveHash = Math.abs(hash);
    const hashStr = positiveHash.toString();
    
    // If hash is shorter than 6 digits, pad with leading zeros
    if (hashStr.length >= 6) {
        return hashStr.slice(-6);
    } else {
        return hashStr.padStart(6, '0');
    }
}

// Log email verification attempts
async function logVerificationAttempt(email, code, isValid, ip, userAgent) {
    try {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            event: 'email_verification',
            email,
            code,
            isValid,
            ip,
            userAgent
        };
        
        // Log to the main access log
        await logAccess({ 
            originalUrl: '/api/verify', 
            method: 'POST',
            clientIp: ip,
            headers: { 'user-agent': userAgent }
        }, logEntry);
        
        // Also log to a dedicated verification log file
        const LOGS_DIR = path.join(__dirname, 'logs');
        const VERIFICATION_LOG = path.join(LOGS_DIR, 'verification.log');
        await fs.mkdir(LOGS_DIR, { recursive: true });
        await fs.appendFile(VERIFICATION_LOG, JSON.stringify(logEntry) + '\n', 'utf8');
    } catch (error) {
        console.error('Error logging verification attempt:', error);
    }
}

// API endpoint to verify email and code
app.post('/api/verify', async (req, res) => {
    const { email, code } = req.body;
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    if (!email || !code) {
        await logVerificationAttempt(email || 'missing', code || 'missing', false, ip, userAgent);
        return res.status(400).json({ success: false, message: 'Email and code are required' });
    }
    
    const expectedCode = generateEmailHash(email);
    const isValid = code === expectedCode;
    
    // Log the verification attempt
    await logVerificationAttempt(email, code, isValid, ip, userAgent);
    
    if (isValid) {
        // Set session as authenticated
        req.session.authenticated = true;
        req.session.email = email.toLowerCase();
        
        // Set a cookie that expires in 24 hours
        res.cookie('sessionToken', 'valid', { 
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        
        res.json({ 
            success: true, 
            message: 'Verification successful',
            timestamp: new Date().toISOString()
        });
    } else {
res.status(401).json({ 
            success: false, 
            message: 'Invalid verification code',
            timestamp: new Date().toISOString()
        });
    }
});

// API endpoint to sign out
app.post('/api/signout', (req, res) => {
    console.log('Sign out request received');
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Error signing out' });
        }
        res.clearCookie('connect.sid'); // The default session cookie name
        res.json({ success: true, message: 'Signed out successfully' });
    });
});

// API endpoint to get list of documents (protected)
app.get('/api/documents', requireAuth, async (req, res) => {
    console.log('Document access by:', req.session.email, 'from IP:', req.clientInfo.ip);
    console.log('Documents request received from:', req.session.email);
    try {
        const files = await fs.readdir(path.join(__dirname, 'files'));
        const documents = [];
        
        for (const file of files) {
            if (file.toLowerCase().endsWith('.docx') || file.toLowerCase().endsWith('.pdf') || file.toLowerCase().endsWith('.doc')) {
                const filePath = path.join(__dirname, 'files', file);
                const stats = await fs.stat(filePath);
                
                documents.push({
                    name: file,
                    path: `/files/${encodeURIComponent(file)}`,
                    size: stats.size,
                    lastModified: stats.mtime.toISOString(),
                    type: path.extname(file).toLowerCase().substring(1)
                });
            }
        }
        
        res.json(documents);
    } catch (error) {
        console.error('Error reading files:', error);
        res.status(500).json({ error: 'Failed to read documents' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log(`- GET  /api/documents`);
    console.log(`- POST /api/verify`);
    console.log(`- POST /api/signout`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop any other servers using this port or specify a different port.`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});
