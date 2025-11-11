/**
 * About Page - System Information Dashboard
 * Consolidated JavaScript functionality for the about page
 * @module aboutPage
 */

console.log('About page module loaded');

// Main initialization function
function initAboutPage() {
    console.log('Initializing about page...');
    
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
    'use strict';

    // Feature detection
    const supports = {
        serviceWorker: 'serviceWorker' in navigator,
        webWorker: 'Worker' in window,
        webGL: (() => {
            try {
                const canvas = document.createElement('canvas');
                return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
            } catch (e) {
                return false;
            }
        })(),
        webP: (() => {
            const elem = document.createElement('canvas');
            if (!!(elem.getContext && elem.getContext('2d'))) {
                return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
            }
            return false;
        })()
    };

    // Performance tracking
    const perf = {
        startTime: performance.now(),
        marks: {},
        measures: {}
    };

    // Mark a performance milestone
    function mark(name) {
        const now = performance.now();
        perf.marks[name] = now;
        return now;
    }

    // Measure time between two marks
    function measure(name, startMark, endMark) {
        const start = perf.marks[startMark] || perf.startTime;
        const end = endMark ? (perf.marks[endMark] || performance.now()) : performance.now();
        perf.measures[name] = end - start;
        return perf.measures[name];
    }

    // Initialize the application with error handling
    function initApp() {
        try {
            console.log('Initializing application...');
            mark('appInitStart');

            // Initialize core UI elements first
            try {
                updateEnvironmentBadge();
                updateCurrentYear();
                console.log('Basic UI initialized');
            } catch (e) {
                console.error('Error initializing basic UI:', e);
            }

            // Initialize system information
            try {
                updateSystemInfo();
                console.log('System info updated');
            } catch (e) {
                console.error('Error updating system info:', e);
            }

            // Initialize browser capabilities
            try {
                updateBrowserCapabilities();
                console.log('Browser capabilities updated');
            } catch (e) {
                console.error('Error updating browser capabilities:', e);
            }

            // Initialize user session
            try {
                updateUserSession();
                console.log('User session updated');
            } catch (e) {
                console.error('Error updating user session:', e);
            }

            // Initialize app info
            try {
                updateAppInfo();
                console.log('App info updated');
            } catch (e) {
                console.error('Error updating app info:', e);
            }

            // Initialize event listeners last
            try {
                initEventListeners();
                console.log('Event listeners initialized');
            } catch (e) {
                console.error('Error initializing event listeners:', e);
            }

            // Mark initialization complete
            mark('appInitEnd');
            const initTime = measure('appInitTime', 'appInitStart', 'appInitEnd');
            console.log(`Application initialized in ${initTime.toFixed(2)}ms`);
        } catch (e) {
            console.error('Critical error during initialization:', e);
        } finally {
            // Always ensure loading indicator is hidden
            try {
                const loadingIndicator = document.getElementById('loading-indicator');
                if (loadingIndicator) {
                    loadingIndicator.style.opacity = '0';
                    setTimeout(() => {
                        loadingIndicator.style.display = 'none';
                        document.body.classList.add('loaded');
                        console.log('Loading indicator hidden');
                    }, 300);
                }
            } catch (e) {
                console.error('Error hiding loading indicator:', e);
                document.body.classList.add('loaded');
            }
        }
    }

    // Update environment badge
    function updateEnvironmentBadge() {
        const envBadge = document.getElementById('environment-badge');
        if (!envBadge) return;

        const isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.endsWith('.local');

        if (isLocal) {
            envBadge.classList.add('env-development');
            const envText = document.getElementById('environment-text');
            if (envText) envText.textContent = 'Development';
        } else {
            envBadge.classList.add('env-production');
            const envText = document.getElementById('environment-text');
            if (envText) envText.textContent = 'Production';
        }
    }

    // Update current year in footer
    function updateCurrentYear() {
        const yearElements = document.querySelectorAll('[data-current-year]');
        const currentYear = new Date().getFullYear();
        yearElements.forEach(el => {
            el.textContent = currentYear;
        });
    }

    // Update system information
    function updateSystemInfo() {
        // OS and browser info
        const osInfo = getOSInfo();
        const browserInfo = detectBrowser();

        // Update UI elements
        setInfo('os-name', osInfo.name);
        setInfo('os-version', osInfo.version);
        setInfo('browser-name', browserInfo.name);
        setInfo('browser-version', browserInfo.version);
        setInfo('browser-engine', browserInfo.engine);
        setInfo('screen-resolution', `${window.screen.width}x${window.screen.height}`);
        setInfo('window-size', `${window.innerWidth}x${window.innerHeight}`);
        setInfo('pixel-ratio', window.devicePixelRatio || 1);
        setInfo('color-depth', window.screen.colorDepth);
        setInfo('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
        setInfo('language', navigator.language);
        setInfo('cookies-enabled', navigator.cookieEnabled ? 'Yes' : 'No');
        setInfo('cpus', navigator.hardwareConcurrency || 'Unknown');
        setInfo('device-memory', navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'Unknown');
    }

    // Get OS information
    function getOSInfo() {
        const userAgent = navigator.userAgent;
        let os = 'Unknown';
        let version = 'Unknown';

        if (userAgent.indexOf('Windows') !== -1) {
            os = 'Windows';
            if (userAgent.indexOf('Windows NT 10.0') !== -1) version = '10';
            else if (userAgent.indexOf('Windows NT 6.3') !== -1) version = '8.1';
            else if (userAgent.indexOf('Windows NT 6.2') !== -1) version = '8';
            else if (userAgent.indexOf('Windows NT 6.1') !== -1) version = '7';
        } else if (userAgent.indexOf('Mac') !== -1) {
            os = 'macOS';
            const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
            if (match) version = match[1].replace('_', '.');
        } else if (userAgent.indexOf('Linux') !== -1) {
            os = 'Linux';
        } else if (userAgent.indexOf('Android') !== -1) {
            os = 'Android';
            const match = userAgent.match(/Android (\d+\.\d+)/);
            if (match) version = match[1];
        } else if (userAgent.indexOf('iOS') !== -1 || userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) {
            os = 'iOS';
            const match = userAgent.match(/OS (\d+_\d+)/);
            if (match) version = match[1].replace('_', '.');
        }

        return { name: os, version };
    }

    // Detect browser information with enhanced error handling
    function detectBrowser() {
        try {
            const userAgent = navigator.userAgent || '';
            let name = 'Unknown';
            let version = 'Unknown';
            let engine = 'Unknown';

            // Browser detection - order matters here
            if (userAgent.includes('Edg')) {
                // Check for Edge first since it contains Chrome in its user agent
                name = 'Microsoft Edge';
                const match = userAgent.match(/Edg[\/\s]([\d.]+)/);
                version = match ? match[1] : 'Unknown';
                engine = 'Blink';
            } else if (userAgent.includes('Firefox')) {
                name = 'Firefox';
                const match = userAgent.match(/Firefox[\/\s]([\d.]+)/);
                version = match ? match[1] : 'Unknown';
                engine = 'Gecko';
            } else if (userAgent.includes('Chrome') && !userAgent.includes('Chromium')) {
                name = 'Chrome';
                const match = userAgent.match(/Chrome[\/\s]([\d.]+)/);
                version = match ? match[1] : 'Unknown';
                engine = 'Blink';
            } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
                name = 'Safari';
                const match = userAgent.match(/Version[\/\s]([\d.]+)/) || userAgent.match(/Safari[\/\s]([\d.]+)/);
                version = match ? match[1] : 'Unknown';
                engine = 'WebKit';
            } else if (userAgent.includes('Trident') || userAgent.includes('MSIE')) {
                name = 'Internet Explorer';
                const match = userAgent.match(/(?:rv:|MSIE\s)([\d.]+)/);
                version = match ? match[1] : '11';
                engine = 'Trident';
            }

            // Engine detection
            if (userAgent.includes('AppleWebKit')) {
                engine = 'WebKit';
            } else if (userAgent.includes('Gecko') && !userAgent.includes('KHTML')) {
                engine = 'Gecko';
            } else if (userAgent.includes('Presto')) {
                engine = 'Presto';
            }

            console.log(`Detected browser: ${name} ${version} (${engine})`);
            return { name, version, engine };
        } catch (error) {
            console.error('Error detecting browser:', error);
            return { name: 'Unknown', version: 'Unknown', engine: 'Unknown' };
        }

        return { name, version, engine };
    }

    // Update browser capabilities
    function updateBrowserCapabilities() {
        // Feature detection
        const capabilities = {
            'local-storage': 'localStorage' in window,
            'session-storage': 'sessionStorage' in window,
            'indexed-db': 'indexedDB' in window,
            'service-worker': 'serviceWorker' in navigator,
            'web-workers': 'Worker' in window,
            'web-sockets': 'WebSocket' in window,
            'webgl': supports.webGL,
            'webp': supports.webP,
            'web-animations': 'animate' in document.documentElement,
            'web-share': 'share' in navigator,
            'geolocation': 'geolocation' in navigator,
            'notifications': 'Notification' in window,
            'vibrate': 'vibrate' in navigator,
            'battery': 'getBattery' in navigator,
            'connection': 'connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator,
            'bluetooth': 'bluetooth' in navigator,
            'usb': 'usb' in navigator,
            'speech-recognition': 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
            'speech-synthesis': 'speechSynthesis' in window,
            'payment-request': 'PaymentRequest' in window,
            'credentials': 'credentials' in navigator,
            'clipboard': 'clipboard' in navigator,
            'media-devices': 'mediaDevices' in navigator,
            'get-display-media': 'getDisplayMedia' in navigator.mediaDevices || 'getDisplayMedia' in navigator,
            'picture-in-picture': 'pictureInPictureEnabled' in document || 'webkitPictureInPictureEnabled' in document
        };

        // Update UI
        const capabilitiesContainer = document.getElementById('browser-capabilities');
        if (capabilitiesContainer) {
            capabilitiesContainer.innerHTML = '';
            
            for (const [capability, isSupported] of Object.entries(capabilities)) {
                const element = document.createElement('div');
                element.className = `capability-tag ${isSupported ? 'enabled' : 'disabled'}`;
                element.textContent = capability.replace(/-/g, ' ');
                element.title = isSupported ? 'Supported' : 'Not supported';
                capabilitiesContainer.appendChild(element);
            }
        }
    }

    // Update user session information
    function updateUserSession() {
        // Connection information
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            setInfo('connection-type', connection.type || 'unknown');
            setInfo('effective-type', connection.effectiveType || 'unknown');
            setInfo('downlink', connection.downlink ? `${connection.downlink} Mbps` : 'unknown');
            setInfo('rtt', connection.rtt ? `${connection.rtt} ms` : 'unknown');
            setInfo('save-data', connection.saveData ? 'Enabled' : 'Disabled');
        }

        // Session information
        const sessionStart = sessionStorage.getItem('sessionStart') || new Date().toISOString();
        if (!sessionStorage.getItem('sessionStart')) {
            sessionStorage.setItem('sessionStart', sessionStart);
        }

        setInfo('session-start', new Date(sessionStart).toLocaleString());
        setInfo('page-views', (parseInt(sessionStorage.getItem('pageViews') || '0') + 1).toString());
        sessionStorage.setItem('pageViews', (parseInt(sessionStorage.getItem('pageViews') || '0') + 1).toString());

        // Time on page
        const pageLoadTime = new Date();
        setInterval(() => {
            const seconds = Math.floor((new Date() - pageLoadTime) / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            
            let timeString = '';
            if (hours > 0) timeString += `${hours}h `;
            if (minutes > 0) timeString += `${minutes % 60}m `;
            timeString += `${seconds % 60}s`;
            
            setInfo('time-on-page', timeString);
        }, 1000);
    }

    // Update application information
    function updateAppInfo() {
        // Get app version from meta tag or use default
        const versionMeta = document.querySelector('meta[name="version"]');
        const appVersion = versionMeta ? versionMeta.getAttribute('content') : '1.0.0';
        
        // Set app info
        setInfo('app-version', appVersion);
        setInfo('build-date', document.lastModified || new Date().toLocaleString());
        
        // Performance metrics
        if (window.performance) {
            const navTiming = performance.getEntriesByType('navigation')[0];
            if (navTiming) {
                setInfo('page-load-time', `${Math.round(navTiming.domComplete)}ms`);
            }
            
            // Memory usage (Chrome only)
            if (performance.memory) {
                const memory = performance.memory;
                const usedMB = Math.round(memory.usedJSHeapSize / (1024 * 1024));
                const totalMB = Math.round(memory.totalJSHeapSize / (1024 * 1024));
                setInfo('memory-usage', `${usedMB}MB / ${totalMB}MB`);
            }
        }
    }

    // Helper function to safely set element text content
    function setInfo(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // Initialize event listeners
    function initEventListeners() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                
                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show selected tab content
                const tabContents = document.querySelectorAll('.tab-content');
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tabId}-tab`) {
                        content.classList.add('active');
                    }
                });
            });
        });

        // Diagnostic controls
        const refreshBtn = document.getElementById('refresh-diagnostics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                window.location.reload();
            });
        }

        const copyBtn = document.getElementById('copy-diagnostics');
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                try {
                    const activeTab = document.querySelector('.tab-button.active');
                    const tabId = activeTab ? activeTab.getAttribute('data-tab') : 'runtime';
                    const activeContent = document.getElementById(`${tabId}-tab`);
                    
                    if (activeContent) {
                        await navigator.clipboard.writeText(activeContent.textContent);
                        console.log('Diagnostic information copied to clipboard');
                    }
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                }
            });
        }

        const clearBtn = document.getElementById('clear-diagnostics');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const activeTab = document.querySelector('.tab-button.active');
                const tabId = activeTab ? activeTab.getAttribute('data-tab') : 'runtime';
                const activeContent = document.getElementById(`${tabId}-tab`);
                
                if (activeContent) {
                    activeContent.textContent = '';
                }
            });
        }
    }

    // Start the application
    initApp();
    }
}

// Initialize when DOM is ready
if (document.readyState !== 'loading') {
    // DOM is already ready, initialize immediately
    initAboutPage();
} else {
    // Wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initAboutPage);
}

// Export for testing or other modules
// Note: This won't be used directly when loaded as a module
// but is here for potential future use
try {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { initAboutPage };
    }
} catch (e) {
    // Not in a CommonJS environment
}
