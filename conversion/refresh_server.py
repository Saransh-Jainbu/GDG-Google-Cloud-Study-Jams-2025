#!/usr/bin/env python3
"""
Simple Flask server to trigger the scraper when refresh is clicked on the site.
"""
from flask import Flask, jsonify
from flask_cors import CORS
import subprocess
import sys
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for localhost requests

@app.route('/refresh', methods=['POST'])
def refresh_data():
    """Run the scraper and return results"""
    try:
        # Get the path to scrape_profiles.py
        script_dir = os.path.dirname(os.path.abspath(__file__))
        scraper_path = os.path.join(script_dir, 'scrape_profiles.py')
        data_path = os.path.join(os.path.dirname(script_dir), 'main', 'data.json')
        
        # Run the scraper with default settings
        result = subprocess.run(
            [sys.executable, scraper_path, '--input', data_path, '--output', data_path],
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        return jsonify({
            'success': result.returncode == 0,
            'output': result.stdout,
            'error': result.stderr if result.returncode != 0 else None
        })
    except subprocess.TimeoutExpired:
        return jsonify({
            'success': False,
            'error': 'Scraper timed out after 5 minutes'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    print("Starting refresh server on http://localhost:5001")
    print("Make sure to keep this running while using the site!")
    app.run(host='localhost', port=5001, debug=False)
