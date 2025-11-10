/**
 * Environment detection and information utility
 * Handles both development and production environments
 */

class EnvironmentInfo {
    constructor() {
        // Cache detection results
        this._isDevelopment = null;
        this._info = null;
        this.startTime = Date.now();
        this.initialize();
    }
    
    get isDevelopment() {
        if (this._isDevelopment === null) {
            this._isDevelopment = this.detectDevelopment();
        }
        return this._isDevelopment;
    }
    
    get info() {
        if (!this._info) {
            this._info = this.collectInfo();
        }
        return this._info;
    }

    detectDevelopment() {
        // Cache hostname and port for better performance
        const { hostname, port, search } = window.location;
        
        // Check common development patterns
        return hostname === 'localhost' || 
               hostname === '127.0.0.1' || 
               port === '3000' || 
               port === '8080' ||
               search.includes('dev=true') ||
               // Additional check for local file protocol
               window.location.protocol === 'file:';
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        let tem;
        let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return { name: 'IE', version: (tem[1] || '') };
        }
        
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) {
                return { name: tem[1].replace('OPR', 'Opera'), version: tem[2] };
            }
        }
        
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) {
            M.splice(1, 1, tem[1]);
        }
        
        return { name: M[0], version: M[1] };
    }

    getOSInfo() {
        const userAgent = window.navigator.userAgent;
        const platform = window.navigator.platform;
        const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
        const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
        const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
        let os = null;

        if (macosPlatforms.indexOf(platform) !== -1) {
            os = 'macOS';
        } else if (iosPlatforms.indexOf(platform) !== -1) {
            os = 'iOS';
        } else if (windowsPlatforms.indexOf(platform) !== -1) {
            os = 'Windows';
        } else if (/Android/.test(userAgent)) {
            os = 'Android';
        } else if (!os && /Linux/.test(platform)) {
            os = 'Linux';
        }

        return {
            name: os || 'Unknown',
            platform: platform,
            userAgent: userAgent
        };
    }

    getConnectionInfo() {
        if (!navigator.connection) {
            return {
                effectiveType: 'unknown',
                downlink: 'unknown',
                rtt: 'unknown',
                saveData: false,
                type: 'unknown'
            };
        }

        return {
            effectiveType: navigator.connection.effectiveType || 'unknown',
            downlink: navigator.connection.downlink ? `${navigator.connection.downlink} Mbps` : 'unknown',
            rtt: navigator.connection.rtt ? `${navigator.connection.rtt}ms` : 'unknown',
            saveData: navigator.connection.saveData || false,
            type: navigator.connection.type || 'unknown'
        };
    }

    getMemoryInfo() {
        if (window.performance && window.performance.memory) {
            const memory = window.performance.memory;
            return {
                usedJSHeapSize: this.formatBytes(memory.usedJSHeapSize),
                totalJSHeapSize: this.formatBytes(memory.totalJSHeapSize),
                jsHeapSizeLimit: this.formatBytes(memory.jsHeapSizeLimit)
            };
        }
        return {
            usedJSHeapSize: 'N/A',
            totalJSHeapSize: 'N/A',
            jsHeapSizeLimit: 'N/A'
        };
    }

    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    getUptime() {
        const uptime = Date.now() - this.startTime;
        const seconds = Math.floor(uptime / 1000) % 60;
        const minutes = Math.floor(uptime / (1000 * 60)) % 60;
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        return { hours, minutes, seconds, formatted: `${hours}h ${minutes}m ${seconds}s` };
    }

    collectInfo() {
        // Only collect essential info initially
        const info = {
            browser: {
                name: navigator.appName,
                version: navigator.appVersion,
                userAgent: navigator.userAgent
            },
            timestamp: Date.now()
        };
        
        // Defer non-essential collection
        requestIdleCallback(() => {
            info.os = this.getOSInfo();
            info.connection = this.getConnectionInfo();
            info.memory = this.getMemoryInfo();
            info.timestamp = new Date().toISOString();
        });
        
        return info;
    }

    initialize() {
        // Add environment class to body
        document.body.classList.add(this.isDevelopment ? 'env-development' : 'env-production');
        
        // Log environment info
        if (this.isDevelopment) {
            console.log('Development mode enabled');
            console.log('Environment Info:', this.info);
        }
    }
}

// Create and export a singleton instance
const environment = new EnvironmentInfo();
export default environment;
