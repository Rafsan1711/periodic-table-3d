const BACKEND_README_URL = 'https://periodic-table-3d.onrender.com/api/readme';

const modal = document.getElementById('readme-modal');
const modalOverlay = document.getElementById('modal-overlay');
const closeReadmeBtn = document.getElementById('close-readme');
const readmeContent = document.getElementById('readme-content');

const viewReadmeBtn = document.getElementById('view-readme');
const footerReadmeLink = document.getElementById('footer-readme');

/**
 * Open README modal
 */
function openReadmeModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
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
 * Fetch and display README via backend
 */
async function loadReadme() {
    try {
        console.log('📖 Fetching README via backend...');
        
        readmeContent.innerHTML = `
            <div class="loader">
                <div class="readme-loading-animation">
                    <div class="loading-book">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <div class="loading-text">Loading documentation...</div>
                </div>
            </div>
        `;
        
        const response = await fetch(BACKEND_README_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch README');
        }
        
        const data = await response.json();
        
        if (!data.content) {
            throw new Error('No content in response');
        }
        
        // Convert markdown to HTML
        const html = convertMarkdownToHTML(data.content);
        
        readmeContent.innerHTML = html;
        
        console.log('✅ README loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading README:', error);
        readmeContent.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div class="error-icon-animation">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 style="color: var(--text-primary); margin: 1.5rem 0 1rem;">
                    Unable to Load Documentation
                </h3>
                <p style="color: var(--text-secondary); margin: 1rem 0;">
                    The README file could not be loaded from the repository.
                </p>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                    Please visit our GitHub repository directly:
                </p>
                <a href="https://github.com/Rafsan1711/periodic-table-3d" 
                   target="_blank" 
                   class="btn-primary"
                   style="display: inline-flex; align-items: center; gap: 0.75rem; text-decoration: none;">
                    <i class="fab fa-github"></i>
                    View on GitHub
                </a>
            </div>
        `;
    }
}

/**
 * Enhanced markdown to HTML converter
 */
function convertMarkdownToHTML(markdown) {
    let html = markdown;
    
    // Code blocks with language
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang || 'plaintext'}">${escapeHtml(code.trim())}</code></pre>`;
    });
    
    // Headers
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Numbered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Blockquotes
    html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>');
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr>');
    html = html.replace(/^\*\*\*$/gim, '<hr>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');
    
    // Wrap in styled container
    html = `
        <div class="readme-content-wrapper">
            <style>
                .readme-content-wrapper {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 2rem;
                    font-size: 1rem;
                    line-height: 1.8;
                    color: var(--text-primary);
                }
                
                .readme-content-wrapper h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin: 2rem 0 1.5rem;
                    color: var(--accent-blue);
                    border-bottom: 3px solid var(--border-primary);
                    padding-bottom: 1rem;
                }
                
                .readme-content-wrapper h2 {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 2rem 0 1rem;
                    color: var(--accent-purple);
                    border-bottom: 2px solid var(--border-primary);
                    padding-bottom: 0.75rem;
                }
                
                .readme-content-wrapper h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 1.5rem 0 1rem;
                    color: var(--accent-green);
                }
                
                .readme-content-wrapper h4 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 1.25rem 0 0.75rem;
                    color: var(--text-primary);
                }
                
                .readme-content-wrapper p {
                    margin: 1rem 0;
                    color: var(--text-secondary);
                    line-height: 1.8;
                }
                
                .readme-content-wrapper ul {
                    margin: 1rem 0;
                    padding-left: 2rem;
                    list-style: disc;
                }
                
                .readme-content-wrapper li {
                    margin: 0.75rem 0;
                    color: var(--text-secondary);
                    line-height: 1.6;
                }
                
                .readme-content-wrapper code {
                    background: var(--bg-tertiary);
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-family: 'Courier New', 'Monaco', monospace;
                    color: var(--accent-orange);
                    font-size: 0.9em;
                }
                
                .readme-content-wrapper pre {
                    background: var(--bg-tertiary);
                    padding: 1.5rem;
                    border-radius: 12px;
                    overflow-x: auto;
                    margin: 1.5rem 0;
                    border: 1px solid var(--border-primary);
                    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
                }
                
                .readme-content-wrapper pre code {
                    background: none;
                    padding: 0;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    line-height: 1.6;
                }
                
                .readme-content-wrapper a {
                    color: var(--accent-blue);
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.3s ease;
                    border-bottom: 1px solid transparent;
                }
                
                .readme-content-wrapper a:hover {
                    color: var(--accent-purple);
                    border-bottom-color: var(--accent-purple);
                }
                
                .readme-content-wrapper strong {
                    color: var(--text-primary);
                    font-weight: 700;
                }
                
                .readme-content-wrapper blockquote {
                    border-left: 4px solid var(--accent-blue);
                    padding-left: 1.5rem;
                    margin: 1.5rem 0;
                    color: var(--text-secondary);
                    font-style: italic;
                    background: rgba(88, 166, 255, 0.05);
                    padding: 1rem 1.5rem;
                    border-radius: 0 8px 8px 0;
                }
                
                .readme-content-wrapper hr {
                    border: none;
                    border-top: 2px solid var(--border-primary);
                    margin: 2rem 0;
                }
                
                .readme-loading-animation {
                    text-align: center;
                    padding: 3rem;
                }
                
                .loading-book {
                    font-size: 4rem;
                    color: var(--accent-blue);
                    animation: bookOpen 1.5s ease-in-out infinite;
                    margin-bottom: 1.5rem;
                }
                
                @keyframes bookOpen {
                    0%, 100% {
                        transform: rotateY(0deg);
                    }
                    50% {
                        transform: rotateY(180deg);
                    }
                }
                
                .loading-text {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                }
                
                .error-icon-animation {
                    font-size: 4rem;
                    color: var(--accent-orange);
                    animation: errorShake 0.5s ease;
                    margin-bottom: 1rem;
                }
                
                @keyframes errorShake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
            </style>
            ${html}
        </div>
    `;
    
    return html;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
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

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeReadmeModal();
    }
});

console.log('✅ README viewer initialized');
