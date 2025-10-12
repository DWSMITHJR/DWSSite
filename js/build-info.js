// Build information
const buildInfo = {
    // Generate a timestamp for the build
    buildDate: new Date().toISOString(),
    // Generate a simple build number based on timestamp (YYYYMMDD.HHmmss)
    buildNumber: () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}.${hours}${minutes}${seconds}`;
    },
    // Format the date in a more readable format
    formattedDate: () => {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        };
        return new Date().toLocaleString('en-US', options);
    }
};

// Function to update the build info in the footer
function updateBuildInfo() {
    const buildInfoElement = document.getElementById('build-info');
    if (buildInfoElement) {
        buildInfoElement.innerHTML = `
            <span class="build-info-item">Build: ${buildInfo.buildNumber()}</span>
            <span class="build-info-separator" aria-hidden="true">|</span>
            <span class="build-info-item">${buildInfo.formattedDate()}</span>
        `;
    }
}

// Update build info when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', updateBuildInfo);
