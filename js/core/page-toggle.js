/**
 * Page Toggle Module
 * Handles switching between Periodic Table and Molecules pages
 */

/**
 * Initializes the page toggle functionality
 */
function initPageToggle() {
    const pageSwitch = document.getElementById('pageSwitch');
    const periodicPageEl = document.querySelector('.container');
    const moleculesPageEl = document.getElementById('moleculesPage');

    pageSwitch.addEventListener('change', (e) => {
        const on = e.target.checked;
        
        if (on) {
            // Show molecules page, hide periodic table
            if (periodicPageEl) periodicPageEl.style.display = 'none';
            moleculesPageEl.style.display = 'block';
            moleculesPageEl.setAttribute('aria-hidden', 'false');
            document.getElementById('labelPeriodic').style.opacity = 0.5;
            document.getElementById('labelMolecules').style.opacity = 1;
        } else {
            // Show periodic table, hide molecules page
            if (periodicPageEl) periodicPageEl.style.display = '';
            moleculesPageEl.style.display = 'none';
            moleculesPageEl.setAttribute('aria-hidden', 'true');
            document.getElementById('labelPeriodic').style.opacity = 1;
            document.getElementById('labelMolecules').style.opacity = 0.5;
        }
    });
}
