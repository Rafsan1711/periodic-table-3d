/**
 * App Initialization Module
 * Main entry point - initializes all features on page load
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Periodic Table
    initPeriodicTable();
    
    // Initialize Molecules features
    renderMoleculesList();
    initMoleculesSearch();
    
    // Initialize Page Toggle
    initPageToggle();
    
    console.log('✅ Interactive Periodic Table & Molecules App Initialized');
});
