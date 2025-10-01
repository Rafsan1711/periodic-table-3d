/**
 * Molecule 2D Drawing Module
 * Creates 2D SVG representations of molecular structures
 */

/**
 * Draws a 2D structure of a molecule using SVG
 * @param {Object} molecule - Molecule data with atoms and bonds
 */
function draw2DMolecule(molecule) {
    const el = document.getElementById('matter2D');
    if (!el) return;
    
    el.innerHTML = '';
    const atoms = molecule.atoms;
    
    // Calculate bounding box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    atoms.forEach(a => {
        minX = Math.min(minX, a.x || 0); 
        maxX = Math.max(maxX, a.x || 0);
        minY = Math.min(minY, a.y || 0); 
        maxY = Math.max(maxY, a.y || 0);
    });
    
    if (minX === Infinity) { 
        el.innerHTML = ''; 
        return; 
    }
    
    const padding = 30;
    const W = el.clientWidth || 800;
    const H = el.clientHeight || 200;
    const scaleX = (W - padding * 2) / (maxX - minX || 1);
    const scaleY = (H - padding * 2) / (maxY - minY || 1);
    const scale = Math.min(scaleX, scaleY);

    // Map coordinates to canvas
    function mapX(x) { 
        return padding + ((x || 0) - minX) * scale; 
    }
    function mapY(y) { 
        return (H - padding) - ((y || 0) - minY) * scale; 
    }

    // Create SVG
    const svgns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgns, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.style.display = 'block';

    // Draw bonds first
    molecule.bonds.forEach(b => {
        const a1 = molecule.atoms[b[0]];
        const a2 = molecule.atoms[b[1]];
        if (!a1 || !a2) return;
        
        const line = document.createElementNS(svgns, 'line');
        line.setAttribute('x1', mapX(a1.x));
        line.setAttribute('y1', mapY(a1.y));
        line.setAttribute('x2', mapX(a2.x));
        line.setAttribute('y2', mapY(a2.y));
        line.setAttribute('stroke', '#9aa5b2');
        line.setAttribute('stroke-width', '3');
        svg.appendChild(line);
    });

    // Draw atoms
    atoms.forEach(a => {
        const cx = mapX(a.x), cy = mapY(a.y);
        const g = document.createElementNS(svgns, 'g');

        // Circle background
        const circ = document.createElementNS(svgns, 'circle');
        circ.setAttribute('cx', cx); 
        circ.setAttribute('cy', cy); 
        circ.setAttribute('r', 18);
        circ.setAttribute('fill', '#1f2937');
        circ.setAttribute('stroke', '#2b3946'); 
        circ.setAttribute('stroke-width', '1');
        g.appendChild(circ);

        // Element label
        const txt = document.createElementNS(svgns, 'text');
        txt.setAttribute('x', cx);
        txt.setAttribute('y', cy + 6);
        txt.setAttribute('font-size', '14');
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('fill', '#e6eef8');
        txt.setAttribute('font-weight', '700');
        txt.textContent = a.el;
        g.appendChild(txt);

        svg.appendChild(g);
    });

    el.appendChild(svg);
}
