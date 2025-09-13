// Defer environment import until needed
let environment;

class AboutPage {
    constructor() {
        this.initTime = performance.now();
        this.elements = {};
        this.initialize();
    }

    async initialize() {
        // Lazy load environment module
        if (!environment) {
            const envModule = await import('../utils/environment.js');
            environment = envModule.default;
        }
        
        // Initialize elements on demand
        this.elements = {
            // Application Info
            appVersion: document.getElementById('app-version'),
            buildDate: document.getElementById('build-date'),
            appEnvironment: document.getElementById('app-environment'),
            lastUpdated: document.getElementById('last-updated'),
            pageLoadTime: document.getElementById('page-load-time'),
            appUptime: document.getElementById('app-uptime'),
            memoryUsage: document.getElementById('memory-usage'),
            cpuCores: document.getElementById('cpu-cores'),
            
            // System Info
            osName: document.getElementById('os-name'),
            osPlatform: document.getElementById('os-platform'),
            osArch: document.getElementById('os-arch'),
            cpuThreads: document.getElementById('cpu-threads'),
            memTotal: document.getElementById('mem-total'),
            memFree: document.getElementById('mem-free'),
            memUsed: document.getElementById('mem-used'),
            
            // Server Info
            serverHostname: document.getElementById('server-hostname'),
            serverPort: document.getElementById('server-port'),
            serverProtocol: document.getElementById('server-protocol'),
            requestMethod: document.getElementById('request-method'),
            requestUrl: document.getElementById('request-url'),
            requestPath: document.getElementById('request-path'),
            responseStatus: document.getElementById('response-status'),
            contentType: document.getElementById('content-type'),
            serverSoftware: document.getElementById('server-software'),
            
            // User Session
            connectionStatus: document.getElementById('connection-status'),
            connectionType: document.getElementById('connection-type'),
            effectiveType: document.getElementById('effective-type'),
            downlink: document.getElementById('downlink'),
            rtt: document.getElementById('rtt'),
            authStatus: document.getElementById('auth-status'),
            authUser: document.getElementById('auth-user'),
            authRole: document.getElementById('auth-role'),
            lastLogin: document.getElementById('last-login'),
            sessionStart: document.getElementById('session-start'),
            lastActive: document.getElementById('last-active'),
            pageViews: document.getElementById('page-views'),
            timeOnPage: document.getElementById('time-on-page')
        };
        
        // Initialize critical UI first
        this.updateCriticalInfo();
        
        // Defer non-critical initialization
        requestIdleCallback(() => this.init());
        
        this.pageLoadTime = Date.now();
    }
    
