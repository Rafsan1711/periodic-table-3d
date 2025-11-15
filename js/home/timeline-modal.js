/**
 * Timeline Modal - Full Story View
 * Shows complete Wikipedia content + 3D models + Graphs
 */

class TimelineModal {
  constructor() {
    this.modal = null;
    this.currentEvent = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.molecules = [];
  }

  /**
   * Open modal with event data
   */
  async open(event) {
    console.log('📖 Opening timeline modal...', event.title);
    this.currentEvent = event;
    
    // Create modal if doesn't exist
    if (!this.modal) {
      this.createModal();
    }
    
    // Load cached data from Firebase
    const cachedData = await this.loadCachedData();
    
    // Populate modal content
    await this.populateContent(cachedData);
    
    // Show modal
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialize 3D viewer
    setTimeout(() => this.init3DViewer(), 300);
    
    // Create graphs
    setTimeout(() => this.createGraphs(), 500);
  }

  /**
   * Create modal structure
   */
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal timeline-modal';
    modal.id = 'timeline-modal';
    
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content timeline-modal-content">
        <div class="modal-header timeline-modal-header">
          <div class="modal-title" id="timeline-modal-title">
            <i class="fas fa-calendar-day"></i>
            Loading...
          </div>
          <button class="close-btn" id="close-timeline-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body timeline-modal-body">
          <!-- Loading State -->
          <div class="timeline-loading" id="timeline-loading">
            <div class="atom-loader">
              <div class="nucleus"></div>
              <div class="electron-orbit orbit-1"><div class="electron"></div></div>
              <div class="electron-orbit orbit-2"><div class="electron"></div></div>
              <div class="electron-orbit orbit-3"><div class="electron"></div></div>
            </div>
            <p>Loading chemistry history...</p>
          </div>
          
          <!-- Content Container -->
          <div class="timeline-content" id="timeline-content" style="display: none;">
            <!-- Header Section -->
            <div class="timeline-header-section">
              <div class="timeline-date-badge" id="timeline-date-badge"></div>
              <h2 class="timeline-event-title" id="timeline-event-title"></h2>
              <div class="timeline-scientist" id="timeline-scientist"></div>
            </div>
            
            <!-- 3D Molecules Section -->
            <div class="timeline-3d-section" id="timeline-3d-section" style="display: none;">
              <h3><i class="fas fa-cube"></i> 3D Molecular Models</h3>
              <div class="timeline-3d-viewer" id="timeline-3d-viewer"></div>
              <div class="molecule-controls" id="molecule-controls"></div>
            </div>
            
            <!-- Wikipedia Content -->
            <div class="timeline-wiki-section">
              <h3><i class="fab fa-wikipedia-w"></i> About This Discovery</h3>
              <div class="timeline-wiki-content" id="timeline-wiki-content"></div>
              <a href="#" target="_blank" class="wiki-read-more" id="wiki-read-more">
                Read full article on Wikipedia →
              </a>
            </div>
            
            <!-- Interactive Graphs -->
            <div class="timeline-graphs-section" id="timeline-graphs-section">
              <h3><i class="fas fa-chart-line"></i> Interactive Data Visualization</h3>
              <div class="timeline-graph-container" id="timeline-graph"></div>
            </div>
            
            <!-- Related Elements -->
            <div class="timeline-related-section" id="timeline-related-section" style="display: none;">
              <h3><i class="fas fa-atom"></i> Related Elements</h3>
              <div class="related-elements-grid" id="related-elements"></div>
            </div>
            
            <!-- Fun Facts -->
            <div class="timeline-facts-section">
              <h3><i class="fas fa-lightbulb"></i> Did You Know?</h3>
              <div class="timeline-fun-facts" id="timeline-fun-facts"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.modal = modal;
    
