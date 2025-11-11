// Main application entry point
import { createParticles } from './animations/particles.js';
import { observeElements, smoothScroll, headerScrollEffect } from './ui/scroll.js';
import { initEmailForm } from './forms/email-form.js';
import { initPanels } from './ui/panels.js';

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    observeElements();
    smoothScroll();
    headerScrollEffect();
    initEmailForm();
    initPanels();
});
