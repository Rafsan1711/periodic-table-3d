/**
 * Reactivity Chart Module
 * Creates beautiful D3.js line charts showing element reactivity patterns
 */

/**
 * Create reactivity chart for an element
 * @param {Object} element - Element data
 */
function createReactivityChart(element) {
    const container = document.getElementById('reactivityChart');
    if (!container) return;
    
    // Clear previous chart
    container.innerHTML = '';
    
    // Check if element has reactivity data
    if (!hasReactivityData(element.number)) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-flask" style="font-size: 3rem; opacity: 0.3; margin-bottom: 16px;"></i>
                <p style="font-size: 1.1rem; margin: 0;">No reactivity data available</p>
                <p style="font-size: 0.9rem; margin-top: 8px; opacity: 0.7;">
                    ${element.category === 'noblegas' ? 'Noble gases are mostly unreactive' : 'Data will be added soon'}
                </p>
            </div>
        `;
        return;
    }
    
    const data = getReactivityData(element.number);
    if (!data.partners || data.partners.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary)">No reaction partners data</div>';
        return;
    }
    
    // Chart dimensions
    const margin = { top: 30, right: 30, bottom: 60, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select('#reactivityChart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .style('background', 'transparent')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleBand()
        .domain(data.partners.map(d => d.symbol))
        .range([0, width])
        .padding(0.3);
    
    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);
    
    // Add gradient for line
    const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', `line-gradient-${element.number}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0)
        .attr('y1', y(0))
        .attr('x2', 0)
        .attr('y2', y(100));
    
    gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#58a6ff')
        .attr('stop-opacity', 0.3);
    
    gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#bc8cff')
        .attr('stop-opacity', 1);
    
    // Add area gradient
    const areaGradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', `area-gradient-${element.number}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0)
        .attr('y1', y(0))
        .attr('x2', 0)
        .attr('y2', y(100));
    
    areaGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#58a6ff')
        .attr('stop-opacity', 0.05);
    
    areaGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#bc8cff')
        .attr('stop-opacity', 0.3);
    
    // Grid lines (horizontal)
    svg.append('g')
        .attr('class', 'grid')
        .selectAll('line')
        .data(y.ticks(5))
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', d => y(d))
        .attr('y2', d => y(d))
        .attr('stroke', 'rgba(255, 255, 255, 0.05)')
        .attr('stroke-dasharray', '3,3');
    
    // X Axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .style('color', '#8b949e')
        .style('font-size', '13px')
        .style('font-weight', '600')
        .selectAll('text')
        .style('fill', '#f0f6fc')
        .style('font-size', '14px')
        .style('font-weight', '700');
    
    // Y Axis (hidden, just for structure)
    svg.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(() => ''))
        .style('color', '#8b949e')
        .selectAll('line')
        .style('opacity', 0.3);
    
    // Y Axis Label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -50)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .style('fill', '#8b949e')
        .style('font-size', '12px')
        .style('font-weight', '600')
        .text('Reactivity Level');
    
    // X Axis Label
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 45)
        .attr('text-anchor', 'middle')
        .style('fill', '#8b949e')
        .style('font-size', '12px')
        .style('font-weight', '600')
        .text('Reaction Partners');
    
    // Line generator
    const line = d3.line()
        .x((d, i) => x(d.symbol) + x.bandwidth() / 2)
        .y(d => y(d.level))
        .curve(d3.curveCardinal.tension(0.5));
    
    // Area generator
    const area = d3.area()
        .x((d, i) => x(d.symbol) + x.bandwidth() / 2)
        .y0(height)
        .y1(d => y(d.level))
        .curve(d3.curveCardinal.tension(0.5));
    
    // Add area with animation
    const areaPath = svg.append('path')
        .datum(data.partners)
        .attr('fill', `url(#area-gradient-${element.number})`)
        .attr('d', area)
        .style('opacity', 0);
    
    areaPath.transition()
        .duration(1000)
        .style('opacity', 1);
    
    // Add line with animation
    const path = svg.append('path')
        .datum(data.partners)
        .attr('fill', 'none')
        .attr('stroke', `url(#line-gradient-${element.number})`)
        .attr('stroke-width', 3)
        .attr('d', line)
        .style('filter', 'drop-shadow(0 0 8px rgba(88, 166, 255, 0.5))');
    
    const pathLength = path.node().getTotalLength();
    
    path.attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .transition()
        .duration(1500)
        .ease(d3.easeQuadInOut)
        .attr('stroke-dashoffset', 0);
    
    // Add data points with animation
    const points = svg.selectAll('.dot')
        .data(data.partners)
        .enter()
        .append('g')
        .attr('class', 'dot-group')
        .style('opacity', 0);
    
    // Outer glow circle
    points.append('circle')
        .attr('cx', (d, i) => x(d.symbol) + x.bandwidth() / 2)
        .attr('cy', d => y(d.level))
        .attr('r', 8)
        .attr('fill', 'rgba(88, 166, 255, 0.2)')
        .attr('stroke', 'none');
    
    // Main dot
    points.append('circle')
        .attr('cx', (d, i) => x(d.symbol) + x.bandwidth() / 2)
        .attr('cy', d => y(d.level))
        .attr('r', 5)
        .attr('fill', '#58a6ff')
        .attr('stroke', '#0d1117')
        .attr('stroke-width', 2)
        .style('filter', 'drop-shadow(0 0 6px rgba(88, 166, 255, 0.8))');
    
    // Animate points
    points.transition()
        .duration(800)
        .delay((d, i) => 1000 + i * 100)
        .style('opacity', 1);
    
    // Add interactivity
    points.on('mouseenter', function(event, d) {
        d3.select(this).select('circle:nth-child(2)')
            .transition()
            .duration(200)
            .attr('r', 7)
            .style('filter', 'drop-shadow(0 0 12px rgba(88, 166, 255, 1))');
        
        // Show tooltip
        const tooltip = svg.append('g')
            .attr('class', 'chart-tooltip')
            .attr('transform', `translate(${x(d.symbol) + x.bandwidth() / 2}, ${y(d.level) - 20})`);
        
        const tooltipBg = tooltip.append('rect')
            .attr('x', -30)
            .attr('y', -25)
            .attr('width', 60)
            .attr('height', 25)
            .attr('rx', 6)
            .attr('fill', '#21262d')
            .attr('stroke', '#58a6ff')
            .attr('stroke-width', 1.5)
            .style('filter', 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))');
        
        tooltip.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', -8)
            .style('fill', '#f0f6fc')
            .style('font-size', '13px')
            .style('font-weight', '700')
            .text(`${d.symbol}`);
        
        tooltip.transition()
            .duration(200)
            .style('opacity', 1);
    })
    .on('mouseleave', function(event, d) {
        d3.select(this).select('circle:nth-child(2)')
            .transition()
            .duration(200)
            .attr('r', 5)
            .style('filter', 'drop-shadow(0 0 6px rgba(88, 166, 255, 0.8))');
        
        svg.selectAll('.chart-tooltip').remove();
    });
    
    // Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('fill', '#58a6ff')
        .style('font-size', '14px')
        .style('font-weight', '700')
        .style('opacity', 0)
        .text(`${element.name} Reactivity Pattern`)
        .transition()
        .duration(800)
        .style('opacity', 1);
}

/**
 * Update chart on window resize
 */
function updateReactivityChart(element) {
    createReactivityChart(element);
}

console.log('✅ Reactivity chart module loaded');
