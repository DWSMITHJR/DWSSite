// Client-side authentication and document management utilities

// Document storage key
const DOCUMENTS_STORAGE_KEY = 'user_documents';
const AUTH_STORAGE_KEY = 'auth_data';

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
function saveAuthData(email, code) {
    const authData = {
        email,
        code,
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
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
    if (!email || !code) return false;
    
    // Verify the code matches the generated one
    const generatedCode = generateAccessCode(email);
    return code === generatedCode;
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
    verifyDocumentAccess
};

// For backward compatibility, also expose functions globally
Object.entries(window.authUtils).forEach(([key, value]) => {
    window[key] = value;
});
