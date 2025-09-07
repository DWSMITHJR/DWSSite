/**
 * Tracking and Analytics Service
 * Handles user interactions and analytics events
 */
class TrackingService {
    constructor() {
        this.initialized = false;
        this.trackingEnabled = true; // Set to false to disable tracking
    }

    /**
     * Initialize tracking service
     */
    init() {
        if (this.initialized || !this.trackingEnabled) return;
        
        try {
            // Initialize analytics services here if needed
            // Example: Google Analytics, Mixpanel, etc.
            console.log('Tracking service initialized');
            this.initialized = true;
            
            // Track page view
            this.trackPageView();
            
            // Set up event listeners for tracking
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Failed to initialize tracking:', error);
        }
    }
    
    /**
     * Track page view
     * @param {string} page - Page path (defaults to current path)
     */
    trackPageView(page = window.location.pathname) {
        if (!this.initialized || !this.trackingEnabled) return;
        
        const data = {
            page,
            title: document.title,
            timestamp: new Date().toISOString(),
            referrer: document.referrer
        };
        
        // In a real app, send this to your analytics service
        console.log('Page view:', data);
    }
    
    /**
     * Track custom event
     * @param {string} category - Event category
     * @param {string} action - Event action
     * @param {string} label - Event label (optional)
     * @param {number} value - Event value (optional)
     */
    trackEvent(category, action, label = '', value = null) {
        if (!this.initialized || !this.trackingEnabled) return;
        
        const eventData = {
            category,
            action,
            label,
            value,
            timestamp: new Date().toISOString()
        };
        
        // In a real app, send this to your analytics service
        console.log('Event tracked:', eventData);
    }
    
    /**
     * Set up event listeners for tracking
     */
    setupEventListeners() {
        // Track outbound links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            // Track external links
            if (link.hostname !== window.location.hostname) {
                this.trackEvent('Outbound Link', 'Click', link.href);
            }
        });
        
        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (!form) return;
            
            this.trackEvent('Form', 'Submit', form.id || 'unknown-form');
        });
    }
}

// Initialize tracking service
const trackingService = new TrackingService();

document.addEventListener('DOMContentLoaded', () => {
    trackingService.init();
});

// Make available globally
window.trackingService = trackingService;
