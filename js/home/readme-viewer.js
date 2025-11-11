/**
 * README Viewer
 * Fetches and displays README.md in a modal
 */

const GITHUB_README_URL = 'https://raw.githubusercontent.com/Rafsan1711/periodic-table-3d/main/README.md';

const modal = document.getElementById('readme-modal');
const modalOverlay = document.getElementById('modal-overlay');
const closeReadmeBtn = document.getElementById('close-readme');
const readmeContent = document.getElementById('readme-content');

// Buttons that open README
const viewReadmeBtn = document.getElementById('view-readme');
const footerReadmeLink = document.getElementById('footer-readme');

/**
 * Open README modal
 */
function openReadmeModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Load README if not already loaded
    if (readmeContent.querySelector('.loader')) {
        loadReadme();
    }
}

/**
 * Close README modal
 */
function closeReadmeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Fetch and display README
 */
async function loadReadme() {
    try {
        console.log('📖 Fetching README...');
        
        const response = await fetch(GITHUB_README_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch README');
        }
        
        const markdown = await response.text();
        
        // Convert markdown to HTML
        const html = convertMarkdownToHTML(markdown);
        
        readmeContent.innerHTML = html;
        
        console.log('✅ README loaded');
        
    } catch (error) {
        console.error('❌ Error loading README:', error);
        readmeContent.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--accent-orange); margin-bottom: 1rem;"></i>
                <h3>Unable to Load Documentation</h3>
                <p style="color: var(--text-secondary); margin: 1rem 0;">
                    Please visit our 
                    <a href="https://github.com/Rafsan1711/periodic-table-3d" target="_blank" style="color: var(--accent-blue);">
                        GitHub repository
                    </a> 
                    to view the README.
                </p>
            </div>
        `;
    }
}

/**
 * Simple markdown to HTML converter
 * (For production, use a library like marked.js)
 */
function convertMarkdownToHTML(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    // Add styling
    html = `
        <div style="
            max-width: 800px;
            margin: 0 auto;
            font-size: 1rem;
            line-height: 1.8;
            color: var(--text-primary);
        ">
            <style>
                #readme-content h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin: 2rem 0 1rem;
                    color: var(--accent-blue);
                }
                #readme-content h2 {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 1.5rem 0 1rem;
                    color: var(--accent-purple);
                    border-bottom: 2px solid var(--border-primary);
                    padding-bottom: 0.5rem;
                }
                #readme-content h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 1rem 0 0.75rem;
                    color: var(--accent-green);
                }
                #readme-content p {
                    margin: 1rem 0;
                    color: var(--text-secondary);
                }
                #readme-content ul {
                    margin: 1rem 0;
                    padding-left: 2rem;
                }
                #readme-content li {
                    margin: 0.5rem 0;
                    color: var(--text-secondary);
                }
                #readme-content code {
                    background: var(--bg-tertiary);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    color: var(--accent-orange);
                }
                #readme-content pre {
                    background: var(--bg-tertiary);
                    padding: 1.5rem;
                    border-radius: 8px;
                    overflow-x: auto;
                    margin: 1rem 0;
                    border: 1px solid var(--border-primary);
                }
                #readme-content pre code {
                    background: none;
                    padding: 0;
                    color: var(--text-primary);
                    font-size: 0.9rem;
                }
                #readme-content a {
                    color: var(--accent-blue);
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.3s ease;
                }
                #readme-content a:hover {
                    color: var(--accent-purple);
                    text-decoration: underline;
                }
                #readme-content strong {
                    color: var(--text-primary);
                    font-weight: 700;
                }
            </style>
            ${html}
        </div>
    `;
    
    return html;
}

// Event listeners
if (viewReadmeBtn) {
    viewReadmeBtn.addEventListener('click', openReadmeModal);
}

if (footerReadmeLink) {
    footerReadmeLink.addEventListener('click', (e) => {
        e.preventDefault();
        openReadmeModal();
    });
}

if (closeReadmeBtn) {
    closeReadmeBtn.addEventListener('click', closeReadmeModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', closeReadmeModal);
}

// ESC key to close
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeReadmeModal();
    }
});

console.log('✅ README viewer initialized');