    updateCriticalInfo() {
        // Only update immediately visible or critical information
        this.updateAppInfo();
        this.updateSystemInfo();
        
        // Show loading is complete after critical info is loaded
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.opacity = '0';
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
            }, 300);
        }
    }
    
    init() {
        // Update server info and user session in the background
        requestIdleCallback(() => {
            this.updateServerInfo();
            this.updateUserSession();
            this.updateBrowserCapabilities();
        });
        
        // Start timers with lower priority
        setTimeout(() => this.startTimers(), 1000);
    }
    
    updateAppInfo() {
        // Set version from package.json or default
        this.setElementText('app-version', '1.0.0');
        this.setElementText('build-date', new Date(document.lastModified).toLocaleString());
        this.setElementText('app-environment', environment.isDevelopment ? 'Development' : 'Production');
        this.setElementText('last-updated', 'Just now');
        
        // Calculate page load time
        const loadTime = Date.now() - this.pageLoadTime;
        this.setElementText('page-load-time', `${(loadTime / 1000).toFixed(2)}s`);
        
        // Set initial memory info
        this.updateMemoryInfo();
    }
    
    updateSystemInfo() {
        const osInfo = environment.getOSInfo();
        const browserInfo = environment.getBrowserInfo();
        
        this.setElementText('os-name', `${osInfo.name} (${osInfo.platform})`);
        this.setElementText('os-platform', osInfo.platform);
        this.setElementText('os-arch', navigator.platform.includes('Win') ? 'x64' : navigator.platform);
        
        // Get CPU core count (may not be accurate in all browsers)
        const cores = navigator.hardwareConcurrency || 'Unknown';
        this.setElementText('cpu-cores', cores);
        this.setElementText('cpu-threads', cores);
        
        // Memory information (may not be available in all browsers)
        if (navigator.deviceMemory) {
            this.setElementText('mem-total', `${navigator.deviceMemory} GB`);
            this.setElementText('mem-free', 'Calculating...');
            this.setElementText('mem-used', 'Calculating...');
        }
    }
    
    updateServerInfo() {
        // Server information from the current page
        this.setElementText('server-hostname', window.location.hostname);
        this.setElementText('server-port', window.location.port || '80');
        this.setElementText('server-protocol', window.location.protocol.replace(':', ''));
        
        // Request information
        this.setElementText('request-method', 'GET');
        this.setElementText('request-url', window.location.href);
        this.setElementText('request-path', window.location.pathname);
        
        // Response information
        this.setElementText('response-status', '200 OK');
        this.setElementText('content-type', document.contentType || 'text/html');
        this.setElementText('server-software', 'Static Site');
    }
    
    updateUserSession() {
        // Connection information
        const conn = environment.getConnectionInfo();
        this.setElementText('connection-status', 'Online');
        this.setElementText('connection-type', conn.type);
        this.setElementText('effective-type', conn.effectiveType);
        this.setElementText('downlink', conn.downlink);
        this.setElementText('rtt', conn.rtt);
        
        // Authentication status (simplified)
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        this.setElementText('auth-status', isAuthenticated ? 'Authenticated' : 'Not Authenticated');
        this.setElementText('auth-user', localStorage.getItem('userEmail') || 'Guest');
        this.setElementText('auth-role', localStorage.getItem('userRole') || 'Viewer');
        
        // Session information
        if (!sessionStorage.getItem('sessionStart')) {
            sessionStorage.setItem('sessionStart', new Date().toISOString());
        }
        this.setElementText('session-start', new Date(sessionStorage.getItem('sessionStart')).toLocaleString());
        
        // Page views
        let pageViews = parseInt(sessionStorage.getItem('pageViews') || '0');
        sessionStorage.setItem('pageViews', pageViews + 1);
        this.setElementText('page-views', pageViews + 1);
        
        // Last login (simplified)
        const lastLogin = localStorage.getItem('lastLogin');
        this.setElementText('last-login', lastLogin ? new Date(lastLogin).toLocaleString() : 'Never');
        
        // Update last active time
        this.updateLastActive();
    }
    
    updateMemoryInfo() {
        if (window.performance && window.performance.memory) {
            const memory = window.performance.memory;
            this.setElementText('memory-usage', 
                `Used: ${environment.formatBytes(memory.usedJSHeapSize)} / ` +
                `Total: ${environment.formatBytes(memory.totalJSHeapSize)} / ` +
                `Limit: ${environment.formatBytes(memory.jsHeapSizeLimit)}`
            );
        } else {
            this.setElementText('memory-usage', 'Not available in this browser');
        }
    }
    
    updateLastActive() {
        this.setElementText('last-active', new Date().toLocaleTimeString());
    }
    
    updateUptime() {
        const uptime = environment.getUptime();
        this.setElementText('app-uptime', uptime.formatted);
        this.setElementText('time-on-page', uptime.formatted);
    }
    
    setupEventListeners() {
        // Update connection status when it changes
        if (navigator.connection) {
            navigator.connection.addEventListener('change', () => {
                const conn = environment.getConnectionInfo();
                this.setElementText('connection-status', 'Online');
                this.setElementText('connection-type', conn.type);
                this.setElementText('effective-type', conn.effectiveType);
                this.setElementText('downlink', conn.downlink);
                this.setElementText('rtt', conn.rtt);
            });
        }
        
        // Update last active time on user interaction
        ['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
            window.addEventListener(event, this.updateLastActive.bind(this), { passive: true });
        });
    }
    
    startTimers() {
        // Update uptime every second
        this.uptimeInterval = setInterval(() => this.updateUptime(), 1000);
        
        // Update memory info every 5 seconds if available
        if (window.performance && window.performance.memory) {
            this.memoryInterval = setInterval(() => this.updateMemoryInfo(), 5000);
        }
    }
    
    setElementText(elementId, text) {
        const element = this.elements[elementId];
        if (element) {
            element.textContent = text || '-';
            element.classList.remove('error');
        } else if (environment.isDevelopment) {
            console.warn(`Element with ID '${elementId}' not found`);
        }
    }
    
    cleanup() {
        if (this.uptimeInterval) clearInterval(this.uptimeInterval);
        if (this.memoryInterval) clearInterval(this.memoryInterval);
    }
}

// Initialize the about page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const aboutPage = new AboutPage();
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        aboutPage.cleanup();
    });
});

export default AboutPage;
