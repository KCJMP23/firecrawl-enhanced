#!/usr/bin/env python3
"""
Full Website Downloader - Downloads complete website with all assets
Creates a local mirror that can be browsed offline
"""

import asyncio
import httpx
import os
import sys
from pathlib import Path
from urllib.parse import urlparse, urljoin, unquote
from bs4 import BeautifulSoup
import hashlib
import json
from typing import Set, Dict, Optional, List
import re
import mimetypes
from datetime import datetime

class WebsiteDownloader:
    """Downloads complete websites with all assets"""
    
    def __init__(self, base_url: str, output_dir: str = "downloaded_sites"):
        self.base_url = base_url.rstrip('/')
        self.domain = urlparse(base_url).netloc
        self.output_dir = Path(output_dir) / self.domain
        self.downloaded = set()
        self.to_download = set()
        self.assets_downloaded = set()
        self.errors = []
        self.stats = {
            'html_files': 0,
            'css_files': 0,
            'js_files': 0,
            'images': 0,
            'other': 0,
            'total_size': 0,
            'errors': 0
        }
        
        # Create output directory
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Session for HTTP requests
        self.client = None
        
    async def __aenter__(self):
        self.client = httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
            headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        )
        return self
        
    async def __aexit__(self, *args):
        if self.client:
            await self.client.aclose()
    
    def get_local_path(self, url: str) -> Path:
        """Convert URL to local file path"""
        parsed = urlparse(url)
        
        # Remove query parameters for filename
        path = parsed.path
        if not path or path == '/':
            path = '/index.html'
        elif path.endswith('/'):
            path += 'index.html'
        elif '.' not in path.split('/')[-1]:
            # No extension, assume HTML
            path += '.html'
        
        # Clean path
        path = unquote(path).strip('/')
        
        # Create safe filename
        if parsed.netloc and parsed.netloc != self.domain:
            # External domain
            base_dir = self.output_dir / 'external' / parsed.netloc
        else:
            base_dir = self.output_dir
        
        local_path = base_dir / path
        return local_path
    
    async def download_file(self, url: str, local_path: Path) -> bool:
        """Download a single file"""
        if url in self.downloaded:
            return True
        
        try:
            print(f"  ⬇️  Downloading: {url}")
            response = await self.client.get(url)
            
            if response.status_code == 200:
                # Create directory if needed
                local_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Save file
                content = response.content
                local_path.write_bytes(content)
                
                self.downloaded.add(url)
                self.stats['total_size'] += len(content)
                
                # Update stats
                if url.endswith(('.html', '.htm')):
                    self.stats['html_files'] += 1
                elif url.endswith('.css'):
                    self.stats['css_files'] += 1
                elif url.endswith('.js'):
                    self.stats['js_files'] += 1
                elif url.endswith(('.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico')):
                    self.stats['images'] += 1
                else:
                    self.stats['other'] += 1
                
                return True
            else:
                print(f"    ❌ Failed: HTTP {response.status_code}")
                self.errors.append(f"{url}: HTTP {response.status_code}")
                self.stats['errors'] += 1
                return False
                
        except Exception as e:
            print(f"    ❌ Error: {str(e)[:50]}")
            self.errors.append(f"{url}: {str(e)}")
            self.stats['errors'] += 1
            return False
    
    async def process_html(self, url: str, content: bytes) -> Set[str]:
        """Extract and update links in HTML content"""
        soup = BeautifulSoup(content, 'lxml')
        found_urls = set()
        
        # Find all links and assets
        link_attrs = [
            ('a', 'href'),
            ('link', 'href'),
            ('script', 'src'),
            ('img', 'src'),
            ('source', 'src'),
            ('source', 'srcset'),
            ('img', 'srcset'),
            ('video', 'src'),
            ('audio', 'src'),
            ('iframe', 'src'),
            ('embed', 'src'),
            ('object', 'data'),
        ]
        
        for tag, attr in link_attrs:
            for element in soup.find_all(tag):
                value = element.get(attr)
                if value:
                    # Handle srcset (multiple URLs)
                    if attr == 'srcset':
                        urls = re.findall(r'([^\s]+)\s+\d+[wx]', value)
                        for u in urls:
                            absolute_url = urljoin(url, u)
                            found_urls.add(absolute_url)
                    else:
                        absolute_url = urljoin(url, value)
                        found_urls.add(absolute_url)
                        
                        # Update link to local path
                        local_path = self.get_local_path(absolute_url)
                        relative_path = os.path.relpath(local_path, self.get_local_path(url).parent)
                        element[attr] = relative_path
        
        # Find CSS urls in style tags
        for style in soup.find_all('style'):
            if style.string:
                css_urls = re.findall(r'url\(["\']?([^"\'()]+)["\']?\)', style.string)
                for css_url in css_urls:
                    absolute_url = urljoin(url, css_url)
                    found_urls.add(absolute_url)
        
        # Save modified HTML
        local_path = self.get_local_path(url)
        local_path.parent.mkdir(parents=True, exist_ok=True)
        local_path.write_text(str(soup), encoding='utf-8')
        
        return found_urls
    
    async def process_css(self, url: str, content: bytes) -> Set[str]:
        """Extract and update URLs in CSS content"""
        text = content.decode('utf-8', errors='ignore')
        found_urls = set()
        
        # Find all url() references
        css_urls = re.findall(r'url\(["\']?([^"\'()]+)["\']?\)', text)
        
        for css_url in css_urls:
            if not css_url.startswith('data:'):
                absolute_url = urljoin(url, css_url)
                found_urls.add(absolute_url)
                
                # Update to local path
                local_path = self.get_local_path(absolute_url)
                relative_path = os.path.relpath(local_path, self.get_local_path(url).parent)
                text = text.replace(css_url, relative_path)
        
        # Save modified CSS
        local_path = self.get_local_path(url)
        local_path.parent.mkdir(parents=True, exist_ok=True)
        local_path.write_text(text, encoding='utf-8')
        
        return found_urls
    
    async def crawl_page(self, url: str, depth: int = 0, max_depth: int = 2):
        """Crawl a single page and extract all assets"""
        if url in self.downloaded or depth > max_depth:
            return
        
        # Check if URL is from same domain
        parsed = urlparse(url)
        if parsed.netloc and parsed.netloc != self.domain:
            # Only download assets from external domains, not pages
            if not any(url.endswith(ext) for ext in ['.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf']):
                return
        
        try:
            print(f"\n📄 Processing: {url} (depth: {depth})")
            response = await self.client.get(url)
            
            if response.status_code != 200:
                print(f"  ❌ Failed: HTTP {response.status_code}")
                self.errors.append(f"{url}: HTTP {response.status_code}")
                return
            
            content = response.content
            self.downloaded.add(url)
            self.stats['total_size'] += len(content)
            
            # Process based on content type
            content_type = response.headers.get('content-type', '').lower()
            
            if 'text/html' in content_type:
                self.stats['html_files'] += 1
                # Extract and update links
                found_urls = await self.process_html(url, content)
                
                # Queue pages for crawling
                for found_url in found_urls:
                    parsed = urlparse(found_url)
                    if parsed.netloc == self.domain or not parsed.netloc:
                        # Same domain HTML page
                        if found_url not in self.downloaded and any(found_url.endswith(ext) or '.' not in found_url.split('/')[-1] for ext in ['.html', '.htm', '/']):
                            await self.crawl_page(found_url, depth + 1, max_depth)
                    
                    # Download all assets
                    if found_url not in self.assets_downloaded:
                        self.to_download.add(found_url)
                        
            elif 'text/css' in content_type:
                self.stats['css_files'] += 1
                found_urls = await self.process_css(url, content)
                for found_url in found_urls:
                    if found_url not in self.assets_downloaded:
                        self.to_download.add(found_url)
            else:
                # Just save the file as-is
                local_path = self.get_local_path(url)
                local_path.parent.mkdir(parents=True, exist_ok=True)
                local_path.write_bytes(content)
                
                if any(url.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico']):
                    self.stats['images'] += 1
                elif url.endswith('.js'):
                    self.stats['js_files'] += 1
                else:
                    self.stats['other'] += 1
                    
        except Exception as e:
            print(f"  ❌ Error: {str(e)[:100]}")
            self.errors.append(f"{url}: {str(e)}")
            self.stats['errors'] += 1
    
    async def download_assets(self):
        """Download all queued assets"""
        print(f"\n🎨 Downloading {len(self.to_download)} assets...")
        
        for url in self.to_download:
            if url not in self.assets_downloaded:
                local_path = self.get_local_path(url)
                if await self.download_file(url, local_path):
                    self.assets_downloaded.add(url)
                    
                    # If it's CSS, process it for more URLs
                    if url.endswith('.css') and local_path.exists():
                        content = local_path.read_bytes()
                        found_urls = await self.process_css(url, content)
                        for found_url in found_urls:
                            if found_url not in self.assets_downloaded:
                                asset_path = self.get_local_path(found_url)
                                if await self.download_file(found_url, asset_path):
                                    self.assets_downloaded.add(found_url)
    
    async def download_website(self, max_depth: int = 2):
        """Download entire website"""
        start_time = datetime.now()
        
        print(f"🌐 Starting download of {self.base_url}")
        print(f"📁 Output directory: {self.output_dir}")
        print(f"🔍 Max crawl depth: {max_depth}")
        print("=" * 60)
        
        # Start crawling from base URL
        await self.crawl_page(self.base_url, depth=0, max_depth=max_depth)
        
        # Download all discovered assets
        await self.download_assets()
        
        # Save metadata
        metadata = {
            'base_url': self.base_url,
            'download_date': datetime.now().isoformat(),
            'stats': self.stats,
            'errors': self.errors[:100],  # Save first 100 errors
            'duration': str(datetime.now() - start_time)
        }
        
        metadata_path = self.output_dir / 'download_metadata.json'
        metadata_path.write_text(json.dumps(metadata, indent=2))
        
        # Create index file if not exists
        index_path = self.output_dir / 'index.html'
        if not index_path.exists():
            index_path.symlink_to(self.get_local_path(self.base_url))
        
        print("\n" + "=" * 60)
        print("📊 Download Complete!")
        print(f"  📁 Location: {self.output_dir}")
        print(f"  📄 HTML files: {self.stats['html_files']}")
        print(f"  🎨 CSS files: {self.stats['css_files']}")
        print(f"  📜 JS files: {self.stats['js_files']}")
        print(f"  🖼️  Images: {self.stats['images']}")
        print(f"  📦 Other files: {self.stats['other']}")
        print(f"  💾 Total size: {self.stats['total_size'] / 1024 / 1024:.2f} MB")
        print(f"  ❌ Errors: {self.stats['errors']}")
        print(f"  ⏱️  Duration: {datetime.now() - start_time}")
        print("\n🌐 Open index.html in your browser to view the site offline!")


async def main():
    """Download Apple website"""
    url = "https://www.apple.com"
    
    if len(sys.argv) > 1:
        url = sys.argv[1]
    
    max_depth = 1  # Limit depth to avoid downloading entire internet
    if len(sys.argv) > 2:
        max_depth = int(sys.argv[2])
    
    async with WebsiteDownloader(url) as downloader:
        await downloader.download_website(max_depth=max_depth)


if __name__ == "__main__":
    print("🚀 WebHarvest Full Website Downloader")
    print("=" * 60)
    print("Usage: python download_website.py [URL] [MAX_DEPTH]")
    print("Example: python download_website.py https://apple.com 2")
    print("=" * 60)
    
    asyncio.run(main())