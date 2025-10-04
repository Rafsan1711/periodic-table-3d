# ⚛️ Interactive Periodic Table & Molecular Chemistry Platform

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/yourusername/periodic-table-3d)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Made with](https://img.shields.io/badge/made%20with-Three.js%20%7C%20D3.js%20%7C%20GSAP-orange.svg)](https://threejs.org)
[![Live Demo](https://img.shields.io/badge/demo-live-success.svg)](https://periodic-table-3d-module.netlify.app)

**একটি সম্পূর্ণ ইন্টারেক্টিভ, 3D ভিজুয়ালাইজেশন সহ পিরিয়ডিক টেবিল এবং কেমিক্যাল রিঅ্যাকশন সিমুলেটর প্ল্যাটফর্ম**

একটি advanced web-based chemistry learning platform যা **Three.js**, **D3.js**, **GSAP** এবং modern web technologies ব্যবহার করে **118টি মৌল**, **100+ molecules**, **30+ chemical reactions** এবং **interactive reactivity charts** এর visualization প্রদান করে।

![Platform Screenshot](https://via.placeholder.com/1200x600/0d1117/58a6ff?text=Interactive+Periodic+Table+Platform)

---

## 🌟 Key Features Overview

### 🔬 Interactive Periodic Table (Main Module)
- ✅ **118 Elements** - সম্পূর্ণ periodic table with accurate positioning
- ✅ **11 Element Categories** - Color-coded classification system
- ✅ **3D Atom Visualization** - Real-time rotating atom models with electron shells
- ✅ **Electron Configuration** - Shell distribution using 2n² rule
- ✅ **Lanthanide & Actinide Series** - Separate sections with proper positioning
- ✅ **D3.js Reactivity Charts** - Visual representation of chemical reactivity patterns ⭐ NEW
- ✅ **Wikipedia Integration** - Auto-loading summaries via REST API
- ✅ **Mobile Optimized** - Touch gestures, swipe-to-close, haptic feedback
- ✅ **Category Highlighting** - Interactive legend with click-to-highlight

### 🧪 Molecules Explorer (3D Visualization)
- ✅ **100+ Molecules** - Organic, inorganic, and biological compounds
- ✅ **3D Ball-and-Stick Models** - Color-coded atoms with realistic bonds
- ✅ **2D Structure Diagrams** - SVG-based molecular drawings
- ✅ **Intelligent Search** - Fuzzy matching with advanced scoring algorithm
- ✅ **Dual Sort Modes** - Alphabetical or relevance-based sorting
- ✅ **Element-Specific Colors** - C=gray, O=red, N=blue, S=yellow, etc.
- ✅ **Bond Visualization** - Cylinders representing chemical bonds
- ✅ **Molecule Properties** - Formula, atom count, bond count display

### ⚗️ Chemical Reactions Theatre (Animation Engine)
- ✅ **30+ Predefined Reactions** - Synthesis, decomposition, combustion, neutralization
- ✅ **Interactive Equation Builder** - Visual reactant selection system
- ✅ **Coefficient Balancing** - Automatic display of balanced equations
- ✅ **3D Reaction Animation** - GSAP-powered collision and product formation
- ✅ **Particle Effects** - Explosion animations during reaction
- ✅ **Reaction Database** - Searchable catalog with reaction types
- ✅ **Visual Product Display** - Products arranged in geometric patterns

### 📊 Reactivity Analysis (Data Visualization) ⭐ NEW
- ✅ **D3.js Line Charts** - Beautiful animated graphs for 30+ elements
- ✅ **Reactivity Patterns** - Visual representation of reaction partners
- ✅ **Interactive Tooltips** - Hover effects with element information
- ✅ **Gradient Styling** - Smooth color transitions matching site theme
- ✅ **Empty States** - Informative messages for noble gases
- ✅ **Responsive Design** - Auto-scaling SVG for all screen sizes

### 🎨 Modern UI/UX
- ✅ **Dark Theme** - GitHub-inspired color scheme with gradients
- ✅ **Smooth Animations** - AOS scroll animations, GSAP transitions
- ✅ **Loading States** - Atom loaders with orbital electrons
- ✅ **Rich Tooltips** - Tippy.js powered contextual information
- ✅ **Responsive Design** - Mobile (≤768px), Tablet (≤992px), Desktop (>992px)
- ✅ **Keyboard Shortcuts** - ESC, Ctrl+K, 1/2/3 for quick navigation
- ✅ **Ripple Effects** - Material Design click feedback
- ✅ **Accessible** - ARIA labels, semantic HTML, screen reader friendly

---

## 📁 Project Architecture

### File Structure

```
project/
├── index.html                          # Main entry point (HTML5)
├── README.md                           # This comprehensive guide
├── LICENSE                             # MIT License
│
├── css/
│   └── styles.css                      # Complete stylesheet (1800+ lines)
│       ├── Base styles & CSS variables
│       ├── Loader animations
│       ├── Periodic table grid
│       ├── Element category colors
│       ├── Modal styles
│       ├── Molecules page layout
│       ├── Reactions theatre
│       ├── Reactivity charts (NEW)
│       └── Responsive breakpoints
│
└── js/
    ├── data/                           # Data modules
    │   ├── elements-data.js           # 118 elements with positions
    │   ├── molecules-data.js          # 100+ molecules with 3D coords
    │   ├── reactions-data.js          # 30+ chemical reactions
    │   └── reactivity-data.js         # Element reactivity patterns (NEW)
    │
    ├── core/                           # Core functionality
    │   ├── app-init.js                # Application initialization
    │   │   ├── Loader management
    │   │   ├── Feature initialization
    │   │   ├── Tooltip setup
    │   │   ├── Click effects
    │   │   ├── Keyboard shortcuts
    │   │   └── Performance optimization
    │   └── page-toggle.js             # Multi-page navigation logic
    │       ├── Page visibility control
    │       ├── Button state management
    │       └── AOS refresh handling
    │
    ├── periodic-table/                 # Periodic table module
    │   ├── table-renderer.js          # Grid rendering engine
    │   │   ├── 7×18 grid creation
    │   │   ├── Position mapping
    │   │   ├── Element cell generation
    │   │   ├── Series rendering
    │   │   ├── Category highlighting
    │   │   └── Mobile optimizations
    │   ├── element-modal.js           # Element detail modal
    │   │   ├── Modal lifecycle
    │   │   ├── 3D atom integration
    │   │   ├── Properties display
    │   │   ├── Wikipedia loading
    │   │   ├── Chart integration (NEW)
    │   │   └── Swipe gestures
    │   ├── atom-visualization.js      # 3D atom models
    │   │   ├── Three.js scene setup
    │   │   ├── Nucleus rendering
    │   │   ├── Electron shell calculation
    │   │   ├── Orbital creation
    │   │   ├── Animation loop
    │   │   └── Lighting system
    │   └── reactivity-chart.js        # D3.js charts (NEW)
    │       ├── Chart creation
    │       ├── Data visualization
    │       ├── Line & area rendering
    │       ├── Interactive tooltips
    │       ├── Gradient generation
    │       └── Responsive updates
    │
    ├── molecules/                      # Molecules module
    │   ├── molecules-list.js          # List rendering
    │   │   ├── Grid layout
    │   │   ├── Search filtering
    │   │   ├── Sort modes
    │   │   ├── Empty states
    │   │   └── Item animation
    │   ├── molecules-search.js        # Search functionality
    │   │   ├── Input handling
    │   │   ├── Debouncing
    │   │   ├── Sort toggle
    │   │   └── Score calculation
    │   ├── molecule-modal.js          # Detail modal
    │   │   ├── Modal management
    │   │   ├── 3D integration
    │   │   ├── 2D integration
    │   │   ├── Info display
    │   │   └── Cleanup handling
    │   ├── molecule-3d.js             # 3D structures
    │   │   ├── Ball-and-stick models
    │   │   ├── Atom spheres
    │   │   ├── Bond cylinders
    │   │   ├── Color mapping
    │   │   ├── Label sprites
    │   │   └── Rotation animation
    │   └── molecule-2d.js             # 2D SVG structures
    │       ├── SVG generation
    │       ├── Bond lines
    │       ├── Atom circles
    │       ├── Labels
    │       └── Auto-scaling
    │
    ├── reactions/                      # Reactions module
    │   ├── reactions-builder.js       # Equation builder
    │   │   ├── UI management
    │   │   ├── Reactant chips
    │   │   ├── Coefficient display
    │   │   ├── Reaction validation
    │   │   └── Database lookup
    │   ├── reactant-selector.js       # Reactant picker
    │   │   ├── Modal control
    │   │   ├── Search functionality
    │   │   ├── Item rendering
    │   │   └── Selection handling
    │   └── reaction-animator.js       # Animation engine
    │       ├── Theatre initialization
    │       ├── Molecule positioning
    │       ├── GSAP timelines
    │       ├── Collision effects
    │       ├── Particle systems
    │       ├── Product formation
    │       └── Cleanup routines
    │
    └── utils/                          # Utility modules
        ├── wiki-loader.js             # Wikipedia API
        │   ├── API requests
        │   ├── Error handling
        │   ├── Content parsing
        │   └── Link generation
        └── search-utils.js            # Search algorithms
            ├── Fuzzy matching
            ├── Score calculation
            ├── Exact match
            ├── Starts with
            ├── Contains
            ├── Subsequence
            └── Common substring
```

### Module Dependencies

```
app-init.js
    ├─> table-renderer.js
    │       ├─> elements-data.js
    │       └─> element-modal.js
    │               ├─> atom-visualization.js
    │               ├─> reactivity-chart.js (NEW)
    │               │       └─> reactivity-data.js (NEW)
    │               └─> wiki-loader.js
    │
    ├─> molecules-list.js
    │       ├─> molecules-data.js
    │       ├─> molecules-search.js
    │       │       └─> search-utils.js
    │       └─> molecule-modal.js
    │               ├─> molecule-3d.js
    │               ├─> molecule-2d.js
    │               └─> wiki-loader.js
    │
    ├─> reactions-builder.js
    │       ├─> reactions-data.js
    │       ├─> reactant-selector.js
    │       │       ├─> elements-data.js
    │       │       ├─> molecules-data.js
    │       │       └─> search-utils.js
    │       └─> reaction-animator.js
    │
    └─> page-toggle.js
```

---

## 🚀 Getting Started

### Prerequisites

**Browser Requirements:**
- Chrome 90+ / Edge 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Opera 76+

**Required Browser Features:**
- ES6+ JavaScript support
- CSS Grid & Flexbox
- WebGL (for Three.js)
- SVG support (for D3.js)
- Fetch API
- Web Animations API

**No server required** - Pure client-side application!

### Installation

#### Method 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/periodic-table-3d.git

# Navigate to project directory
cd periodic-table-3d

# Open in browser
open index.html
# OR for Windows: start index.html
# OR for Linux: xdg-open index.html
```

#### Method 2: Download ZIP

1. Download ZIP from GitHub
2. Extract files
3. Open `index.html` in a modern browser

#### Method 3: Live Server (Recommended for Development)

```bash
# If using VS Code with Live Server extension
# Right-click index.html > Open with Live Server

# OR use Python's built-in server
python -m http.server 8000
# Visit http://localhost:8000

# OR use Node.js http-server
npx http-server -p 8000
```

### Quick Start Guide

1. **Open the application** in your browser
2. **Explore the Periodic Table**:
   - Click any element to see 3D atom model
   - View electron configuration
   - See reactivity chart (NEW)
   - Read Wikipedia summary
3. **Browse Molecules**:
   - Switch to Molecules page
   - Search for compounds
   - View 3D and 2D structures
4. **Simulate Reactions**:
   - Go to Reactions page
   - Build chemical equations
   - Watch animated reactions

---

## 📚 Detailed Feature Documentation

### 1. Periodic Table Module

#### A. Table Renderer (`table-renderer.js`)

**Responsibilities:**
- Renders the 7×18 periodic table grid
- Maps 118 elements to correct positions
- Creates lanthanide (57-71) and actinide (89-103) series
- Handles category-based styling
- Mobile-responsive layout adjustments

**Key Functions:**

```javascript
// Initialize complete periodic table
initPeriodicTable()

// Find element by grid position
findElementByPosition(row, col)
    // Returns: Element object or null
    
// Create element cell HTML
createElementDiv(element)
    // Returns: HTMLElement with styling
    
// Highlight category
highlightCategory(category)
    // Highlights all elements in category
    
// Clear highlights
clearHighlights()
    // Removes all category highlights
```

**Grid Position Mapping:**

| Row | Elements | Positions |
|-----|----------|-----------|
| 1 | H, He | (1,1), (1,18) |
| 2 | Li → Ne | (2,1) → (2,18) |
| 3 | Na → Ar | (3,1) → (3,18) |
| 4-7 | K → Og | Transition metals + main group |
| Series | La-Lu, Ac-Lr | Separate rows |

**Technical Implementation:**

```javascript
// Element position data structure
elementPositions = {
    1: [1, 1],    // Hydrogen
    2: [1, 18],   // Helium
    3: [2, 1],    // Lithium
    // ... 118 elements total
}

// Element cell structure
<div class="element [category]" 
     data-number="8" 
     data-symbol="O"
     data-category="nonmetal">
    <div class="element-header">
        <span class="weight">15.9994</span>
    </div>
    <span class="symbol">O</span>
    <span class="number">8</span>
</div>
```

#### B. Atom Visualization (`atom-visualization.js`)

**Responsibilities:**
- Creates 3D atom models using Three.js
- Calculates electron shell distribution (2n² rule)
- Renders nucleus, electron orbits, and electrons
- Animates electron movement around orbits

**Key Functions:**

```javascript
// Create 3D atom model
create3DAtom(element)
    // Sets up Three.js scene
    // Renders nucleus and electron shells
    
// Calculate electron distribution
calculateElectronShells(atomicNumber)
    // Returns: [2, 8, 18, 32, ...]
    // Based on 2n² rule
    
// Create visual electron shells
createElectronShells(shells)
    // Creates ring geometries
    // Positions electrons
    
// Animation loop
animateAtom()
    // Rotates atom group
    // Moves electrons in orbits
```

**Electron Configuration:**

```javascript
// 2n² rule implementation
Shell K (n=1): 2(1)² = 2 electrons
Shell L (n=2): 2(2)² = 8 electrons
Shell M (n=3): 2(3)² = 18 electrons
Shell N (n=4): 2(4)² = 32 electrons
Shell O (n=5): 2(5)² = 32 electrons
Shell P (n=6): 2(6)² = 18 electrons (max practical)
Shell Q (n=7): 2(7)² = 8 electrons (max practical)

// Example: Oxygen (8 electrons)
K shell: 2 electrons
L shell: 6 electrons
Configuration: 1s² 2s² 2p⁴
```

**Three.js Scene Setup:**

```javascript
// Scene configuration
scene = new THREE.Scene()
scene.background = new THREE.Color(0x0d1117)

// Camera setup
camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
camera.position.z = 20

// Lighting system
ambientLight = new THREE.AmbientLight(0x404040, 0.6)
directionalLight = new THREE.DirectionalLight(0xffffff, 1)
pointLight = new THREE.PointLight(0x4444ff, 0.5)

// Nucleus material
nucleus = new THREE.MeshPhongMaterial({
    color: 0xff4444,
    emissive: 0x330000,
    shininess: 100
})
```

#### C. Reactivity Chart (`reactivity-chart.js`) ⭐ NEW

**Responsibilities:**
- Creates D3.js line charts for element reactivity
- Visualizes which elements commonly react together
- Displays reactivity levels (0-100 scale)
- Interactive hover tooltips

**Key Functions:**

```javascript
// Create reactivity chart
createReactivityChart(element)
    // Checks if data exists
    // Creates SVG with D3.js
    // Renders line, area, and points
    // Adds animations and interactivity
    
// Get reactivity data
getReactivityData(atomicNumber)
    // Returns: { partners: [{symbol, level}] }
    
// Check if data available
hasReactivityData(atomicNumber)
    // Returns: boolean
```

**Chart Features:**

```javascript
// Scales
x = d3.scaleBand()
    .domain(['H', 'C', 'O', 'N', ...])
    .range([0, width])
    .padding(0.3)

y = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0])

// Line generator with smooth curves
line = d3.line()
    .x(d => x(d.symbol) + x.bandwidth() / 2)
    .y(d => y(d.level))
    .curve(d3.curveCardinal.tension(0.5))

// Gradient definitions
linearGradient: {
    stops: [
        { offset: 0%, color: #58a6ff, opacity: 0.3 },
        { offset: 100%, color: #bc8cff, opacity: 1 }
    ]
}
```

**Animation Timeline:**

```javascript
// 1. Area fade-in (0-1000ms)
area.transition().duration(1000).style('opacity', 1)

// 2. Line drawing (0-1500ms)
path.attr('stroke-dasharray', pathLength)
    .attr('stroke-dashoffset', pathLength)
    .transition().duration(1500)
    .attr('stroke-dashoffset', 0)

// 3. Points appear (1000-2200ms)
points.transition()
    .duration(800)
    .delay((d, i) => 1000 + i * 100)
    .style('opacity', 1)
```

**Reactivity Data Structure:**

```javascript
reactivityData = {
    8: { // Oxygen
        partners: [
            {symbol: 'H', level: 98},   // Very high
            {symbol: 'C', level: 95},   // Very high
            {symbol: 'N', level: 85},   // High
            {symbol: 'S', level: 88},   // High
            {symbol: 'Fe', level: 82},  // High
            {symbol: 'Ca', level: 80},  // Moderate-high
            {symbol: 'Mg', level: 78},  // Moderate-high
            {symbol: 'Al', level: 75}   // Moderate
        ]
    }
}
```

#### D. Element Modal (`element-modal.js`)

**Responsibilities:**
- Manages element detail modal lifecycle
- Integrates 3D atom, properties, Wikipedia, and chart
- Handles open/close animations
- Mobile swipe-to-close gesture

**Modal Sections:**

1. **3D Atom Viewer**
   - Live rotating atomic model
   - Electron shells with orbital motion
   - Color-coded by shell level
   
2. **Basic Properties**
   - Atomic number
   - Atomic weight (u)
   - Element category
   
3. **Electron Configuration**
   - Shell distribution (K, L, M, N, O, P, Q)
   - Total electron count
   - Number of shells
   
4. **Reactivity Chart** ⭐ NEW
   - D3.js line graph
   - Reaction partners visualization
   - Interactive tooltips
   
5. **Wikipedia Summary**
   - Auto-fetched via REST API
   - First paragraph extract
   - Link to full article

**Event Handlers:**

```javascript
// Open modal
openElementModal(element)
    // Show modal with animation
    // Create 3D atom (150ms delay)
    // Update info panel
    // Load Wikipedia (immediate)
    // Create chart (300ms delay)
    // Add swipe gesture
    // Haptic feedback

// Close modal
closeModal()
    // Hide modal with animation
    // Cleanup Three.js resources
    // Clear chart SVG
    // Restore body scroll
    // Remove active states

// Swipe to close
addSwipeToClose(modal)
    // touchstart: Record Y position
    // touchmove: Pull down animation
    // touchend: Close if > 100px
```

---

### 2. Molecules Module

#### A. Molecules List (`molecules-list.js`)

**Responsibilities:**
- Renders molecule cards in grid layout
- Handles search filtering and sorting
- Creates molecule badges and metadata
- Loading and empty states

**Rendering Pipeline:**

```javascript
// 1. Data preparation
items = moleculesData.map(molecule => ({
    molecule: molecule,
    score: calculateMatchScore(query, molecule)
}))

// 2. Filtering
filteredItems = items.filter(item => item.score > 0)

// 3. Sorting
if (sortMode === 'az') {
    filteredItems.sort((a, b) => 
        a.molecule.name.localeCompare(b.molecule.name)
    )
} else {
    filteredItems.sort((a, b) => 
        b.score - a.score
    )
}

// 4. Rendering
filteredItems.forEach((item, index) => {
    createMoleculeCard(item.molecule, index)
})
```

**Molecule Card Structure:**

```html
<div class="molecule-item" data-aos="fade-up">
    <div class="molecule-badge">CO₂</div>
    <div class="molecule-meta">
        <div class="molecule-name">Carbon dioxide</div>
        <div class="molecule-formula">CO₂</div>
    </div>
    <i class="fas fa-chevron-right"></i>
</div>
```

#### B. Molecule 3D (`molecule-3d.js`)

**Responsibilities:**
- Creates 3D ball-and-stick molecular models
- Renders atoms as spheres with labels
- Renders bonds as cylinders
- Auto-centers molecules
- Continuous rotation animation

**Atom Color Mapping:**

```javascript
const colorMap = {
    H: 0xffffff,  // White
    C: 0x222222,  // Dark gray
    O: 0xff4444,  // Red
    N: 0x3050f8,  // Blue
    S: 0xffff66,  // Yellow
    P: 0xff8c00,  // Orange
    Cl: 0x1ff01f, // Green
    Na: 0xab5cf2, // Purple
    Fe: 0xb7410e, // Rust
    Cu: 0xd97745, // Copper
    Mg: 0x90ee90, // Light green
    Ca: 0xffa500, // Orange
    K: 0x6a5acd,  // Slate blue
    Ag: 0xc0c0c0, // Silver
    Zn: 0x7f8c8d, // Gray blue
    Al: 0xa0b0c0, // Light gray
    Si: 0xdaa520, // Goldenrod
    Br: 0xa52a2a, // Brown
    I: 0x9400d3,  // Dark violet
    F: 0x00ced1   // Cyan
}
```

**Bond Rendering:**

```javascript
// Calculate bond position and orientation
start = new THREE.Vector3(atom1.x, atom1.y, atom1.z)
end = new THREE.Vector3(atom2.x, atom2.y, atom2.z)
midpoint = start.clone().add(end).multiplyScalar(0.5)
distance = start.distanceTo(end)

// Create cylinder geometry
cylinder = new THREE.CylinderGeometry(0.08, 0.08, distance, 12)

// Orient cylinder between atoms
cylinder.position.copy(midpoint)
cylinder.lookAt(end)
cylinder.rotateX(Math.PI / 2)
```

#### C. Molecule 2D (`molecule-2d.js`)

**Responsibilities:**
- Creates 2D SVG structure diagrams
- Bonds as lines, atoms as circles
- Auto-scaling to fit container
- Element labels in circles

**SVG Generation:**

```javascript
// Calculate bounding box
minX = Math.min(...atoms.map(a => a.x))
maxX = Math.max(...atoms.map(a => a.x))
minY = Math.min(...atoms.map(a => a.y))
maxY = Math.max(...atoms.map(a => a.y))

// Scale to fit
scale = Math.min(
    (width - padding*2) / (maxX - minX),
    (height - padding*2) / (maxY - minY)
)

// Map coordinates
mapX = x => padding + (x - minX) * scale
mapY = y => (height - padding) - (y - minY) * scale

// Draw bonds
bonds.forEach(bond => {
    line = createSVGElement('line', {
        x1: mapX(atom1.x),
        y1: mapY(atom1.y),
        x2: mapX(atom2.x),
        y2: mapY(atom2.y),
        stroke: '#9aa5b2',
        'stroke-width': 3
    })
})

// Draw atoms
atoms.forEach(atom => {
    circle = createSVGElement('circle', {
        cx: mapX(atom.x),
        cy: mapY(atom.y),
        r: 18,
        fill: '#1f2937',
        stroke: '#2b3946'
    })
    
    text = createSVGElement('text', {
        x: mapX(atom.x),
        y: mapY(atom.y) + 6,
        'text-anchor': 'middle',
        fill: '#e6eef8',
        'font-weight': 700
    })
    text.textContent = atom.el
})
```

---

### 3. Chemical Reactions Module

#### A. Reactions Builder (`reactions-builder.js`)

**Responsibilities:**
- Equation builder UI management
- Reactant chip rendering with coefficients
- Reaction detection from database
- Equation display formatting

**Equation Display Logic:**

```javascript
// Before reaction
selectedReactants = ['H₂', 'O₂']
coefficients = [2, 1]  // From database

// Display: 2H₂ + O₂ → ?
equation = reactants.map((r, i) => 
    `${coefficients[i] > 1 ? coefficients[i] : ''}${r}`
).join(' + ') + ' → ?'

// After reaction
products = ['H₂O']
productCoefficients = [2]

// Display: 2H₂ + O₂ → 2H₂O
fullEquation = reactantPart + ' → ' + productPart
```

**Reaction Validation:**

```javascript
function checkReactionPossible() {
    // Sort reactants alphabetically
    sortedReactants = [...selectedReactants].sort()
    
    // Search database
    reaction = reactionsDatabase.find(r => 
        JSON.stringify(r.reactants.sort()) === 
        JSON.stringify(sortedReactants)
    )
    
    if (reaction) {
        enableReactButton(reaction.name)
    } else {
        disableReactButton()
    }
}
```

#### B. Reaction Animator (`reaction-animator.js`)

**Responsibilities:**
- 3D reaction animations using GSAP + Three.js
- Collision effects with particle explosions
- Product formation with entrance animations
- Supports multiple reactant/product molecules

**Animation Timeline:**

```javascript
// Phase 1: Reactants move to center (0-2s)
timeline.to(reactantGroup.position, {
    x: 0, y: 0, z: 0,
    duration: 2,
    ease: "power2.inOut"
})

// Phase 2: Collision + particle explosion (2-3.2s)
timeline.call(() => {
    createParticleExplosion({x: 0, y: 0, z: 0})
    scaleReactants(1.3, 0.3, 3) // Pulse effect
})

// Phase 3: Reactants fade out (3.2-3.8s)
timeline.to(reactantMaterial, {
    opacity: 0,
    duration: 0.5
})

// Phase 4: Products appear (3.8-5s)
timeline.call(() => {
    createProductsAnimated(reaction, scale)
})
```

**Molecule Positioning Algorithm:**

```javascript
function calculateProductPositions(count, scale) {
    if (count === 1) {
        return [{x: 0, y: 0}]
    }
    else if (count === 2) {
        return [
            {x: 0, y: scale * 1.2},
            {x: 0, y: -scale * 1.2}
        ]
    }
    else if (count === 3) {
        const angles = [Math.PI/2, Math.PI*7/6, Math.PI*11/6]
        return angles.map(angle => ({
            x: Math.cos(angle) * scale * 1.5,
            y: Math.sin(angle) * scale * 1.5
        }))
    }
    else {
        // Circular arrangement
        const radius = scale * 1.8
        return Array(count).fill(0).map((_, i) => {
            const angle = (i / count) * Math.PI * 2
            return {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            }
        })
    }
}
```

**Particle System:**

```javascript
function createParticleExplosion(position) {
    // Create 50 particles
    particles = []
    for (let i = 0; i < 50; i++) {
        particle = new THREE.Points(geometry, material)
        particle.position.copy(position)
        particle.velocity = {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5,
            z: (Math.random() - 0.5) * 0.5
        }
        particles.push(particle)
    }
    
    // Animate particles outward
    gsap.to(material, {
        opacity: 0,
        duration: 1.5,
        onUpdate: () => {
            particles.forEach((p, i) => {
                p.position.x += p.velocity.x
                p.position.y += p.velocity.y
                p.position.z += p.velocity.z
            })
        }
    })
}
```

---

### 4. Utility Modules

#### A. Search Algorithm (`search-utils.js`)

**Fuzzy Matching Implementation:**

```javascript
function scoreMatch(query, text) {
    query = query.toLowerCase()
    text = text.toLowerCase()
    
    // 1. Exact match (1000 points)
    if (text === query) return 1000
    
    // 2. Starts with (900 - length_diff)
    if (text.startsWith(query)) {
        return 900 - (text.length - query.length)
    }
    
    // 3. Contains (700 - length_diff)
    if (text.includes(query)) {
        return 700 - (text.length - query.length)
    }
    
    // 4. Subsequence match (300 + matched*10)
    let matched = 0
    let qi = 0, ti = 0
    while (qi < query.length && ti < text.length) {
        if (query[qi] === text[ti]) {
            matched++
            qi++
        }
        ti++
    }
    if (matched > 0) {
        return 300 + matched * 10
    }
    
    // 5. Common substring (200 + length*10)
    let maxCommon = 0
    for (let i = 0; i < text.length; i++) {
        for (let j = i + 1; j <= text.length; j++) {
            const sub = text.slice(i, j)
            if (query.includes(sub) && sub.length > maxCommon) {
                maxCommon = sub.length
            }
        }
    }
    if (maxCommon > 0) {
        return 200 + maxCommon * 10
    }
    
    return 0
}
```

**Scoring Examples:**

| Query | Text | Algorithm | Score |
|-------|------|-----------|-------|
| `water` | `water` | Exact | 1000 |
| `ox` | `oxygen` | Starts with | 896 |
| `ben` | `benzene` | Starts with | 893 |
| `car` | `carbon` | Starts with | 897 |
| `acid` | `acetic acid` | Contains | 695 |
| `h2o` | `water` | No match | 0 |

#### B. Wikipedia Loader (`wiki-loader.js`)

**API Integration:**

```javascript
function loadWikipediaInfo(title, targetElementId) {
    const endpoint = 
        `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`
    
    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            if (data.extract) {
                displaySummary(data.extract, data.content_urls)
            } else {
                displayNoInfo()
            }
        })
        .catch(error => {
            console.error('Wikipedia API error:', error)
            displayError()
        })
}
```

**Response Format:**

```json
{
  "type": "standard",
  "title": "Oxygen",
  "extract": "Oxygen is the chemical element with the symbol O...",
  "thumbnail": {
    "source": "https://upload.wikimedia.org/...",
    "width": 320,
    "height": 213
  },
  "content_urls": {
    "desktop": {
      "page": "https://en.wikipedia.org/wiki/Oxygen",
      "revisions": "...",
      "edit": "...",
      "talk": "..."
    }
  }
}
```

---

## 🎨 Styling System

### Color Palette

#### Base Colors
```css
--bg-primary:      #0d1117  /* Main background - Deep space black */
--bg-secondary:    #161b22  /* Cards & modals - Dark slate */
--bg-tertiary:     #21262d  /* Hover states - Midnight blue */
--text-primary:    #f0f6fc  /* Main text - Pure white tinted */
--text-secondary:  #8b949e  /* Secondary text - Medium gray */
--border-primary:  #30363d  /* Borders - Dark gray */
```

#### Accent Colors
```css
--accent-blue:     #58a6ff  /* Primary - Bright blue */
--accent-purple:   #bc8cff  /* Secondary - Soft purple */
--accent-green:    #7ce38b  /* Success - Fresh green */
--accent-orange:   #ffa657  /* Warning - Warm orange */
--accent-red:      #ff7b72  /* Error - Soft red */
--accent-yellow:   #f2cc60  /* Info - Golden yellow */
```

### Element Category Colors

Gradient-based styling for visual distinction:

```css
/* Non-metals - Cool blue tones */
.nonmetal {
    background: linear-gradient(135deg, #1a365d, #2a4a6b);
    border-color: #3182ce;
}
.nonmetal .symbol { color: #63b3ed; }

/* Noble gases - Purple mystique */
.noblegas {
    background: linear-gradient(135deg, #553c9a, #6b46c1);
    border-color: #8b5cf6;
}
.noblegas .symbol { color: #c4b5fd; }

/* Alkali metals - Warm orange */
.alkalimetal {
    background: linear-gradient(135deg, #c05621, #dd6b20);
    border-color: #ed8936;
}
.alkalimetal .symbol { color: #fbd38d; }

/* Alkaline earth - Teal green */
.alkearthmetal {
    background: linear-gradient(135deg, #2c7a7b, #319795);
    border-color: #38b2ac;
}
.alkearthmetal .symbol { color: #81e6d9; }

/* Transition metals - Neutral gray */
.transitionmetal {
    background: linear-gradient(135deg, #4a5568, #718096);
    border-color: #a0aec0;
}
.transitionmetal .symbol { color: #e2e8f0; }

/* Metalloids - Vibrant purple */
.metalloid {
    background: linear-gradient(135deg, #805ad5, #9f7aea);
    border-color: #b794f6;
}
.metalloid .symbol { color: #d6bcfa; }

/* Halogens - Golden yellow */
.halogen {
    background: linear-gradient(135deg, #d69e2e, #ecc94b);
    border-color: #f6e05e;
}
.halogen .symbol { color: #faf089; }

/* Post-transition - Bold red */
.post-transitionmetal {
    background: linear-gradient(135deg, #e53e3e, #f56565);
    border-color: #fc8181;
}
.post-transitionmetal .symbol { color: #fed7d7; }

/* Lanthanides - Pink-red gradient */
.lanthanide {
    background: linear-gradient(135deg, #d53f8c, #e53e3e);
    border-color: #f687b3;
}
.lanthanide .symbol { color: #fbb6ce; }

/* Actinides - Dark slate */
.actinide {
    background: linear-gradient(135deg, #2d3748, #4a5568);
    border-color: #718096;
}
.actinide .symbol { color: #cbd5e0; }

/* Unknown - Charcoal black */
.unknown {
    background: linear-gradient(135deg, #1a202c, #2d3748);
    border-color: #4a5568;
}
.unknown .symbol { color: #a0aec0; }
```

### Responsive Breakpoints

```css
/* Small Mobile Devices (≤ 480px) */
@media (max-width: 480px) {
    .element { 
        min-width: 24px;
        font-size: 0.6rem;
    }
    .header h1 { font-size: 1.75rem; }
    .periodic-table { min-width: 300px; }
}

/* Mobile Devices (≤ 768px) */
@media (max-width: 768px) {
    .element { 
        min-width: 26px;
        font-size: 0.65rem;
    }
    .periodic-table { gap: 1px; }
    .modal-body { grid-template-columns: 1fr; }
}

/* Tablet Devices (≤ 992px) */
@media (max-width: 992px) {
    .element { 
        min-width: 30px;
        font-size: 0.7rem;
    }
    .atom-viewer { height: 300px; }
}

/* Desktop (≥ 993px) */
@media (min-width: 993px) {
    .element { 
        min-width: 36px;
        font-size: 0.75rem;
    }
    .modal-body { grid-template-columns: 1fr 1fr; }
}
```

---

## 🔧 Advanced Features

### 1. Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `ESC` | Close modal | Any modal open |
| `Ctrl/Cmd + K` | Focus search | Molecules/Reactions page |
| `1` | Periodic Table | Any page |
| `2` | Molecules | Any page |
| `3` | Reactions | Any page |
| `Arrow Keys` | Navigate grid | Table focus |
| `Enter` | Open element | Element focused |
| `Space` | Toggle info | Modal open |

### 2. Mobile Gestures

**Swipe Gestures:**
- **Swipe Down**: Close modal (>100px pull)
- **Swipe Left/Right**: Switch pages (disabled)
- **Pinch Zoom**: Not supported (fixed viewport)

**Touch Events:**
- **Single Tap**: Open element/molecule
- **Long Press (500ms)**: Quick info tooltip
- **Double Tap**: Zoom (disabled)

**Haptic Feedback:**
```javascript
// On click
navigator.vibrate(10)  // Short buzz

// On success
navigator.vibrate([10, 50, 10])  // Success pattern

// On error
navigator.vibrate([50, 100, 50])  // Error pattern
```

### 3. Performance Optimizations

**Throttled Resize:**
```javascript
let resizeTimeout
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
        window.dispatchEvent(new Event('optimizedResize'))
    }, 250)
}, { passive: true })
```

**Intersection Observer:**
```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
        }
    })
}, {
    threshold: 0.1,
    rootMargin: '50px'
})
```

**Debounced Search:**
```javascript
let searchDebounce
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounce)
    searchDebounce = setTimeout(() => {
        performSearch(e.target.value)
    }, 180)  // 180ms delay
})
```

**Three.js Cleanup:**
```javascript
function cleanupThreeJS() {
    // Dispose geometries
    scene.traverse(obj => {
        if (obj.geometry) {
            obj.geometry.dispose()
        }
    })
    
    // Dispose materials
    scene.traverse(obj => {
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(m => m.dispose())
            } else {
                obj.material.dispose()
            }
        }
    })
    
    // Dispose renderer
    renderer.dispose()
    renderer = null
    
    // Clear scene
    scene = null
    camera = null
}
```

### 4. Animation System

**GSAP Timeline:**
```javascript
const timeline = gsap.timeline({
    defaults: {
        ease: "power2.inOut",
        duration: 1
    }
})

timeline.to(element, { x: 100 }, 0)        // Start at 0s
timeline.to(element, { rotation: 360 }, 0.5) // Start at 0.5s
timeline.call(callback, null, 1.5)         // Call at 1.5s
timeline.to(element, { opacity: 0 }, 2)   // Start at 2s
```

**AOS Configuration:**
```javascript
AOS.init({
    duration: 800,      // Animation duration
    once: true,         // Animate only once
    offset: 100,        // Trigger point offset
    easing: 'ease-out-cubic',
    delay: 0,
    disable: false,
    startEvent: 'DOMContentLoaded',
    disableMutationObserver: false
})
```

---

## 📊 Data Structures

### Element Object
```javascript
{
    number: 8,                    // Atomic number
    symbol: "O",                  // Chemical symbol
    name: "Oxygen",               // Full name
    weight: 15.9994,              // Atomic mass (u)
    category: "nonmetal"          // Element category
}
```

### Element Position
```javascript
elementPositions = {
    1: [1, 1],    // Hydrogen at row 1, col 1
    2: [1, 18],   // Helium at row 1, col 18
    8: [2, 16],   // Oxygen at row 2, col 16
    // ... 118 total positions
}
```

### Molecule Object
```javascript
{
    id: 'h2o',
    name: 'Water',
    formula: 'H₂O',
    wikiTitle: 'Water',
    atoms: [
        { el: 'O', x: 0, y: 0, z: 0 },
        { el: 'H', x: 0.96, y: 0.26, z: 0 },
        { el: 'H', x: -0.96, y: 0.26, z: 0 }
    ],
    bonds: [[0, 1], [0, 2]]  // Atom index pairs
}
```

### Reaction Object
```javascript
{
    reactants: ['H₂', 'O₂'],
    coefficients: [2, 1],           // 2H₂ + 1O₂
    products: ['H₂O'],
    productCoefficients: [2],       // → 2H₂O
    type: 'synthesis',
    name: 'Water Formation'
}
```

### Reactivity Data Object ⭐ NEW
```javascript
{
    8: { // Oxygen
        partners: [
            { symbol: 'H', level: 98 },   // Very high
            { symbol: 'C', level: 95 },   // Very high
            { symbol: 'N', level: 85 },   // High
            { symbol: 'S', level: 88 }    // High
        ]
    }
}
```

---

## 🧪 Chemistry Concepts

### 1. Electron Configuration (2n² Rule)

```
Shell notation: K L M N O P Q (n=1 to n=7)
Max electrons per shell: 2n²

Shell K (n=1): 2(1)² = 2 electrons
Shell L (n=2): 2(2)² = 8 electrons
Shell M (n=3): 2(3)² = 18 electrons
Shell N (n=4): 2(4)² = 32 electrons
Shell O (n=5): 2(5)² = 32 electrons (practical: 32)
Shell P (n=6): 2(6)² = 72 electrons (practical: 18)
Shell Q (n=7): 2(7)² = 98 electrons (practical: 8)
```

**Examples:**

```
Hydrogen (1 e⁻):  K¹
Helium (2 e⁻):    K²
Oxygen (8 e⁻):    K² L⁶
Sodium (11 e⁻):   K² L⁸ M¹
Iron (26 e⁻):     K² L⁸ M¹⁴ N²
```

### 2. Element Categories

**Alkali Metals (Group 1):**
- Properties: Highly reactive, soft, low density
- Configuration: ns¹ (s-block)
- Examples: Li, Na, K, Rb, Cs, Fr
- Reactivity: Increases down group

**Halogens (Group 17):**
- Properties: Highly electronegative, reactive
- Configuration: ns²np⁵ (p-block)
- Examples: F, Cl, Br, I, At
- Reactivity: Decreases down group

**Noble Gases (Group 18):**
- Properties: Unreactive, full valence shell
- Configuration: ns²np⁶ (except He: 1s²)
- Examples: He, Ne, Ar, Kr, Xe, Rn
- Reactivity: Minimal (Kr, Xe can react)

**Transition Metals (d-block):**
- Properties: Variable oxidation states
- Configuration: (n-1)d¹⁻¹⁰ ns⁰⁻²
- Examples: Fe, Cu, Ag, Au, Pt
- Reactivity: Moderate, forms complexes

### 3. Reaction Types

**1. Synthesis (Combination):**
```
A + B → AB
Example: 2H₂ + O₂ → 2H₂O
```

**2. Decomposition:**
```
AB → A + B
Example: 2H₂O → 2H₂ + O₂
```

**3. Single Displacement:**
```
A + BC → AC + B
Example: Zn + 2HCl → ZnCl₂ + H₂
```

**4. Double Displacement:**
```
AB + CD → AD + CB
Example: AgNO₃ + NaCl → AgCl + NaNO₃
```

**5. Combustion:**
```
CₓHᵧ + O₂ → CO₂ + H₂O
Example: CH₄ + 2O₂ → CO₂ + 2H₂O
```

**6. Neutralization:**
```
Acid + Base → Salt + Water
Example: HCl + NaOH → NaCl + H₂O
```

### 4. Chemical Reactivity Patterns ⭐ NEW

**Reactivity Trends:**

**Group 1 (Alkali Metals):**
- Increase down group: Cs > Rb > K > Na > Li
- Reason: Lower ionization energy

**Group 17 (Halogens):**
- Decrease down group: F > Cl > Br > I > At
- Reason: Higher electronegativity

**Oxygen:**
- Reacts with most elements
- Forms oxides (metal oxides, non-metal oxides)
- High electronegativity (3.44)

**Noble Gases:**
- Minimal reactivity (full valence)
- Kr, Xe can form compounds with F, O
- He, Ne, Ar essentially unreactive

**Visualization:**
- X-axis: Reaction partner elements
- Y-axis: Reactivity level (0-100)
- Line chart shows relative reactivity strength

---

## 🐛 Troubleshooting Guide

### Common Issues & Solutions

#### Issue 1: Three.js not rendering

**Symptoms:**
- Black screen in atom viewer
- Console errors about THREE

**Solutions:**
```javascript
// Check if Three.js loaded
console.log('THREE version:', THREE.REVISION)

// Verify WebGL support
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
if (!gl) {
    alert('WebGL not supported')
}

// Check renderer creation
if (!renderer) {
    console.error('Renderer not initialized')
}
```

#### Issue 2: D3 chart not displaying ⭐ NEW

**Symptoms:**
- Empty chart container
- No SVG elements in DOM

**Solutions:**
```javascript
// Check D3.js loaded
console.log('D3 version:', d3.version)

// Verify container exists
const container = document.getElementById('reactivityChart')
console.log('Container:', container)

// Check data availability
const data = getReactivityData(element.number)
console.log('Reactivity data:', data)

// Inspect SVG creation
const svg = d3.select('#reactivityChart').select('svg')
console.log('SVG node:', svg.node())
console.log('SVG size:', svg.attr('width'), svg.attr('height'))
```

#### Issue 3: Modal not closing

**Symptoms:**
- ESC key not working
- Click outside not closing

**Solutions:**
```javascript
// Check event listeners
document.addEventListener('keydown', (e) => {
    console.log('Key pressed:', e.key)
})

// Verify modal state
const modal = document.getElementById('elementModal')
console.log('Modal classes:', modal.className)
console.log('Modal visible:', modal.classList.contains('active'))

// Test close function
closeModal()  // Should work manually
```

#### Issue 4: Search not working

**Symptoms:**
- No results for valid queries
- Search input not responding

**Solutions:**
```javascript
// Check input element
const input = document.getElementById('moleculeSearch')
console.log('Input exists:', !!input)
console.log('Input value:', input.value)

// Test search function
const score = scoreMatch('water', 'H2O')
console.log('Match score:', score)

// Verify data loaded
console.log('Molecules count:', moleculesData.length)
```

#### Issue 5: Animations lagging

**Symptoms:**
- Choppy animations
- Low frame rate
- Browser freezing

**Solutions:**
```javascript
// Check frame rate
let lastTime = performance.now()
function checkFPS() {
    const now = performance.now()
    const fps = 1000 / (now - lastTime)
    console.log('FPS:', fps.toFixed(1))
    lastTime = now
    requestAnimationFrame(checkFPS)
}
checkFPS()

// Reduce quality settings
renderer.setPixelRatio(1)  // Instead of window.devicePixelRatio
scene.children = scene.children.slice(0, 50)  // Limit objects

// Disable AOS on slow devices
if (performance.now() > 100) {
    AOS.init({ disable: true })
}
```

---

## 📚 External Dependencies

### CDN Libraries

#### Three.js (r128)
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
```
- **Purpose**: 3D rendering (atoms, molecules, reactions)
- **Size**: ~600KB minified
- **Version Lock**: r128 (newer versions may break compatibility)
- **Features Used**: Scene, Camera, Renderer, Geometry, Material, Lighting

#### D3.js (v7.9.0) ⭐ NEW
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>
```
- **Purpose**: Data visualization (reactivity charts)
- **Size**: ~270KB minified
- **Features Used**: Scales, axes, line/area generators, transitions
- **Why D3**: Best for interactive data-driven visualizations

#### GSAP (v3.13.0)
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
```
- **Purpose**: Advanced animations (reactions, transitions)
- **Size**: ~87KB minified
- **Features Used**: Timelines, easing functions, property tweens
- **Performance**: 60fps animations, hardware accelerated

#### Bootstrap (v5.3.2)
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
```
- **Purpose**: UI components, grid system, utilities
- **Size**: ~200KB (CSS + JS)
- **Usage**: Minimal (mostly custom CSS)

#### AOS (v2.3.1)
```html
<link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
```
- **Purpose**: Scroll-triggered animations
- **Size**: ~14KB
- **Config**: `{ duration: 800, once: true, offset: 100 }`

#### Tippy.js (v6.3.7)
```html
<script src="https://unpkg.com/tippy.js@6.3.7/dist/tippy-bundle.umd.min.js"></script>
```
- **Purpose**: Tooltips with rich content
- **Size**: ~23KB
- **Theme**: Custom dark theme matching site colors

#### Font Awesome (v6.5.1)
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
```
- **Purpose**: Icons throughout the UI
- **Size**: ~75KB (webfont)
- **Icons Used**: 50+ icons (atoms, flasks, charts, etc.)

#### Google Fonts (Inter)
```html
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
```
- **Purpose**: Modern, clean typography
- **Weights**: 300, 400, 500, 600, 700, 800
- **Fallback**: -apple-system, BlinkMacSystemFont, system-ui

---

## 📈 Performance Metrics

### Load Time
- **Initial Load**: ~2.5s (3G connection)
- **Subsequent Loads**: ~1.2s (cached)
- **Bundle Size**: ~1.2MB (CDN libraries)

### Runtime Performance
- **FPS**: 60fps (3D animations)
- **Memory Usage**: ~50MB (typical session)
- **CPU Usage**: <10% (idle), ~30% (animations)

### Optimizations Applied
- ✅ Debounced search (180ms delay)
- ✅ Throttled resize (250ms delay)
- ✅ Lazy loading for charts
- ✅ Efficient Three.js disposal
- ✅ RequestAnimationFrame for smooth 60fps
- ✅ CSS containment for layout performance
- ✅ Will-change hints for animations
- ✅ Passive event listeners

---

## 🌐 Browser Compatibility

| Browser | Minimum Version | Support Level | Notes |
|---------|----------------|---------------|-------|
| Chrome | 90+ | ✅ Full support | Recommended |
| Firefox | 88+ | ✅ Full support | - |
| Safari | 14+ | ⚠️ Limited | Some CSS features |
| Edge | 90+ | ✅ Full support | Chromium-based |
| Opera | 76+ | ✅ Full support | - |
| Mobile Chrome | 90+ | ✅ Full support | Touch optimized |
| Mobile Safari | 14+ | ⚠️ Limited | Some gestures |

### Required Features
- ✅ ES6+ JavaScript (classes, arrow functions, destructuring)
- ✅ CSS Grid & Flexbox
- ✅ WebGL (for Three.js)
- ✅ SVG (for D3.js)
- ✅ Fetch API
- ✅ Web Animations API
- ✅ IntersectionObserver

---

## 🔗 Links

- **Live Demo**: [https://periodic-table-3d-module.netlify.app](https://periodic-table-3d-module.netlify.app)
- **Main Branch**: [https://periodic-table-3d-atom-molecule.netlify.app](https://periodic-table-3d-atom-molecule.netlify.app)
- **GitHub Repository**: [Link to repository]
- **Documentation**: This README
- **Issue Tracker**: GitHub Issues
- **Discussions**: GitHub Discussions

---

## 📝 Changelog

### Version 2.1.0 (Current) - Reactivity Charts Update ⭐
**Release Date**: October 2025

**New Features:**
- ✅ Added D3.js reactivity charts for elements
- ✅ Created reactivity-data.js with 30+ elements
- ✅ Implemented smooth line graph animations
- ✅ Added hover tooltips on chart points
- ✅ Gradient fills under curves
- ✅ Responsive SVG scaling
- ✅ Empty states for noble gases

**Improvements:**
- ✅ Updated README with comprehensive documentation
- ✅ Enhanced element modal with chart integration
- ✅ Improved mobile responsiveness for charts
- ✅ Added keyboard navigation support

**Technical:**
- ✅ New files: reactivity-data.js, reactivity-chart.js
- ✅ Updated: element-modal.js, index.html, styles.css
- ✅ Library added: D3.js v7.9.0
- ✅ Total new lines: ~600

### Version 1.5.0 - Chemical Reactions Theatre
**Release Date**: September 2025

**Features:**
- ✅ Added reactions page with equation builder
- ✅ Implemented 30+ chemical reactions
- ✅ Created 3D animation engine with GSAP
- ✅ Added particle explosion effects
- ✅ Proper coefficient balancing

### Version 1.0.0 - Initial Release
**Release Date**: August 2025

**Features:**
- ✅ 118 elements periodic table
- ✅ 100+ molecules explorer
- ✅ 3D atom visualization
- ✅ Wikipedia integration
- ✅ Mobile responsive design

---

## 🎯 Future Roadmap

### Phase 1: Enhanced Data (Q1 2026)
- [ ] Add reactivity data for all 118 elements
- [ ] Include ionization energy trends
- [ ] Add electronegativity values
- [ ] Implement atomic radius visualization
- [ ] Add melting/boiling point graphs

### Phase 2: Interactive Experiments (Q2 2026)
- [ ] Virtual lab with equipment (beakers, burners)
- [ ] pH indicator simulations
- [ ] Titration calculator
- [ ] Reaction stoichiometry solver
- [ ] Concentration calculator

### Phase 3: Educational Tools (Q3 2026)
- [ ] Quiz mode with scoring system
- [ ] Flashcards for element properties
- [ ] Compound name generator
- [ ] Orbital diagram builder
- [ ] Lewis structure drawer

### Phase 4: Advanced Visualizations (Q4 2026)
- [ ] Orbital shapes (s, p, d, f) in 3D
- [ ] Crystal lattice structures
- [ ] Phase transition animations
- [ ] Spectroscopy simulator
- [ ] Molecular orbital diagrams

### Phase 5: Collaboration Features (2027)
- [ ] User accounts and profiles
- [ ] Saved experiments/favorites
- [ ] Share reactions via URL
- [ ] Community reaction database
- [ ] Educational lesson plans

---

## 🤝 Contributing

### Development Setup

```bash
# 1. Fork repository
git clone https://github.com/yourusername/periodic-table-3d.git

# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Make changes and test thoroughly
# - Test on multiple browsers
# - Test on mobile devices
# - Check console for errors
# - Verify accessibility

# 4. Commit with descriptive message
git commit -m "Add amazing feature with detailed description"

# 5. Push to branch
git push origin feature/amazing-feature

# 6. Open Pull Request with:
# - Clear description of changes
# - Screenshots/GIFs of new features
# - Test results on multiple browsers
# - Link to related issue (if any)
```

### Code Style Guidelines

**JavaScript:**
```javascript
// Use const for immutable, let for mutable
const PI = 3.14159
let counter = 0

// Camelcase for functions
function createReactivityChart() {}

// Pascal case for classes
class ElementModal {}

// JSDoc comments for all functions
/**
 * Creates a 3D atom model
 * @param {Object} element - Element data
 * @returns {THREE.Group} Atom group
 */
function create3DAtom(element) {}
```

**CSS:**
```css
/* BEM-like naming */
.molecule-item__badge {}

/* CSS custom properties for colors */
.element {
    background: var(--accent-blue);
}

/* Mobile-first media queries */
@media (min-width: 768px) {}

/* Alphabetically ordered properties */
.element {
    background: ...;
    border: ...;
    color: ...;
    display: ...;
}
```

**File Organization:**
- One module per file
- Group related functions together
- Export only what's needed
- Comprehensive comments
- Clear separation of concerns

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on mobile
- [ ] No console errors

## Screenshots
[Add screenshots here]

## Related Issues
Closes #[issue number]
```

---

## 📜 License

MIT License - Free to use for educational and commercial purposes

```
Copyright (c) 2025 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Author & Credits

### Created By
**[Your Name]**
- 🌐 Website: [your-website.com]
- 📧 Email: your.email@example.com
- 🐦 Twitter: [@yourusername]
- 💼 LinkedIn: [Your Name]

### Built With ❤️ Using:
- **Vanilla JavaScript** (ES6+)
- **Three.js** for 3D graphics
- **D3.js** for data visualization ⭐
- **GSAP** for animations
- **Modern CSS** (Grid, Flexbox, Custom Properties)
- **Bootstrap** for UI components
- **AOS** for scroll animations
- **Tippy.js** for tooltips

### Acknowledgments
- **Three.js Team** - For amazing 3D library
- **D3.js Team** - For powerful data visualization
- **GreenSock (GSAP)** - For smooth animations
- **Wikipedia** - For free educational content
- **Chemistry Community** - For accurate data
- **Open Source Contributors** - For inspiration
- **GitHub** - For hosting and collaboration
- **Netlify** - For deployment and CDN

---

## 📞 Support & Community

### Found a Bug?
Open an issue with:
- Browser + version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console errors

### Have a Feature Request?
Create a discussion with:
- Use case description
- Mockups/examples if possible
- Expected behavior
- Why this would be useful

### Need Help?
- 📖 Read this README thoroughly
- 🔍 Search existing issues
- 💬 Ask in Discussions
- 📧 Email for complex questions

### Stay Updated
- ⭐ Star this repository
- 👀 Watch for updates
- 🔔 Enable notifications
- 📰 Follow on social media

---

## 🎓 Learning Resources

### Chemistry
- [IUPAC Periodic Table](https://iupac.org/what-we-do/periodic-table-of-elements/)
- [Khan Academy Chemistry](https://www.khanacademy.org/science/chemistry)
- [ChemSpider Database](http://www.chemspider.com/)
- [PubChem](https://pubchem.ncbi.nlm.nih.gov/)

### Web Development
- [Three.js Documentation](https://threejs.org/docs/)
- [D3.js Gallery](https://observablehq.com/@d3/gallery)
- [GSAP Documentation](https://greensock.com/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS-Tricks](https://css-tricks.com/)

### JavaScript
- [JavaScript.info](https://javascript.info/)
- [Eloquent JavaScript](https://eloquentjavascript.net/)
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS)

---

## 🏆 Achievements

### Project Milestones
- ✅ 118 Elements rendered
- ✅ 100+ Molecules visualized
- ✅ 30+ Reactions animated
- ✅ 30+ Elements with reactivity data ⭐
- ✅ 8000+ Lines of code
- ✅ 25+ JavaScript files
- ✅ 50+ Features implemented
- ✅ 5+ External libraries integrated
- ✅ 100% Client-side (no backend needed)
- ✅ Mobile responsive design

### Community
- ⭐ Stars on GitHub: [Count]
- 👥 Contributors: [Count]
- 🍴 Forks: [Count]
- 👁️ Watchers: [Count]
- 🐛 Issues resolved: [Count]

---

## 📊 Statistics

### Project Stats
```
Total Files:        25+
Total Lines:        8000+
JavaScript:         5000+ lines
CSS:               1800+ lines
HTML:              500+ lines
Comments:          1500+ lines
Functions:         150+
Modules:           15+
Dependencies:      7
Version:           2.1.0
```

### Code Quality
- ✅ No global variables pollution
- ✅ Modular architecture
- ✅ Comprehensive comments
- ✅ Error handling
- ✅ Memory leak prevention
- ✅ Performance optimized
- ✅ Accessibility compliant

---

## ⚠️ Known Limitations

1. **Browser Storage**: No localStorage/sessionStorage used (by design)
2. **Offline Mode**: Requires internet for CDN libraries and Wikipedia
3. **Large Molecules**: Performance may degrade with 100+ atoms
4. **Safari**: Some CSS features have limited support
5. **Mobile Safari**: Certain touch gestures may conflict
6. **Reactivity Data**: Only 30 elements have data (more coming)

---

## 🔮 Technology Stack Summary

```
Frontend:
├── HTML5 (Semantic markup)
├── CSS3 (Grid, Flexbox, Custom Properties)
└── JavaScript ES6+ (Modules, Classes, Async/Await)

3D Rendering:
└── Three.js r128 (WebGL)

Data Visualization:
└── D3.js v7.9.0 (SVG) ⭐ NEW

Animations:
├── GSAP v3.13.0 (Timeline)
└── AOS v2.3.1 (Scroll)

UI Framework:
├── Bootstrap v5.3.2 (Grid, Utils)
└── Font Awesome v6.5.1 (Icons)

Utilities:
├── Tippy.js v6.3.7 (Tooltips)
└── Google Fonts (Inter)

APIs:
└── Wikipedia REST API v1

Total Bundle:
└── ~1.2MB (CDN libraries)
```

---


*Last Updated: October 2025*  
*Version: 2.1.0*  
*Maintained by: [RAFSAN]*  
*License: MIT*

---

**Made with ❤️ and ⚛️ for chemistry education**
