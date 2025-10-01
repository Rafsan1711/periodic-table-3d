# Interactive Periodic Table & Molecules Visualization

একটি সম্পূর্ণ ইন্টারেক্টিভ পিরিয়ডিক টেবিল এবং মলিকিউল ভিজুয়ালাইজেশন অ্যাপ্লিকেশন যা Three.js ব্যবহার করে 3D ভিজুয়ালাইজেশন প্রদান করে।

## 📁 File Structure

```
project/
├── index.html                          # Main HTML file
├── css/
│   └── styles.css                      # All CSS styles
├── js/
│   ├── data/
│   │   ├── elements-data.js           # 118 elements with positions
│   │   └── molecules-data.js          # 100+ molecules (first 10 included)
│   ├── core/
│   │   ├── app-init.js                # Application initialization
│   │   └── page-toggle.js             # Page switching logic
│   ├── periodic-table/
│   │   ├── table-renderer.js          # Renders periodic table grid
│   │   ├── element-modal.js           # Element detail modal
│   │   └── atom-visualization.js      # 3D atom rendering
│   ├── molecules/
│   │   ├── molecules-list.js          # Molecule list rendering
│   │   ├── molecules-search.js        # Search functionality
│   │   ├── molecule-modal.js          # Molecule detail modal
│   │   ├── molecule-3d.js             # 3D molecule visualization
│   │   └── molecule-2d.js             # 2D SVG molecule drawing
│   └── utils/
│       ├── wiki-loader.js             # Wikipedia API integration
│       └── search-utils.js            # Search scoring algorithm
└── README.md                           # This file
```

## 📄 File Details

### HTML
- **index.html**: Main entry point containing the page structure, modal templates, and script loading order.

### CSS
- **styles.css**: Complete styling including:
  - Dark theme with gradient colors
  - Periodic table layout (grid-based)
  - Element category colors
  - Modal styles
  - Molecules page layout
  - Toggle switch
  - Responsive design
  - Animations

### Data Files

#### js/data/elements-data.js
- **elementsData**: Array of 118 elements
  - Properties: number, symbol, name, weight, category
- **elementPositions**: Grid position mapping (row, column)

#### js/data/molecules-data.js
- **moleculesData**: Array of molecules (প্রথম ১০টি included, বাকি ১০০+ আপনার মূল কোড থেকে paste করুন)
  - Properties: id, name, formula, wikiTitle, atoms, bonds
  - atoms: 3D coordinates (x, y, z) and element symbol
  - bonds: Array of atom index pairs

### Core Modules

#### js/core/app-init.js
**Purpose**: Application entry point
- Initializes periodic table
- Initializes molecules features
- Initializes page toggle
- Runs on DOMContentLoaded

#### js/core/page-toggle.js
**Purpose**: Page switching between Periodic Table and Molecules
- Functions:
  - `initPageToggle()`: Sets up toggle event listeners

### Periodic Table Modules

#### js/periodic-table/table-renderer.js
**Purpose**: Renders the periodic table grid
- Functions:
  - `initPeriodicTable()`: Creates 7×18 grid + series
  - `findElementByPosition(row, col)`: Finds element by position
  - `createElementDiv(element)`: Creates element cell HTML

#### js/periodic-table/atom-visualization.js
**Purpose**: 3D atom visualization using Three.js
- Functions:
  - `create3DAtom(element)`: Creates 3D atom model
  - `calculateElectronShells(atomicNumber)`: 2n² rule calculation
  - `createElectronShells(shells)`: Creates visual shells
  - `animateAtom()`: Animation loop
- Variables:
  - `currentAtom`, `scene`, `camera`, `renderer`

#### js/periodic-table/element-modal.js
**Purpose**: Element detail modal management
- Functions:
  - `openElementModal(element)`: Opens modal with details
  - `closeModal()`: Closes modal and cleans up Three.js
  - `updateAtomInfo(element)`: Updates info panel
  - `formatCategory(category)`: Formats category names
- Event listeners: ESC key, outside click, window resize

### Molecules Modules

#### js/molecules/molecules-list.js
**Purpose**: Renders molecule list
- Functions:
  - `renderMoleculesList(query)`: Renders filtered/sorted list
- Uses: `scoreMatch()` from search-utils.js

#### js/molecules/molecules-search.js
**Purpose**: Search and filter functionality
- Functions:
  - `initMoleculesSearch()`: Sets up search input and sort buttons
- Variables:
  - `currentSortMode`: 'az' or 'score'
  - `searchDebounce`: Debounce timer

#### js/molecules/molecule-modal.js
**Purpose**: Molecule detail modal
- Functions:
  - `openMatterModal(molecule)`: Opens modal with molecule
  - `closeMatterModal()`: Closes modal and cleanup
- Event listeners: Close button, ESC key, outside click

#### js/molecules/molecule-3d.js
**Purpose**: 3D molecule visualization
- Functions:
  - `create3DMolecule(molecule)`: Creates 3D molecular model
  - Renders atoms as spheres with labels
  - Renders bonds as cylinders
- Variables:
  - `matterScene`, `matterCamera`, `matterRenderer`, `matterGroup`
- Features:
  - Color-coded atoms
  - Element labels (canvas texture)
  - Automatic centering
  - Rotation animation

