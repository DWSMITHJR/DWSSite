// Application configuration
const CONFIG = {
    // API endpoints
    API_BASE_URL: '/api',
    ENDPOINTS: {
        AUTH: '/auth',
        DOCUMENTS: '/documents',
        UPLOAD: '/upload'
    },
    
    // Application settings
    APP: {
        NAME: 'Document Manager',
        VERSION: '1.0.0',
        ENV: 'development' // 'development' or 'production'
    },
    
    // Authentication settings
    AUTH: {
        TOKEN_KEY: 'auth_token',
        TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        STORAGE_KEY: 'auth_data'
    },
    
    // UI settings
    UI: {
        ITEMS_PER_PAGE: 10,
        NOTIFICATION_TIMEOUT: 5000, // 5 seconds
        DEBOUNCE_DELAY: 300 // ms for search input debouncing
    }
};

// Make config available globally
window.CONFIG = CONFIG;
