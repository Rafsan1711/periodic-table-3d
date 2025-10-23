/**
 * Three.js Cache System (FIXED)
 * Must load AFTER Three.js
 */

// Check if Three.js is loaded
if (typeof THREE === 'undefined') {
    console.error('❌ Three.js not loaded! Load threejs-cache.js AFTER Three.js');
}

// Global caches
const geometryCache = new Map();
const materialCache = new Map();
const textureCache = new Map();

/**
 * Get or create sphere geometry (cached)
 */
function getCachedSphereGeometry(radius, widthSegments, heightSegments) {
    widthSegments = widthSegments || 24;
    heightSegments = heightSegments || 24;
    
    const key = `sphere_${radius.toFixed(3)}_${widthSegments}_${heightSegments}`;
    
    if (!geometryCache.has(key)) {
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        geometryCache.set(key, geometry);
        console.log(`📦 Created geometry: ${key}`);
    }
    
    return geometryCache.get(key);
}

/**
 * Get or create cylinder geometry (cached)
 */
function getCachedCylinderGeometry(radiusTop, radiusBottom, height, radialSegments) {
    radialSegments = radialSegments || 12;
    
    const key = `cylinder_${radiusTop.toFixed(3)}_${radiusBottom.toFixed(3)}_${height.toFixed(3)}_${radialSegments}`;
    
    if (!geometryCache.has(key)) {
        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
        geometryCache.set(key, geometry);
        console.log(`📦 Created geometry: ${key}`);
    }
    
    return geometryCache.get(key);
}

/**
 * Get or create ring geometry (cached)
 */
function getCachedRingGeometry(innerRadius, outerRadius, thetaSegments) {
    thetaSegments = thetaSegments || 64;
    
    const key = `ring_${innerRadius.toFixed(3)}_${outerRadius.toFixed(3)}_${thetaSegments}`;
    
    if (!geometryCache.has(key)) {
        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
        geometryCache.set(key, geometry);
        console.log(`📦 Created geometry: ${key}`);
    }
    
    return geometryCache.get(key);
}

/**
 * Get or create material (cached)
 */
function getCachedMaterial(type, options) {
    // Create simple key
    const key = `${type}_${options.color}_${options.emissive || 0}_${options.shininess || 0}`;
    
    if (!materialCache.has(key)) {
        let material;
        
        switch(type) {
            case 'phong':
                material = new THREE.MeshPhongMaterial(options);
                break;
            case 'basic':
                material = new THREE.MeshBasicMaterial(options);
                break;
            case 'standard':
                material = new THREE.MeshStandardMaterial(options);
                break;
            default:
                material = new THREE.MeshPhongMaterial(options);
        }
        
        materialCache.set(key, material);
        console.log(`🎨 Created material: ${type}`);
    }
    
    return materialCache.get(key);
}

/**
 * Get or create text texture (cached)
 */
function getCachedTextTexture(text, options) {
    options = options || {};
    
    const width = options.width || 128;
    const height = options.height || 128;
    const fontSize = options.fontSize || 64;
    const fontFamily = options.fontFamily || 'sans-serif';
    const fontWeight = options.fontWeight || 'bold';
    const color = options.color || 'rgba(255,255,255,0.95)';
    
    const key = `text_${text}_${fontSize}_${fontFamily}_${color}`;
    
    if (!textureCache.has(key)) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = color;
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        textureCache.set(key, texture);
        console.log(`🔤 Created texture: ${text}`);
    }
    
    return textureCache.get(key);
}

/**
 * Get cache statistics
 */
function getCacheStats() {
    const stats = {
        geometries: geometryCache.size,
        materials: materialCache.size,
        textures: textureCache.size,
        totalMemoryEstimate: estimateCacheMemory()
    };
    
    console.log('📊 Cache Stats:', stats);
    return stats;
}

/**
 * Estimate cache memory usage
 */
function estimateCacheMemory() {
    let estimate = 0;
    estimate += geometryCache.size * 10; // ~10KB each
    estimate += materialCache.size * 1;  // ~1KB each
    estimate += textureCache.size * 16;  // ~16KB each
    return `${estimate.toFixed(0)} KB`;
}

/**
 * Clear cache
 */
function clearThreeJSCache(type) {
    type = type || 'all';
    
    console.log(`🧹 Clearing ${type} cache...`);
    
    switch(type) {
        case 'geometries':
            geometryCache.forEach(geo => geo.dispose());
            geometryCache.clear();
            break;
            
        case 'materials':
            materialCache.forEach(mat => mat.dispose());
            materialCache.clear();
            break;
            
        case 'textures':
            textureCache.forEach(tex => tex.dispose());
            textureCache.clear();
            break;
            
        case 'all':
            geometryCache.forEach(geo => geo.dispose());
            materialCache.forEach(mat => mat.dispose());
            textureCache.forEach(tex => tex.dispose());
            geometryCache.clear();
            materialCache.clear();
            textureCache.clear();
            break;
    }
    
    console.log('✅ Cache cleared');
}

// Make functions globally available
window.getCachedSphereGeometry = getCachedSphereGeometry;
window.getCachedCylinderGeometry = getCachedCylinderGeometry;
window.getCachedRingGeometry = getCachedRingGeometry;
window.getCachedMaterial = getCachedMaterial;
window.getCachedTextTexture = getCachedTextTexture;
window.getCacheStats = getCacheStats;
window.clearThreeJSCache = clearThreeJSCache;

console.log('✅ Three.js cache system initialized');
console.log('💡 Available functions:', Object.keys(window).filter(k => k.startsWith('getCached')));
