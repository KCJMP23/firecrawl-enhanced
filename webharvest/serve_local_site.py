#!/usr/bin/env python3
"""
Serve the downloaded website locally
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

def serve_website(directory="downloaded_sites/www.apple.com", port=8000):
    """Serve downloaded website locally"""
    
    # Change to the website directory
    web_dir = Path(directory)
    if not web_dir.exists():
        print(f"❌ Directory not found: {web_dir}")
        return
    
    os.chdir(web_dir)
    
    # Custom handler to serve index.html for directories
    class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):
            # If path is a directory, try to serve index.html
            if self.path.endswith('/'):
                self.path += 'index.html'
            elif os.path.isdir(self.translate_path(self.path)):
                self.path += '/index.html'
            return super().do_GET()
        
        def end_headers(self):
            # Add headers to handle various content types properly
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            super().end_headers()
    
    # Start server
    with socketserver.TCPServer(("", port), MyHTTPRequestHandler) as httpd:
        print("=" * 60)
        print("🌐 WebHarvest Local Website Server")
        print("=" * 60)
        print(f"📁 Serving: {web_dir.absolute()}")
        print(f"🔗 URL: http://localhost:{port}")
        print("=" * 60)
        print("✨ Open the URL above in your browser to view the site!")
        print("Press Ctrl+C to stop the server")
        print("=" * 60)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")

if __name__ == "__main__":
    port = 8000
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    
    serve_website(port=port)