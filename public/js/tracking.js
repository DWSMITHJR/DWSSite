// Collect client information
function collectClientInfo() {
    const screenInfo = {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio || 1
    };

    const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack === '1' || navigator.msDoNotTrack === '1' || window.doNotTrack === '1',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: screenInfo,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        },
        online: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
    };

    // Add more detailed browser detection if needed
    const ua = navigator.userAgent;
    browserInfo.browser = {
        isChrome: /Chrome/.test(ua) && !/Edge|Edg|OPR|Opera/.test(ua),
        isFirefox: /Firefox/.test(ua),
        isSafari: /Safari/.test(ua) && !/Chrome|Edge|Edg|OPR|Opera/.test(ua),
        isEdge: /Edg/.test(ua),
        isIE: /Trident/.test(ua),
        isOpera: /OPR|Opera/.test(ua)
    };

    // Get current page info
    const pageInfo = {
        url: window.location.href,
        referrer: document.referrer || 'direct',
        title: document.title,
        timestamp: new Date().toISOString()
    };

    return {
        browser: browserInfo,
        page: pageInfo
    };
}

// API base URL - update this to match your node-api-server URL
const API_BASE_URL = 'http://localhost:3001';

// Send tracking data to server
function sendTrackingData() {
    const clientInfo = collectClientInfo();
    
    // Send data to API server using ApiService
    ApiService.trackEvent(clientInfo).catch(error => {
        console.error('Error sending tracking data:', error);
    });
}

// Function to log email and hash to the server
async function logEmailAndHash(email, emailHash) {
    try {
        const clientInfo = collectClientInfo();
        const response = await ApiService.logEmailHash(email, emailHash, { clientInfo });
        console.log('Email hash logged successfully:', response);
        return response;
    } catch (error) {
        console.error('Error logging email hash:', error);
        throw error;
    }
}

// Run tracking when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initial tracking
    sendTrackingData();
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            sendTrackingData();
        }
    });
});