    // Event listeners
    modal.querySelector('.modal-overlay').addEventListener('click', () => this.close());
    modal.querySelector('#close-timeline-modal').addEventListener('click', () => this.close());
    
    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
    });
  }

  /**
   * Load cached data from Firebase
   */
  async loadCachedData() {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    try {
      const snapshot = await db.ref(`timeline/events/${dateKey}`).once('value');
      const cached = snapshot.val();
      
      if (cached && cached.wikiText) {
        console.log('✅ Loaded cached data from Firebase');
        return cached;
      }
      
      console.log('⚠️ No cached data, using event data only');
      return this.currentEvent;
      
    } catch (error) {
      console.error('Error loading cached data:', error);
      return this.currentEvent;
    }
  }

  /**
   * Populate modal content
   */
  async populateContent(data) {
    const today = new Date();
    const fullDate = formatFullEventDate(today, data.year);
    
    // Update title
    document.getElementById('timeline-modal-title').innerHTML = `
      <i class="fas fa-calendar-day"></i>
      ${data.title}
    `;
    
    // Date badge
    document.getElementById('timeline-date-badge').innerHTML = `
      <i class="fas fa-clock"></i>
      ${fullDate}
    `;
    
    // Event title
    document.getElementById('timeline-event-title').textContent = data.title;
    
    // Scientist
    document.getElementById('timeline-scientist').innerHTML = `
      <i class="fas fa-user-circle"></i>
      <span>${data.scientist}</span>
    `;
    
    // Wikipedia content
    if (data.wikiText) {
      document.getElementById('timeline-wiki-content').innerHTML = `
        <p>${data.wikiText}</p>
      `;
      
      if (data.wikiUrl) {
        const readMore = document.getElementById('wiki-read-more');
        readMore.href = data.wikiUrl;
        readMore.style.display = 'inline-flex';
      }
    } else {
      document.getElementById('timeline-wiki-content').innerHTML = `
        <p>${data.description}</p>
        <div class="wiki-loading">
          <i class="fas fa-sync fa-spin"></i>
          Fetching detailed information...
        </div>
      `;
    }
    
    // Fun facts
    document.getElementById('timeline-fun-facts').innerHTML = `
      <div class="fun-fact-card">
        <div class="fun-fact-icon">${data.icon}</div>
        <div class="fun-fact-text">${data.funFact}</div>
      </div>
    `;
    
    // Related elements
    if (data.relatedElements && data.relatedElements.length > 0) {
      this.showRelatedElements(data.relatedElements);
    }
    
    // Show 3D section if has molecules
    if (data.relatedMolecules && data.relatedMolecules.length > 0) {
      document.getElementById('timeline-3d-section').style.display = 'block';
    }
    
    // Hide loading, show content
    document.getElementById('timeline-loading').style.display = 'none';
    document.getElementById('timeline-content').style.display = 'block';
  }

  /**
   * Initialize 3D molecule viewer
   */
  init3DViewer() {
    const container = document.getElementById('timeline-3d-viewer');
    if (!container || !this.currentEvent.relatedMolecules) return;
    
    container.innerHTML = '';
    
    // Create Three.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d1117);
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / 400,
      0.1,
      1000
    );
    this.camera.position.z = 5;
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, 400);
    container.appendChild(this.renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
    
    // Load molecule from our data
    const moleculeName = this.currentEvent.relatedMolecules[0];
    const molecule = moleculesData.find(m => m.id === moleculeName);
    
    if (molecule) {
      this.create3DMoleculeFromData(molecule);
    }
    
    // Create controls
    this.createMoleculeControls();
    
    // Animation loop
    this.animate3D();
  }

  /**
   * Create 3D molecule from our data
   */
  create3DMoleculeFromData(molecule) {
    const group = new THREE.Group();
    
    const colorMap = {
      C: 0x222222, O: 0xff4444, H: 0xffffff, N: 0x3050f8
    };
    
    const radiusMap = {
      H: 0.25, C: 0.4, O: 0.38, N: 0.37
    };
    
    // Add atoms
    molecule.atoms.forEach(atom => {
      const color = colorMap[atom.el] || 0x888888;
      const radius = radiusMap[atom.el] || 0.35;
      
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshPhongMaterial({ color, shininess: 80 });
      const sphere = new THREE.Mesh(geometry, material);
      
      sphere.position.set(atom.x || 0, atom.y || 0, atom.z || 0);
      group.add(sphere);
    });
    
    // Add bonds
    molecule.bonds.forEach(bond => {
      const atom1 = molecule.atoms[bond[0]];
      const atom2 = molecule.atoms[bond[1]];
      
      if (!atom1 || !atom2) return;
      
      const start = new THREE.Vector3(atom1.x || 0, atom1.y || 0, atom1.z || 0);
      const end = new THREE.Vector3(atom2.x || 0, atom2.y || 0, atom2.z || 0);
      const distance = start.distanceTo(end);
      
      const geometry = new THREE.CylinderGeometry(0.08, 0.08, distance, 12);
      const material = new THREE.MeshPhongMaterial({ color: 0x999999 });
      const cylinder = new THREE.Mesh(geometry, material);
      
      const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      cylinder.position.copy(midpoint);
      cylinder.lookAt(end);
      cylinder.rotateX(Math.PI / 2);
      
      group.add(cylinder);
    });
    
    this.scene.add(group);
    this.molecules.push(group);
  }

  /**
   * Create molecule controls
   */
  createMoleculeControls() {
    const controls = document.getElementById('molecule-controls');
    if (!controls) return;
    
    controls.innerHTML = `
      <button class="molecule-control-btn" id="rotate-toggle">
        <i class="fas fa-sync"></i> Auto Rotate
      </button>
      <button class="molecule-control-btn" id="reset-view">
        <i class="fas fa-redo"></i> Reset View
      </button>
    `;
    
    // Auto rotate toggle
    let autoRotate = true;
    document.getElementById('rotate-toggle').addEventListener('click', (e) => {
      autoRotate = !autoRotate;
      e.target.innerHTML = autoRotate ? 
        '<i class="fas fa-sync"></i> Auto Rotate' : 
        '<i class="fas fa-pause"></i> Paused';
    });
    
    // Reset view
    document.getElementById('reset-view').addEventListener('click', () => {
      this.camera.position.set(0, 0, 5);
    });
  }

  /**
   * 3D Animation loop
   */
  animate3D() {
    if (!this.renderer || !this.scene || !this.camera) return;
    
    requestAnimationFrame(() => this.animate3D());
    
    // Rotate molecules
    this.molecules.forEach(mol => {
      mol.rotation.y += 0.005;
    });
    
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Create interactive graphs
   */
  createGraphs() {
    if (!this.currentEvent.graphs) return;
    
    const container = document.getElementById('timeline-graph');
    if (!container) return;
    
    const { type, data } = this.currentEvent.graphs;
    
    switch (type) {
      case 'discovery_timeline':
        this.createTimelineGraph(container, data);
        break;
      case 'isotope_comparison':
        this.createBarChart(container, data);
        break;
      case 'atmosphere_composition':
        this.createPieChart(container, data);
        break;
      case 'noble_gases':
        this.createBarChart(container, data);
        break;
      default:
        this.createGenericGraph(container, data);
    }
  }

  /**
   * Create timeline graph
   */
  createTimelineGraph(container, data) {
    container.innerHTML = '';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '300');
    svg.style.display = 'block';
    
    const width = container.clientWidth;
    const height = 300;
    const padding = 60;
    
    // Scale
    const years = data.events.map(e => e.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const yearRange = maxYear - minYear || 1;
    
    // Draw timeline line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', padding);
    line.setAttribute('y1', height / 2);
    line.setAttribute('x2', width - padding);
    line.setAttribute('y2', height / 2);
    line.setAttribute('stroke', '#58a6ff');
    line.setAttribute('stroke-width', '4');
    svg.appendChild(line);
    
    // Draw events
    data.events.forEach((event, i) => {
      const x = padding + ((event.year - minYear) / yearRange) * (width - padding * 2);
      const y = height / 2;
      
      // Circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '12');
      circle.setAttribute('fill', '#bc8cff');
      circle.setAttribute('stroke', '#0d1117');
      circle.setAttribute('stroke-width', '3');
      circle.style.cursor = 'pointer';
      svg.appendChild(circle);
      
      // Year label
      const yearText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      yearText.setAttribute('x', x);
      yearText.setAttribute('y', y - 30);
      yearText.setAttribute('text-anchor', 'middle');
      yearText.setAttribute('fill', '#f0f6fc');
      yearText.setAttribute('font-size', '14');
      yearText.setAttribute('font-weight', '700');
      yearText.textContent = event.year;
      svg.appendChild(yearText);
      
      // Event label
      const eventText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      eventText.setAttribute('x', x);
      eventText.setAttribute('y', y + 40);
      eventText.setAttribute('text-anchor', 'middle');
      eventText.setAttribute('fill', '#8b949e');
      eventText.setAttribute('font-size', '12');
      eventText.textContent = event.event;
      svg.appendChild(eventText);
    });
    
    container.appendChild(svg);
  }

  /**
   * Create bar chart
   */
  createBarChart(container, data) {
    container.innerHTML = '';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '300');
    
    const width = container.clientWidth;
    const height = 300;
    const padding = 60;
    
    const values = data.masses || data.percentages;
    const labels = data.isotopes || data.gases;
    const maxValue = Math.max(...values);
    
    const barWidth = (width - padding * 2) / labels.length - 10;
    
    labels.forEach((label, i) => {
      const value = values[i];
      const barHeight = ((value / maxValue) * (height - padding * 2));
      const x = padding + i * ((width - padding * 2) / labels.length);
      const y = height - padding - barHeight;
      
      // Bar
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', barHeight);
      rect.setAttribute('fill', '#58a6ff');
      rect.setAttribute('rx', '6');
      svg.appendChild(rect);
      
      // Value label
      const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valueText.setAttribute('x', x + barWidth / 2);
      valueText.setAttribute('y', y - 10);
      valueText.setAttribute('text-anchor', 'middle');
      valueText.setAttribute('fill', '#f0f6fc');
      valueText.setAttribute('font-size', '12');
      valueText.setAttribute('font-weight', '700');
      valueText.textContent = value;
      svg.appendChild(valueText);
      
      // Label
      const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelText.setAttribute('x', x + barWidth / 2);
      labelText.setAttribute('y', height - padding + 20);
      labelText.setAttribute('text-anchor', 'middle');
      labelText.setAttribute('fill', '#8b949e');
      labelText.setAttribute('font-size', '11');
      labelText.textContent = label;
      svg.appendChild(labelText);
    });
    
    container.appendChild(svg);
  }

  /**
   * Create pie chart
   */
  createPieChart(container, data) {
    container.innerHTML = '';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '300');
    
    const width = container.clientWidth;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 100;
    
    const colors = ['#58a6ff', '#bc8cff', '#7ce38b', '#ffa657', '#ff7b72'];
    
    let currentAngle = -90;
    
    data.percentages.forEach((percent, i) => {
      const angle = (percent / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);
      
      const largeArc = angle > 180 ? 1 : 0;
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const d = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      path.setAttribute('d', d);
      path.setAttribute('fill', colors[i % colors.length]);
      path.setAttribute('stroke', '#0d1117');
      path.setAttribute('stroke-width', '2');
      svg.appendChild(path);
      
      // Label
      const labelAngle = startAngle + angle / 2;
      const labelRad = (labelAngle * Math.PI) / 180;
      const labelX = centerX + (radius * 0.7) * Math.cos(labelRad);
      const labelY = centerY + (radius * 0.7) * Math.sin(labelRad);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', labelX);
      text.setAttribute('y', labelY);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#fff');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', '700');
      text.textContent = `${percent}%`;
      svg.appendChild(text);
      
      currentAngle = endAngle;
    });
    
    // Legend
    const legendY = 20;
    data.gases.forEach((gas, i) => {
      const legendX = 20 + i * 100;
      
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', legendX);
      rect.setAttribute('y', legendY);
      rect.setAttribute('width', '15');
      rect.setAttribute('height', '15');
      rect.setAttribute('fill', colors[i % colors.length]);
      rect.setAttribute('rx', '3');
      svg.appendChild(rect);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', legendX + 20);
      text.setAttribute('y', legendY + 12);
      text.setAttribute('fill', '#8b949e');
      text.setAttribute('font-size', '11');
      text.textContent = gas;
      svg.appendChild(text);
    });
    
    container.appendChild(svg);
  }

  /**
   * Create generic graph
   */
  createGenericGraph(container, data) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
        <i class="fas fa-chart-line" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p>Graph visualization coming soon</p>
      </div>
    `;
  }

  /**
   * Show related elements
   */
  showRelatedElements(elements) {
    const container = document.getElementById('related-elements');
    const section = document.getElementById('timeline-related-section');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    elements.forEach(symbol => {
      const element = elementsData.find(e => e.symbol === symbol);
      if (!element) return;
      
      const card = document.createElement('div');
      card.className = `element-card ${element.category}`;
      card.innerHTML = `
        <div class="element-symbol">${element.symbol}</div>
        <div class="element-name">${element.name}</div>
        <div class="element-number">#${element.number}</div>
      `;
      
      card.addEventListener('click', () => {
        if (typeof openElementModal === 'function') {
          this.close();
          setTimeout(() => openElementModal(element), 300);
        }
      });
      
      container.appendChild(card);
    });
    
    section.style.display = 'block';
  }

  /**
   * Close modal
   */
  close() {
    if (!this.modal) return;
    
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Cleanup 3D
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    this.scene = null;
    this.camera = null;
    this.molecules = [];
    
    console.log('✅ Timeline modal closed');
  }
}

// Global instance
let timelineModalInstance = null;

/**
 * Open timeline modal
 */
function openTimelineModal(event) {
  if (!timelineModalInstance) {
    timelineModalInstance = new TimelineModal();
  }
  timelineModalInstance.open(event);
}

// Export
window.TimelineModal = TimelineModal;
window.openTimelineModal = openTimelineModal;

console.log('✅ Timeline Modal loaded');
