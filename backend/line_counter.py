"""
Advanced Line Counter - FIXED VERSION
✅ Branch: master
✅ All languages working
✅ Optimized for 512MB RAM
"""

from flask import Flask, jsonify
from flask_cors import CORS
import requests
import os
from datetime import datetime
import base64

app = Flask(__name__)
CORS(app)

# GitHub Configuration
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')
REPO_OWNER = 'Rafsan1711'
REPO_NAME = 'periodic-table-3d'
BRANCH = 'master'  # ✅ FIXED: Changed from 'main' to 'master'

# File extensions with proper categorization
EXTENSIONS = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.mjs': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.css': 'css',
    '.scss': 'css',
    '.sass': 'css',
    '.less': 'css',
    '.html': 'html',
    '.htm': 'html',
    '.py': 'python',
    '.json': 'json',
    '.md': 'markdown',
    '.markdown': 'markdown',
    '.txt': 'text',
    '.xml': 'xml',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.sh': 'shell',
    '.bat': 'batch'
}

# Exclude patterns
EXCLUDE_PATTERNS = [
    '.github/',
    'node_modules/',
    '.git/',
    'dist/',
    'build/',
    '__pycache__/',
    '.netlify/',
    '.vscode/',
    'package-lock.json',
    'yarn.lock'
]

def should_exclude(path):
    """Check if path should be excluded"""
    return any(pattern in path for pattern in EXCLUDE_PATTERNS)

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'service': 'Periodic Table 3D Line Counter',
        'version': '3.0',
        'status': 'running',
        'branch': BRANCH,
        'endpoints': {
            'line_count': '/api/line-count',
            'readme': '/api/readme',
            'health': '/health'
        }
    })

@app.route('/api/line-count', methods=['GET'])
def get_line_count():
    """
    Count lines of code with memory optimization
    """
    try:
        print(f"\n{'='*60}")
        print(f"📊 LINE COUNTER STARTED")
        print(f"📦 Repository: {REPO_OWNER}/{REPO_NAME}")
        print(f"🌿 Branch: {BRANCH}")
        print(f"{'='*60}\n")
        
        if not GITHUB_TOKEN:
            print("❌ ERROR: GITHUB_TOKEN not set!")
            return jsonify({
                'error': 'GitHub token required',
                'total': 0
            }), 500
        
        # Headers
        headers = {
            'Authorization': f'Bearer {GITHUB_TOKEN}',
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        }
        
        # Get repository tree
        tree_url = f'https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/git/trees/{BRANCH}?recursive=1'
        
        print(f"🔗 Fetching tree: {tree_url}")
        response = requests.get(tree_url, headers=headers, timeout=30)
        
        print(f"📡 Response status: {response.status_code}")
        
        if response.status_code == 401:
            print("❌ Authentication failed!")
            return jsonify({'error': 'Invalid token', 'total': 0}), 401
        
        if response.status_code == 404:
            print(f"❌ Repository or branch not found!")
            print(f"   Check: https://github.com/{REPO_OWNER}/{REPO_NAME}/tree/{BRANCH}")
            return jsonify({'error': 'Repo not found', 'total': 0}), 404
        
        response.raise_for_status()
        tree_data = response.json()
        
        if 'tree' not in tree_data:
            print("❌ Invalid tree response!")
            return jsonify({'error': 'Invalid response', 'total': 0}), 500
        
        files = tree_data['tree']
        print(f"📂 Total items in repo: {len(files)}\n")
        
        # Initialize counters
        counts = {
            'javascript': 0,
            'typescript': 0,
            'css': 0,
            'html': 0,
            'python': 0,
            'json': 0,
            'markdown': 0,
            'yaml': 0,
            'shell': 0,
            'batch': 0,
            'text': 0,
            'xml': 0,
            'total': 0
        }
        
        stats = {
            'files_processed': 0,
            'files_excluded': 0,
            'files_skipped': 0
        }
        
        # Process files in batches to save memory
        batch_size = 10
        processed = 0
        
        for i in range(0, len(files), batch_size):
            batch = files[i:i+batch_size]
            
            for item in batch:
                if item['type'] != 'blob':
                    continue
                
                path = item['path']
                
                # Check exclusion
                if should_exclude(path):
                    stats['files_excluded'] += 1
                    continue
                
                # Check extension
                ext = os.path.splitext(path)[1].lower()
                if ext not in EXTENSIONS:
                    stats['files_skipped'] += 1
                    continue
                
                # Fetch file content
                try:
                    content_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}?ref={BRANCH}"
                    file_response = requests.get(content_url, headers=headers, timeout=10)
                    
                    if file_response.status_code == 200:
                        file_data = file_response.json()
                        
                        if 'content' in file_data:
                            # Decode base64
                            content = base64.b64decode(file_data['content']).decode('utf-8', errors='ignore')
                            
                            # Count lines
                            lines = content.count('\n') + 1
                            file_type = EXTENSIONS[ext]
                            
                            counts[file_type] += lines
                            counts['total'] += lines
                            stats['files_processed'] += 1
                            
                            processed += 1
                            print(f"✓ [{processed}] {path}: {lines} lines ({file_type})")
                    
                except Exception as e:
                    print(f"✗ Error: {path} - {str(e)[:50]}")
                    continue
        
        print(f"\n{'='*60}")
        print(f"📊 SUMMARY")
        print(f"{'='*60}")
        print(f"✅ Files Processed: {stats['files_processed']}")
        print(f"⊗  Files Excluded: {stats['files_excluded']}")
        print(f"⊘  Files Skipped: {stats['files_skipped']}")
        print(f"\n📝 LINES BY LANGUAGE:")
        for lang, count in counts.items():
            if lang != 'total' and count > 0:
                print(f"   {lang.capitalize()}: {count:,}")
        print(f"\n🎯 TOTAL LINES: {counts['total']:,}")
        print(f"{'='*60}\n")
        
        return jsonify({
            **counts,
            'statistics': stats,
            'timestamp': int(datetime.now().timestamp() * 1000),
            'repository': f"{REPO_OWNER}/{REPO_NAME}",
            'branch': BRANCH
        })
        
    except Exception as e:
        print(f"\n❌ FATAL ERROR: {str(e)}\n")
        return jsonify({
            'error': 'Internal error',
            'message': str(e),
            'total': 0
        }), 500

@app.route('/api/readme', methods=['GET'])
def get_readme():
    """Fetch README.md"""
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
            'name': data['name'],
            'timestamp': int(datetime.now().timestamp() * 1000)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'branch': BRANCH,
        'token_configured': bool(GITHUB_TOKEN)
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"\n{'='*60}")
    print(f"🚀 LINE COUNTER STARTING")
    print(f"{'='*60}")
    print(f"📦 Repository: {REPO_OWNER}/{REPO_NAME}")
    print(f"🌿 Branch: {BRANCH}")
    print(f"🔒 Token: {'✓ Configured' if GITHUB_TOKEN else '✗ Missing'}")
    print(f"🌐 Port: {port}")
    print(f"{'='*60}\n")
    
    app.run(host='0.0.0.0', port=port, debug=False)
