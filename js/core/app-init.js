/**
 * App Initialization Module (UPDATED)
 * Main entry point - initializes all features on page load
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Periodic Table
    initPeriodicTable();
    
    // Initialize Molecules features
    renderMoleculesList();
    initMoleculesSearch();
    
    // Initialize Chemical Reactions features
    initReactionsBuilder();
    initReactantSelector();
    
    // Initialize Page Toggle
    initPageToggle();
    
    console.log('✅ Interactive Periodic Table, Molecules & Chemical Reactions App Initialized');
});
