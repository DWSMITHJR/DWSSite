// Email form handling functionality

// Log email and hash to console
export function logEmailAndHash(email, hash) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Email: ${email}, Hash: ${hash}`);
}

// Generate a 6-digit hash from email
export function generateEmailHash(email) {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        const char = email.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    const positiveHash = Math.abs(hash);
    const hashStr = positiveHash.toString();
    
    if (hashStr.length >= 6) {
        return hashStr.slice(-6);
    } else {
        return hashStr.padStart(6, '0');
    }
}

// Email form initialization and validation
export function initEmailForm() {
    const form = document.getElementById('emailForm');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    const resultContainer = document.getElementById('resultContainer');
    const hashResult = document.getElementById('hashResult');

    if (!form) return;

    // Validate email on input
    emailInput.addEventListener('input', () => {
        if (emailInput.validity.valid) {
            emailError.textContent = '';
            emailInput.classList.remove('invalid');
        } else {
            showEmailError();
        }
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (emailInput.validity.valid) {
            const email = emailInput.value.trim();
            const hash = generateEmailHash(email);
            hashResult.textContent = hash;
            resultContainer.style.display = 'block';
            
            logEmailAndHash(email, hash);
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            showEmailError();
        }
    });

    function showEmailError() {
        if (emailInput.validity.valueMissing) {
            emailError.textContent = 'Please enter an email address';
        } else if (emailInput.validity.typeMismatch) {
            emailError.textContent = 'Please enter a valid email address';
        } else if (emailInput.validity.tooShort) {
            emailError.textContent = `Email should be at least ${emailInput.minLength} characters`;
        }
        emailInput.classList.add('invalid');
    }
}
