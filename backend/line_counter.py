"""
Advanced Line Counter Backend
Supports multiple languages and excludes .github folder
Uses GitHub API for private repos
"""

from flask import Flask, jsonify
from flask_cors import CORS
import requests
import os
from datetime import datetime
import base64
import re

app = Flask(__name__)
CORS(app)

# GitHub Configuration
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')
REPO_OWNER = 'Rafsan1711'
REPO_NAME = 'periodic-table-3d'
BRANCH = 'main'

# Extended file extensions
EXTENSIONS = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.css': 'css',
    '.scss': 'css',
    '.sass': 'css',
    '.html': 'html',
    '.htm': 'html',
    '.py': 'python',
    '.json': 'json',
    '.md': 'markdown',
    '.txt': 'text',
    '.xml': 'xml',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.sh': 'shell',
    '.bat': 'shell'
}

# Directories and files to EXCLUDE
EXCLUDE_PATTERNS = [
    '.github',          # GitHub workflows
    'node_modules',
    '.git',
    'dist',
    'build',
    '__pycache__',
    '.netlify',
    '.vscode',
    '.idea',
    'package-lock.json',
    'yarn.lock'
]

def should_exclude(path):
    """Check if path should be excluded"""
    for pattern in EXCLUDE_PATTERNS:
        if pattern in path:
            return True
    return False

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'service': 'Periodic Table 3D - Advanced Line Counter',
        'version': '2.0',
        'status': 'running',
        'features': [
            'Multi-language support',
            'Excludes .github folder',
            'Real-time processing',
            'Private repo support'
        ],
        'endpoints': {
            'line_count': '/api/line-count',
            'health': '/health'
        },
        'timestamp': int(datetime.now().timestamp() * 1000)
    })

@app.route('/api/line-count', methods=['GET'])
def get_line_count():
    """
    Advanced line counting with detailed breakdown
    """
    try:
        print(f"📊 Starting advanced line count for {REPO_OWNER}/{REPO_NAME}...")
        
        if not GITHUB_TOKEN:
            print("❌ GITHUB_TOKEN not configured")
            return jsonify({
                'error': 'GitHub token required',
                'message': 'Set GITHUB_TOKEN in environment variables',
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
        
        print(f"🔗 Fetching tree from GitHub API...")
        response = requests.get(tree_url, headers=headers, timeout=20)
        
        if response.status_code == 401:
            return jsonify({
                'error': 'Authentication failed',
                'message': 'Invalid GitHub token',
                'total': 0
            }), 401
        
        if response.status_code == 404:
            return jsonify({
                'error': 'Repository not found',
                'message': 'Check repo name and token permissions',
                'total': 0
            }), 404
        
        response.raise_for_status()
        tree = response.json()
        
        if 'tree' not in tree:
            return jsonify({
                'error': 'Invalid response',
                'message': 'Unable to fetch repository tree',
                'total': 0
            }), 500
        
        print(f"✅ Found {len(tree['tree'])} items in repository")
        
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
            'text': 0,
            'xml': 0,
            'total': 0
        }
        
        stats = {
            'files_processed': 0,
            'files_excluded': 0,
            'files_failed': 0
        }
        
        # Process files
        for item in tree['tree']:
            if item['type'] != 'blob':
                continue
            
            path = item['path']
            
            # Check exclusion
            if should_exclude(path):
                stats['files_excluded'] += 1
                print(f"⊗ Excluded: {path}")
                continue
            
            # Check extension
            ext = os.path.splitext(path)[1].lower()
            if ext not in EXTENSIONS:
                continue
            
            # Fetch file content
            try:
                print(f"📄 Processing: {path}")
                
                content_url = f'https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}?ref={BRANCH}'
                file_response = requests.get(content_url, headers=headers, timeout=10)
                
                if file_response.status_code == 200:
                    content_data = file_response.json()
                    
                    if 'content' in content_data:
                        # Decode base64
                        content = base64.b64decode(content_data['content']).decode('utf-8', errors='ignore')
                        
                        # Count lines (including blank lines)
                        lines = content.count('\n') + 1
                        
                        # Count code lines (non-empty)
                        code_lines = len([line for line in content.split('\n') if line.strip()])
                        
                        # Count comments (basic detection)
                        comment_lines = count_comments(content, ext)
                        
                        file_type = EXTENSIONS[ext]
                        
                        counts[file_type] += lines
                        counts['total'] += lines
                        stats['files_processed'] += 1
                        
                        print(f"  ✓ {lines} lines ({code_lines} code, {comment_lines} comments)")
                    
            except requests.RequestException as e:
                stats['files_failed'] += 1
                print(f"  ✗ Network error: {str(e)}")
                continue
            except Exception as e:
                stats['files_failed'] += 1
                print(f"  ✗ Error: {str(e)}")
                continue
        
        print(f"\n📊 === SUMMARY ===")
        print(f"✅ Files processed: {stats['files_processed']}")
        print(f"⊗ Files excluded: {stats['files_excluded']}")
        print(f"✗ Files failed: {stats['files_failed']}")
        print(f"📝 Total lines: {counts['total']}")
        print(f"===================\n")
        
        # Return detailed response
        return jsonify({
            **counts,
            'statistics': stats,
            'timestamp': int(datetime.now().timestamp() * 1000),
            'repository': f"{REPO_OWNER}/{REPO_NAME}",
            'branch': BRANCH
        })
        
    except requests.RequestException as e:
        print(f"❌ Network error: {str(e)}")
        return jsonify({
            'error': 'Network error',
            'message': str(e),
            'total': 0
        }), 500
        
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e),
            'total': 0
        }), 500

def count_comments(content, ext):
    """
    Basic comment detection (can be enhanced)
    """
    comment_count = 0
    
    if ext in ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss']:
        # Single line comments //
        comment_count += len(re.findall(r'^\s*//.*$', content, re.MULTILINE))
        # Multi-line comments /* */
        comment_count += len(re.findall(r'/\*[\s\S]*?\*/', content))
    
    elif ext in ['.py']:
        # Python comments #
        comment_count += len(re.findall(r'^\s*#.*$', content, re.MULTILINE))
        # Docstrings
        comment_count += len(re.findall(r'"""[\s\S]*?"""', content))
        comment_count += len(re.findall(r"'''[\s\S]*?'''", content))
    
    elif ext in ['.html', '.htm', '.xml']:
        # HTML/XML comments
        comment_count += len(re.findall(r'<!--[\s\S]*?-->', content))
    
    return comment_count

@app.route('/health', methods=['GET'])
def health_check():
    """Health check with configuration info"""
    return jsonify({
        'status': 'healthy',
        'service': 'advanced-line-counter',
        'version': '2.0',
        'github_token_configured': bool(GITHUB_TOKEN),
        'supported_languages': list(set(EXTENSIONS.values())),
        'excluded_patterns': EXCLUDE_PATTERNS,
        'timestamp': int(datetime.now().timestamp() * 1000)
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Starting Advanced Line Counter on port {port}")
    print(f"📦 Repository: {REPO_OWNER}/{REPO_NAME}")
    print(f"🔒 Token configured: {bool(GITHUB_TOKEN)}")
    app.run(host='0.0.0.0', port=port, debug=False)
