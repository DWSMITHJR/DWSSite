// API Configuration
const API_CONFIG = {
    // Base URL for all API requests
    BASE_URL: 'https://api.donaldwsmithjr.com', // Update this with your actual API server URL
    
    // Authentication endpoints
    ENDPOINTS: {
        VERIFY: '/api/verify',
        SIGNOUT: '/api/signout',
        DOCUMENTS: '/api/documents',
        TRACK: '/api/track',
        LOG_EMAIL_HASH: '/api/log/email-hash',
        DIAGNOSTICS: '/api/diagnostics'
    },
    
    // Default request headers
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    
    // Get full URL for an endpoint
    getUrl: function(endpoint) {
        return `${this.BASE_URL}${endpoint}`;
    },
    
    // Get headers with optional additional headers
    getHeaders: function(additionalHeaders = {}) {
        return {
            ...this.DEFAULT_HEADERS,
            ...additionalHeaders
        };
    }
};

// Make API_CONFIG available globally
window.API_CONFIG = API_CONFIG;
