/**
 * API Service - Handles all API communication with the backend
 */

// Make sure API_CONFIG is loaded
if (typeof API_CONFIG === 'undefined') {
    console.error('API_CONFIG is not defined. Make sure config.js is loaded before api.js');
}

class ApiService {
    /**
     * Make an API request
     * @param {string} endpoint - The API endpoint to call
     * @param {string} method - HTTP method (GET, POST, etc.)
     * @param {Object} [data] - Request body data
     * @param {Object} [headers] - Additional headers
     * @returns {Promise<Object>} - Response data
     */
    static async request(endpoint, method = 'GET', data = null, headers = {}) {
        const url = API_CONFIG.getUrl(endpoint);
        const options = {
            method,
            headers: API_CONFIG.getHeaders(headers),
            credentials: 'include' // Important for cookies/session
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            
            // Handle non-2xx responses
            if (!response.ok) {
                const errorData = await this._parseErrorResponse(response);
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // For 204 No Content responses
            if (response.status === 204) {
                return {};
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Parse error response from the API
     * @private
     */
    static async _parseErrorResponse(response) {
        try {
            return await response.json();
        } catch (e) {
            return {
                status: response.status,
                message: response.statusText || 'An error occurred'
            };
        }
    }

    // Authentication
    static verifyEmail(email, code) {
        return this.request(API_CONFIG.ENDPOINTS.VERIFY, 'POST', { email, code });
    }

    static signOut() {
        return this.request(API_CONFIG.ENDPOINTS.SIGNOUT, 'POST');
    }

    // Documents
    static getDocuments() {
        return this.request(API_CONFIG.ENDPOINTS.DOCUMENTS, 'GET');
    }

    // Tracking
    static trackEvent(eventData) {
        return this.request(API_CONFIG.ENDPOINTS.TRACK, 'POST', eventData);
    }

    static logEmailHash(email, emailHash, additionalData = {}) {
        return this.request(API_CONFIG.ENDPOINTS.LOG_EMAIL_HASH, 'POST', {
            email,
            emailHash,
            pageUrl: window.location.href,
            userAgent: navigator.userAgent,
            ...additionalData
        });
    }

    // Diagnostic logging
    static logDiagnostic(level, message, category = 'application', additionalData = {}) {
        return this.request(API_CONFIG.ENDPOINTS.DIAGNOSTICS, 'POST', {
            level,
            message,
            category,
            timestamp: new Date().toISOString(),
            pageUrl: window.location.href,
            userAgent: navigator.userAgent,
            ...additionalData
        }).catch(error => {
            console.error('Failed to log diagnostic:', error);
            // Don't throw the error to prevent breaking the application flow
            // due to logging failures
            return Promise.resolve();
        });
    }
}

// Make the API service available globally
window.ApiService = ApiService;
