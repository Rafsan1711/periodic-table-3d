// ============================================
// beaker-sidebar.js
// ============================================
/**
 * Sidebar Functionality
 */

function initBeakerSidebar() {
    const sidebar = document.getElementById('beaker-sidebar');
    if (!sidebar) return;
    
    // Tab switching
    const tabs = document.querySelectorAll('.sidebar-tab');
    const grids = document.querySelectorAll('.element-grid');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            grids.forEach(grid => {
                if (grid.getAttribute('data-category') === category) {
                    grid.style.display = 'grid';
                } else {
                    grid.style.display = 'none';
                }
            });
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('element-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.element-card');
            
            cards.forEach(card => {
                const name = card.querySelector('.element-name').textContent.toLowerCase();
                if (name.includes(query)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Drag and drop
    setupDragAndDrop();
    
    console.log('✅ Sidebar initialized');
}

function setupDragAndDrop() {
    const cards = document.querySelectorAll('.element-card');
    const beakerWrapper = document.querySelector('.beaker-wrapper');
    
    cards.forEach(card => {
        // Click to add
        card.addEventListener('click', () => {
            const element = card.getAttribute('data-element');
            addElementToBeaker(element, { x: 200, y: 100 });
            closeSidebar();
        });
        
        // Drag start
        card.addEventListener('dragstart', (e) => {
            const element = card.getAttribute('data-element');
            e.dataTransfer.setData('element', element);
            card.classList.add('dragging');
        });
        
        // Drag end
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            closeSidebar();
        });
    });
    
    // Drop zone
    if (beakerWrapper) {
        beakerWrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        beakerWrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            const element = e.dataTransfer.getData('element');
            const rect = beakerWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            addElementToBeaker(element, { x, y });
        });
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('beaker-sidebar');
    if (sidebar) {
        sidebar.classList.remove('active');
    }
}

window.closeSidebar = closeSidebar;
