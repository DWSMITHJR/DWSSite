// Client-side authentication and document management utilities

// Storage keys
const DOCUMENTS_STORAGE_KEY = 'user_documents';
const AUTH_STORAGE_KEY = 'auth_data';
const ACCESS_LOGS_KEY = 'access_logs';

// Log levels
const LOG_LEVEL = {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    ACCESS: 'access'
};

/**
 * Generates a 6-digit access code for the given email
 * This is a simple hash function that will always return the same code for the same email
 * @param {string} email - User's email address
 * @returns {string} 6-digit access code
 */
function generateAccessCode(email) {
    // Normalize email by converting to lowercase and trimming whitespace
    const normalizedEmail = String(email).trim().toLowerCase();
    
    // Simple hash function to generate a consistent 6-digit code for the same email
    let hash = 0;
    for (let i = 0; i < normalizedEmail.length; i++) {
        const char = normalizedEmail.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // Ensure it's a 6-digit number
    return Math.abs(hash % 1000000).toString().padStart(6, '0');
}

/**
 * Saves authentication data to localStorage
 * @param {string} email - User's email
 * @param {string} code - Access code
 */
/**
 * Logs an access attempt or system event
 * @param {string} level - Log level (info, warn, error, access)
 * @param {string} message - Log message
 * @param {Object} [data] - Additional data to log
 */
function logEvent(level, message, data = {}) {
    try {
        const logs = JSON.parse(localStorage.getItem(ACCESS_LOGS_KEY) || '[]');
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...data
        };
        
        // Keep only the last 1000 logs to prevent localStorage from growing too large
        logs.unshift(logEntry);
        if (logs.length > 1000) {
            logs.length = 1000;
        }
        
        localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify(logs));
        
        // Also log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${level.toUpperCase()}] ${message}`, data);
        }
        
        return true;
    } catch (error) {
        console.error('Error logging event:', error);
        return false;
    }
}

function saveAuthData(email, code) {
    const authData = {
        email,
        code,
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
    };
    
    try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        logEvent(LOG_LEVEL.ACCESS, 'Auth data saved', { email, code });
        return true;
    } catch (error) {
        console.error('Error saving auth data:', error);
        logEvent(LOG_LEVEL.ERROR, 'Failed to save auth data', { email, error: error.message });
        return false;
    }
}

/**
 * Retrieves authentication data from localStorage
 * @returns {Object|null} Auth data or null if not found or expired
 */
function getAuthData() {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) return null;
    
    try {
        const parsed = JSON.parse(authData);
        if (Date.now() > parsed.expires) {
            clearAuthData();
            return null;
        }
        return parsed;
    } catch (e) {
        console.error('Error parsing auth data:', e);
        clearAuthData();
        return null;
    }
}

/**
 * Clears authentication data from localStorage
 */
function clearAuthData() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Saves documents to localStorage
 * @param {string} email - User's email
 * @param {Array} documents - Array of document objects
 */
function saveUserDocuments(email, documents) {
    if (!email || !documents || !Array.isArray(documents)) return;
    
    const allDocuments = JSON.parse(localStorage.getItem(DOCUMENTS_STORAGE_KEY) || '{}');
    allDocuments[email] = {
        documents,
        lastUpdated: new Date().toISOString()
    };
    
    try {
        localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(allDocuments));
        return true;
    } catch (e) {
        console.error('Error saving documents:', e);
        return false;
    }
}

/**
 * Gets documents for a specific user
 * @param {string} email - User's email
 * @returns {Array|null} User's documents or null if not found
 */
function getUserDocuments(email) {
    if (!email) return null;
    
    try {
        const allDocuments = JSON.parse(localStorage.getItem(DOCUMENTS_STORAGE_KEY) || '{}');
        return allDocuments[email]?.documents || [];
    } catch (e) {
        console.error('Error getting documents:', e);
        return [];
    }
}

/**
 * Initializes sample documents for a new user
 * @param {string} email - User's email
 * @returns {Array} Initial documents
 */
function initializeSampleDocuments(email) {
    const sampleDocs = [
        {
            id: 'doc1',
            title: 'Professional Resume',
            description: 'Detailed professional resume with work history and skills',
            fileName: 'Donald_Smith_Resume.pdf',
            fileType: 'pdf',
            fileSize: '245 KB',
            uploadDate: new Date().toISOString(),
            lastModified: new Date().toISOString()
        },
        {
            id: 'doc2',
            title: 'Cover Letter',
            description: 'Professional cover letter template',
            fileName: 'Cover_Letter_Template.docx',
            fileType: 'docx',
            fileSize: '45 KB',
            uploadDate: new Date().toISOString(),
            lastModified: new Date().toISOString()
        },
        {
            id: 'doc3',
            title: 'Certification - Web Development',
            description: 'Advanced Web Development Certification',
            fileName: 'Web_Dev_Certificate.pdf',
            fileType: 'pdf',
            fileSize: '1.2 MB',
            uploadDate: new Date().toISOString(),
            lastModified: new Date().toISOString()
        }
    ];
    
    saveUserDocuments(email, sampleDocs);
    return sampleDocs;
}

/**
 * Verifies if a user has access to download documents
 * @param {string} email - User's email
 * @param {string} code - Access code
 * @returns {boolean} True if access is granted
 */
function verifyDocumentAccess(email, code) {
    if (!email || !code) {
        logEvent(LOG_LEVEL.WARN, 'Access verification failed - missing email or code', { email, code });
        return false;
    }
    
    // Verify the code matches the generated one
    const generatedCode = generateAccessCode(email);
    const isValid = code === generatedCode;
    
    // Log the access attempt
    logEvent(
        isValid ? LOG_LEVEL.ACCESS : LOG_LEVEL.WARN,
        isValid ? 'Document access granted' : 'Invalid access attempt',
        { 
            email, 
            providedCode: code, 
            expectedCode: generatedCode,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        }
    );
    
    return isValid;
}

// Make functions available globally
window.authUtils = {
    generateAccessCode,
    saveAuthData,
    getAuthData,
    clearAuthData,
    isValidEmail,
    saveUserDocuments,
    getUserDocuments,
    initializeSampleDocuments,
    verifyDocumentAccess,
    logEvent,
    LOG_LEVEL
};

// For backward compatibility, also expose functions globally
Object.entries(window.authUtils).forEach(([key, value]) => {
    window[key] = value;
});