#### js/molecules/molecule-2d.js
**Purpose**: 2D SVG structure drawing
- Functions:
  - `draw2DMolecule(molecule)`: Creates SVG representation
- Features:
  - Bonds as lines
  - Atoms as circles with labels
  - Auto-scaling to fit container

### Utility Modules

#### js/utils/wiki-loader.js
**Purpose**: Wikipedia API integration
- Functions:
  - `loadWikipediaInfo(title, targetElementId)`: Generic loader
  - `loadMatterWiki(wikiTitle)`: Loads for molecules
- API: Wikipedia REST API v1

#### js/utils/search-utils.js
**Purpose**: Intelligent search scoring
- Functions:
  - `scoreMatch(query, text)`: Returns match score
- Algorithm:
  1. Exact match (1000 points)
  2. Starts with (900 points)
  3. Contains (700 points)
  4. Subsequence match (300+ points)
  5. Common substring (200+ points)

## 🚀 Usage

1. সব ফাইল সঠিক folder structure অনুযায়ী রাখুন
2. `js/data/molecules-data.js` ফাইলে আপনার মূল কোড থেকে বাকি molecules গুলো paste করুন (প্রথম ১০টার পরে)
3. `index.html` ব্রাউজারে খুলুন
4. কোন server প্রয়োজন নেই (static files)

## 🔧 Dependencies

- **Three.js r128**: 3D rendering (CDN)
- **Wikipedia REST API**: Dynamic content
- **Google Fonts**: Inter font family

## ⚙️ Features

### Periodic Table Page
- ✅ 118 elements with proper grid layout
- ✅ Color-coded by category (11 categories)
- ✅ Lanthanide and Actinide series
- ✅ Click element to view details
- ✅ 3D atom visualization with electron shells
- ✅ Electron configuration (2n² rule)
- ✅ Wikipedia integration
- ✅ Hover effects and animations

### Molecules Page
- ✅ 100+ molecules (10 provided, add rest)
- ✅ Intelligent search with fuzzy matching
- ✅ Sort by A-Z or Best Match
- ✅ 3D molecular structure with bonds
- ✅ 2D SVG structure diagram
- ✅ Color-coded atoms
- ✅ Wikipedia integration
- ✅ Debounced search (180ms)

### Toggle Feature
- ✅ Smooth switch between pages
- ✅ Animated toggle switch
- ✅ Label opacity changes

## 🎨 Design

- **Theme**: Dark mode with GitHub-inspired colors
- **Typography**: Inter font family
- **Colors**: 
  - Gradients for headers
  - Category-specific element colors
  - Accent colors for interactions
- **Animations**: 
  - Hover effects
  - Pulse animation for active elements
  - Rotation for 3D models
- **Responsive**: Mobile-friendly breakpoints

## 📝 How to Add More Molecules

`js/data/molecules-data.js` ফাইলে:

```javascript
// TODO এর পরে আপনার মূল কোড থেকে এভাবে যোগ করুন:
{
  id: 'propene',
  name: 'Propene',
  formula: 'C₃H₆',
  wikiTitle: 'Propene',
  atoms: [
    {el:'C', x:-1.1, y:0, z:0},
    {el:'C', x:0, y:0, z:0},
    {el:'C', x:1.2, y:0, z:0},
    // ... rest of atoms
  ],
  bonds: [[0,1], [1,2], ...] // atom index pairs
},
// ... বাকি সব molecules
```

## 🔍 Search Algorithm

Search scoring হয় এভাবে:
1. **Exact match**: 1000 points
2. **Starts with**: 900 - length_difference
3. **Contains**: 700 - length_difference  
4. **Subsequence**: 300 + (matched_chars × 10)
5. **Fuzzy substring**: 200 + (common_length × 10)

## 🧪 Element Categories

1. Non Metals (নীল)
2. Noble Gases (বেগুনি)
3. Alkali Metals (কমলা)
4. Alkaline Earth Metals (সবুজ-নীল)
5. Transition Metals (ধূসর)
6. Metalloids (বেগুনি-গোলাপি)
7. Halogens (হলুদ)
8. Post-Transition Metals (লাল)
9. Lanthanides (গোলাপি-লাল)
10. Actinides (গাঢ় ধূসর)
11. Unknown (কালো-ধূসর)

## 🐛 Troubleshooting

**Three.js not loading?**
- Check CDN connection
- Verify script tag in index.html

**Molecules not showing?**
- Ensure molecules-data.js is complete
- Check browser console for errors

**Wikipedia not loading?**
- Check internet connection
- CORS may be blocked (use local server)

**Modal not closing?**
- ESC key or click outside
- Check JavaScript console

## 📚 Learning Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Wikipedia API](https://en.wikipedia.org/api/rest_v1/)
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [SVG Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial)

## 🤝 Contributing

এই project-এ আরও features যোগ করতে পারেন:
- আরও molecules যোগ করুন
- নতুন visualization modes
- Element properties data
- Export functionality
- Comparison tools

## 📄 License

Free to use for educational purposes.

## 👨‍💻 Author

Created with ❤️ using vanilla JavaScript and Three.js

---

##branch links

- [mainl](https://periodic-table-3d-atom-molecule.netlify.app)

  - [modulel](https://periodic-table-3d-module.netlify.app)
    
