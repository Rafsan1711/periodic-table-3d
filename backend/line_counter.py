"""
Line Counter Backend - FIXED for Private Repo
Counts total lines of code from GitHub repository
Deploy to Render.com
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
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')  # REQUIRED for private repos
REPO_OWNER = 'Rafsan1711'
REPO_NAME = 'periodic-table-3d'
BRANCH = 'main'

# File extensions to count
EXTENSIONS = {
    '.js': 'javascript',
    '.css': 'css',
    '.html': 'html',
    '.py': 'python'
}

# Directories to exclude
EXCLUDE_DIRS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '__pycache__',
    '.netlify'
]

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'service': 'Periodic Table 3D - Line Counter',
        'status': 'running',
        'endpoints': {
            'line_count': '/api/line-count',
            'health': '/health'
        },
        'timestamp': int(datetime.now().timestamp() * 1000)
    })

@app.route('/api/line-count', methods=['GET'])
def get_line_count():
    """
    Fetch repository contents and count lines
    Requires GITHUB_TOKEN for private repos
    """
    try:
        print(f"📊 Counting lines for {REPO_OWNER}/{REPO_NAME}...")
        
        if not GITHUB_TOKEN:
            print("❌ GITHUB_TOKEN not set!")
            return jsonify({
                'error': 'GitHub token not configured',
                'message': 'Please set GITHUB_TOKEN in Render environment variables',
                'total': 0
            }), 500
        
        # Headers with authentication
        headers = {
            'Authorization': f'Bearer {GITHUB_TOKEN}',
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        }
        
        # Get repository tree
        tree_url = f'https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/git/trees/{BRANCH}?recursive=1'
        
        print(f"🔗 Fetching: {tree_url}")
        response = requests.get(tree_url, headers=headers, timeout=15)
        
        print(f"📡 Response status: {response.status_code}")
        
        if response.status_code == 401:
            return jsonify({
                'error': 'Authentication failed',
                'message': 'Invalid GitHub token',
                'total': 0
            }), 500
        
        if response.status_code == 404:
            return jsonify({
                'error': 'Repository not found',
                'message': 'Check repository name and token permissions',
                'total': 0
            }), 500
        
        response.raise_for_status()
        tree = response.json()
        
        if 'tree' not in tree:
            print(f"❌ No tree in response: {tree}")
            return jsonify({
                'error': 'Unable to fetch repository tree',
                'total': 0
            }), 500
        
        # Count lines by file type
        counts = {
            'javascript': 0,
            'css': 0,
            'html': 0,
            'python': 0,
            'total': 0
        }
        
        files_processed = 0
        files_failed = 0
        
        for item in tree['tree']:
            if item['type'] != 'blob':
                continue
            
            path = item['path']
            
            # Skip excluded directories
            if any(excluded in path for excluded in EXCLUDE_DIRS):
                continue
            
            # Check file extension
            ext = os.path.splitext(path)[1].lower()
            if ext not in EXTENSIONS:
                continue
            
            # Fetch file content using GitHub API (more reliable for private repos)
            try:
                content_url = f'https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}?ref={BRANCH}'
                file_response = requests.get(content_url, headers=headers, timeout=5)
                
                if file_response.status_code == 200:
                    content_data = file_response.json()
                    
                    # Decode base64 content
                    if 'content' in content_data:
                        content = base64.b64decode(content_data['content']).decode('utf-8', errors='ignore')
                        lines = content.count('\n') + 1
                        file_type = EXTENSIONS[ext]
                        
                        counts[file_type] += lines
                        counts['total'] += lines
                        files_processed += 1
                        
                        print(f"✓ {path}: {lines} lines")
                    
            except Exception as e:
                files_failed += 1
                print(f"⚠️ Error processing {path}: {str(e)}")
                continue
        
        print(f"✅ Processed {files_processed} files")
        print(f"⚠️ Failed {files_failed} files")
        print(f"📊 Total lines: {counts['total']}")
        
        return jsonify({
            **counts,
            'timestamp': int(datetime.now().timestamp() * 1000),
            'files_processed': files_processed,
            'files_failed': files_failed
        })
        
    except requests.RequestException as e:
        print(f"❌ Network error: {str(e)}")
        return jsonify({
            'error': 'Network error',
            'message': str(e),
            'total': 0
        }), 500
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e),
            'total': 0
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    has_token = bool(GITHUB_TOKEN)
    return jsonify({
        'status': 'healthy',
        'service': 'line-counter',
        'github_token_configured': has_token,
        'timestamp': int(datetime.now().timestamp() * 1000)
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
