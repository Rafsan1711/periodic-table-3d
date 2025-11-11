"""
Line Counter Backend
Counts total lines of code from GitHub repository
Deploy to Render.com
"""

from flask import Flask, jsonify
from flask_cors import CORS
import requests
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# GitHub Configuration
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')  # Set in Render environment variables
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
    '__pycache__'
]

@app.route('/api/line-count', methods=['GET'])
def get_line_count():
    """
    Fetch repository contents and count lines
    """
    try:
        print(f"📊 Counting lines for {REPO_OWNER}/{REPO_NAME}...")
        
        # Get repository tree
        tree_url = f'https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/git/trees/{BRANCH}?recursive=1'
        
        headers = {}
        if GITHUB_TOKEN:
            headers['Authorization'] = f'token {GITHUB_TOKEN}'
        
        response = requests.get(tree_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        tree = response.json()
        
        if 'tree' not in tree:
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
            
            # Fetch file content
            try:
                file_url = f'https://raw.githubusercontent.com/{REPO_OWNER}/{REPO_NAME}/{BRANCH}/{path}'
                file_response = requests.get(file_url, timeout=5)
                
                if file_response.status_code == 200:
                    lines = file_response.text.count('\n') + 1
                    file_type = EXTENSIONS[ext]
                    
                    counts[file_type] += lines
                    counts['total'] += lines
                    files_processed += 1
                    
                    print(f"✓ {path}: {lines} lines")
                    
            except Exception as e:
                print(f"⚠️ Error processing {path}: {str(e)}")
                continue
        
        print(f"✅ Processed {files_processed} files")
        print(f"📊 Total lines: {counts['total']}")
        
        return jsonify({
            **counts,
            'timestamp': int(datetime.now().timestamp() * 1000),
            'files_processed': files_processed
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
    return jsonify({
        'status': 'healthy',
        'service': 'line-counter',
        'timestamp': int(datetime.now().timestamp() * 1000)
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
