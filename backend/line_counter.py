"""
Line Counter Backend - WITH NODE.JS SUPPORT
✅ Worker stability fixed
✅ Memory optimized
✅ Node.js backend counting
✅ Proper error handling
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os
from datetime import datetime
import base64
import signal
import sys

# ============================================
# GRACEFUL SHUTDOWN HANDLER
# ============================================

def signal_handler(sig, frame):
    """Handle graceful shutdown"""
    print('\n🛑 Shutting down gracefully...')
    sys.exit(0)

signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

# ============================================
# APP INITIALIZATION
# ============================================

app = Flask(__name__)

# CORS Configuration
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept"],
        "max_age": 3600
    }
})

# ============================================
# CONFIGURATION
# ============================================

GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')
REPO_OWNER = 'Rafsan1711'
REPO_NAME = 'periodic-table-3d'
BRANCH = 'master'

# File extensions
EXTENSIONS = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.css': 'css',
    '.scss': 'css',
    '.html': 'html',
    '.py': 'python',
    '.json': 'json',
    '.md': 'markdown'
}

# ✅ NEW: Node.js backend folders
NODEJS_FOLDERS = [
    'backend/',
    'server/',
    'api/',
    'routes/',
    'controllers/',
    'models/',
    'middleware/'
]

# Exclude patterns
EXCLUDE_PATTERNS = [
    '.github/',
    'node_modules/',
    '.git/',
    'dist/',
    'build/',
    '__pycache__/',
    '.netlify/'
]

def should_exclude(path):
    """Check if path should be excluded"""
    return any(pattern in path for pattern in EXCLUDE_PATTERNS)

def is_nodejs_file(path):
    """Check if file is Node.js backend code"""
    # Check if in backend folders
    for folder in NODEJS_FOLDERS:
        if path.startswith(folder):
            return True
    
    # Check if file is server.js or similar
    filename = path.split('/')[-1].lower()
    nodejs_files = ['server.js', 'app.js', 'index.js', 'main.js']
    
    for nf in nodejs_files:
        if filename == nf and 'backend' in path.lower():
            return True
    
    return False

# ============================================
# MIDDLEWARE
# ============================================

@app.after_request
def after_request(response):
    """Add CORS headers"""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Accept'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

# ============================================
# ROUTES
# ============================================

@app.route('/', methods=['GET', 'OPTIONS'])
def index():
    """Root endpoint"""
    if request.method == 'OPTIONS':
        return '', 204
    
    return jsonify({
        'service': 'Line Counter',
        'version': '3.1',
        'status': 'running',
        'branch': BRANCH,
        'features': ['Node.js backend counting']
    })

@app.route('/api/line-count', methods=['GET', 'OPTIONS'])
def get_line_count():
    """Count lines - WITH NODE.JS SUPPORT"""
    
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        print(f"\n📊 Starting line count for {REPO_OWNER}/{REPO_NAME} ({BRANCH})")
        
        if not GITHUB_TOKEN:
            return jsonify({
                'error': 'Token not configured',
                'total': 0,
                'javascript': 0,
                'css': 0,
                'html': 0,
                'python': 0,
                'nodejs': 0
            }), 500
        
        # Headers
        headers = {
            'Authorization': f'Bearer {GITHUB_TOKEN}',
            'Accept': 'application/vnd.github+json'
        }
        
        # Get tree
        tree_url = f'https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/git/trees/{BRANCH}?recursive=1'
        
        try:
            response = requests.get(tree_url, headers=headers, timeout=15)
        except requests.Timeout:
            print("❌ Request timeout")
            return jsonify({
                'error': 'Request timeout',
                'total': 0,
                'javascript': 0,
                'css': 0,
                'html': 0,
                'python': 0,
                'nodejs': 0
            }), 504
        
        if response.status_code != 200:
            print(f"❌ GitHub API error: {response.status_code}")
            return jsonify({
                'error': f'GitHub API error: {response.status_code}',
                'total': 0,
                'javascript': 0,
                'css': 0,
                'html': 0,
                'python': 0,
                'nodejs': 0
            }), response.status_code
        
        tree_data = response.json()
        files = tree_data.get('tree', [])
        
        print(f"📂 Found {len(files)} items")
        
        # Initialize counters
        counts = {
            'javascript': 0,
            'typescript': 0,
            'css': 0,
            'html': 0,
            'python': 0,
            'nodejs': 0,  # ✅ NEW
            'json': 0,
            'markdown': 0,
            'total': 0
        }
        
        processed = 0
        max_files = 100  # Limit to prevent memory issues
        
        # Process files
        for item in files[:max_files]:
            if item.get('type') != 'blob':
                continue
            
            path = item.get('path', '')
            
            if should_exclude(path):
                continue
            
            ext = os.path.splitext(path)[1].lower()
            if ext not in EXTENSIONS:
                continue
            
            try:
                content_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}?ref={BRANCH}"
                file_response = requests.get(content_url, headers=headers, timeout=8)
                
                if file_response.status_code == 200:
                    file_data = file_response.json()
                    
                    if 'content' in file_data:
                        content = base64.b64decode(file_data['content']).decode('utf-8', errors='ignore')
                        lines = content.count('\n') + 1
                        file_type = EXTENSIONS[ext]
                        
                        # ✅ Check if Node.js backend file
                        if is_nodejs_file(path) and file_type == 'javascript':
                            counts['nodejs'] += lines
                            print(f"✅ Node.js: {path} ({lines} lines)")
                        else:
                            counts[file_type] += lines
                        
                        counts['total'] += lines
                        processed += 1
                        
                        if processed % 10 == 0:
                            print(f"✔ Processed {processed} files...")
            
            except Exception as e:
                print(f"✗ Error: {path[:30]} - {str(e)[:30]}")
                continue
        
        print(f"✅ Complete: {counts['total']:,} lines from {processed} files")
        print(f"   JavaScript: {counts['javascript']:,}")
        print(f"   Node.js: {counts['nodejs']:,}")
        print(f"   CSS: {counts['css']:,}")
        print(f"   HTML: {counts['html']:,}")
        print(f"   Python: {counts['python']:,}\n")
        
        return jsonify({
            **counts,
            'statistics': {
                'files_processed': processed,
                'files_total': len(files)
            },
            'timestamp': int(datetime.now().timestamp() * 1000),
            'repository': f"{REPO_OWNER}/{REPO_NAME}",
            'branch': BRANCH
        })
        
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
        return jsonify({
            'error': 'Internal error',
            'message': str(e)[:100],
            'total': 0,
            'javascript': 0,
            'css': 0,
            'html': 0,
            'python': 0,
            'nodejs': 0
        }), 500

@app.route('/api/readme', methods=['GET', 'OPTIONS'])
def get_readme():
    """Get README"""
    
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        if not GITHUB_TOKEN:
            return jsonify({'error': 'Token required'}), 500
        
        headers = {
            'Authorization': f'Bearer {GITHUB_TOKEN}',
            'Accept': 'application/vnd.github+json'
        }
        
        readme_url = f'https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/readme?ref={BRANCH}'
        response = requests.get(readme_url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            return jsonify({'error': 'README not found'}), 404
        
        data = response.json()
        content = base64.b64decode(data['content']).decode('utf-8')
        
        return jsonify({
            'content': content,
            'name': data.get('name', 'README.md'),
            'timestamp': int(datetime.now().timestamp() * 1000)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)[:100]}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'branch': BRANCH,
        'token': bool(GITHUB_TOKEN),
        'features': ['Node.js counting']
    })

# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    print(f"Unhandled exception: {str(e)}")
    return jsonify({'error': 'Server error'}), 500

# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    
    print(f"\n{'='*50}")
    print(f"🚀 Starting Line Counter with Node.js Support")
    print(f"📦 Repo: {REPO_OWNER}/{REPO_NAME}")
    print(f"🌿 Branch: {BRANCH}")
    print(f"🔑 Token: {'✔' if GITHUB_TOKEN else '✗'}")
    print(f"{'='*50}\n")
    
    # Run with minimal workers for 512MB RAM
    app.run(
        host='0.0.0.0',
        port=port,
        debug=False,
        threaded=True
    )
