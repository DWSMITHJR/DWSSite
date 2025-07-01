// Create animated background particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random size and animation delay
        const size = Math.random() * 3 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// Intersection Observer for fade-in animations
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe all elements with fade-in class
    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });
}

// Smooth scrolling for navigation links
function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Header scroll effect
function headerScrollEffect() {
    const header = document.querySelector('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.style.transform = 'translateY(0)';
            return;
        }
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else if (currentScroll < lastScroll) {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
}

// Initialize all functions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    observeElements();
    smoothScroll();
    headerScrollEffect();
    initEmailForm();
});

// Log email and hash to console
function logEmailAndHash(email, hash) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Email: ${email}, Hash: ${hash}`);
    
    // In a real application, you would send this to a server endpoint
    // Example:
    // fetch('/api/log', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, hash, timestamp })
    // });
}

// Email form functionality
function initEmailForm() {
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
            // Generate and display hash
            const email = emailInput.value.trim();
            const hash = generateEmailHash(email);
            hashResult.textContent = hash;
            resultContainer.style.display = 'block';
            
            // Log the email and hash
            logEmailAndHash(email, hash);
            
            // Scroll to result
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

// Generate a 6-digit hash from email
function generateEmailHash(email) {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        const char = email.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    // Ensure positive number and get last 6 digits
    const positiveHash = Math.abs(hash);
    const hashStr = positiveHash.toString();
    
    // If hash is shorter than 6 digits, pad with leading zeros
    if (hashStr.length >= 6) {
        return hashStr.slice(-6);
    } else {
        return hashStr.padStart(6, '0');
    }
}
