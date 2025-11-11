// Panel animation and interaction utilities

export function initPanelAnimations() {
    // Add intersection observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animation class based on data attributes
                if (entry.target.dataset.animate === 'fade') {
                    entry.target.classList.add('panel-fade-in');
                } else if (entry.target.dataset.animate === 'slide') {
                    entry.target.classList.add('panel-slide-up');
                }
                
                // Remove observer after animation
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all panels with animation attributes
    document.querySelectorAll('[data-animate]').forEach(panel => {
        observer.observe(panel);
    });
}

export function initPanelHoverEffects() {
    // Add hover effect to panels with data-hover attribute
    document.querySelectorAll('[data-hover]').forEach(panel => {
        const hoverType = panel.dataset.hover;
        
        panel.addEventListener('mouseenter', () => {
            if (hoverType === 'lift') {
                panel.classList.add('hover:panel-hover-lift');
            }
            // Add more hover effects as needed
        });

        panel.addEventListener('mouseleave', () => {
            if (hoverType === 'lift') {
                panel.classList.remove('hover:panel-hover-lift');
            }
            // Add more hover effects as needed
        });
    });
}

// Initialize all panel functionality
export function initPanels() {
    // Only initialize if we're on the client side
    if (typeof window !== 'undefined') {
        initPanelAnimations();
        initPanelHoverEffects();
    }
}

// Auto-initialize panels when DOM is loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initPanels);
}
