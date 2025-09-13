/**
 * API Service for handling HTTP requests
 */
class ApiService {
    constructor() {
        this.baseUrl = CONFIG.API_BASE_URL;
    }

    /**
     * Make an API request
     * @param {string} endpoint - API endpoint
     * @param {string} method - HTTP method (GET, POST, etc.)
     * @param {Object} data - Request data
     * @returns {Promise} - Promise with response data
     */
    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Something went wrong');
            }

            return responseData;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * Get authentication token from localStorage
     * @returns {string|null} - Auth token or null if not found
     */
    getAuthToken() {
        const authData = JSON.parse(localStorage.getItem(CONFIG.AUTH.STORAGE_KEY) || '{}');
        return authData.token || null;
    }

    // Auth endpoints
    async login(email, code) {
        return this.request(CONFIG.ENDPOINTS.AUTH, 'POST', { email, code });
    }

    // Document endpoints
    async getDocuments() {
        return this.request(CONFIG.ENDPOINTS.DOCUMENTS);
    }

    async uploadDocument(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${this.baseUrl}${CONFIG.ENDPOINTS.UPLOAD}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }

        return response.json();
    }
}

// Initialize API service
const apiService = new ApiService();

// Make available globally
window.apiService = apiService;
