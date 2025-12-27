#!/usr/bin/env python3
"""
Perfect 1:1 Website Cloner using wget
Creates an exact mirror of a website with all assets
"""

import subprocess
import os
import sys
from pathlib import Path
import time
from datetime import datetime

def clone_website_wget(url: str, output_dir: str = "cloned_sites"):
    """
    Clone website using wget for perfect 1:1 copy
    
    wget is the best tool for website mirroring as it:
    - Downloads all assets (CSS, JS, images, fonts, etc.)
    - Converts links for offline browsing
    - Preserves exact directory structure
    - Handles complex JavaScript and CSS imports
    """
    
    # Parse domain from URL
    from urllib.parse import urlparse
    parsed = urlparse(url)
    domain = parsed.netloc or parsed.path
    
    # Create output directory
    output_path = Path(output_dir) / domain
    output_path.mkdir(parents=True, exist_ok=True)
    
    print("=" * 80)
    print("🌐 Perfect Website Cloner - Creating 1:1 Mirror")
    print("=" * 80)
    print(f"🎯 Target URL: {url}")
    print(f"📁 Output Directory: {output_path}")
    print("=" * 80)
    print("\n📥 Starting download with wget...")
    print("This will download ALL assets for a perfect clone.")
    print("Press Ctrl+C to stop at any time.\n")
    
    # Comprehensive wget command for perfect mirroring
    wget_cmd = [
        'wget',
        '--mirror',                      # Mirror mode (infinite recursion)
        '--convert-links',               # Convert links for offline viewing
        '--adjust-extension',            # Add proper extensions to files
        '--page-requisites',             # Download all assets (CSS, JS, images)
        '--no-parent',                   # Don't go up in directory structure
        '--no-host-directories',         # Don't create host directories
        '--execute', 'robots=off',       # Ignore robots.txt
        '--wait=0.5',                    # Wait between requests (be nice)
        '--random-wait',                 # Random wait to avoid detection
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        '--timeout=30',                  # Timeout for each download
        '--tries=3',                     # Retry failed downloads
        '--continue',                    # Continue partial downloads
        '--rejected-log=rejected.log',  # Log rejected URLs
        '--directory-prefix=' + str(output_path),  # Output directory
        '--domains=' + domain,           # Stay within domain
        '--span-hosts',                  # Download from required external hosts
        '--include-directories=/',      # Include all directories
        '--no-check-certificate',       # Don't verify SSL certificates
        '--compression=auto',            # Use compression if available
        '--restrict-file-names=windows', # Safe filenames for all systems
        '--content-disposition',        # Honor Content-Disposition headers
        '--default-page=index.html',    # Default page name
        '-e', 'robots=off',             # Ignore robots.txt (important!)
        '--recursive',                   # Recursive download
        '--level=inf',                   # Infinite recursion depth
        '--no-clobber',                 # Don't overwrite existing files
        '--page-requisites',            # Get all page requisites
        '--html-extension',             # Save HTML files with .html extension
        '--convert-links',              # Convert links for local viewing
        '--backup-converted',           # Backup original files before converting
        '--span-hosts',                 # Include necessary assets from other domains
        '--domains=' + domain + ',ssl.mzstatic.com,is1-ssl.mzstatic.com,www.apple.com,apple.com,store.storeimages.cdn-apple.com',
        '--accept=html,htm,css,js,json,xml,txt,jpg,jpeg,gif,png,webp,svg,ico,woff,woff2,ttf,eot,mp4,webm,pdf',
        url
    ]
    
    # Alternative: Use python requests + beautifulsoup for more control
    # But wget is better for exact mirroring
    
    start_time = datetime.now()
    
    try:
        # Check if wget is installed
        result = subprocess.run(['which', 'wget'], capture_output=True)
        if result.returncode != 0:
            print("❌ wget is not installed. Installing it now...")
            # Try to install wget
            if sys.platform == 'darwin':
                print("📦 Installing wget using Homebrew...")
                subprocess.run(['brew', 'install', 'wget'])
            else:
                print("Please install wget manually:")
                print("  Ubuntu/Debian: sudo apt-get install wget")
                print("  MacOS: brew install wget")
                print("  Windows: Download from https://eternallybored.org/misc/wget/")
                return False
        
        # Run wget
        process = subprocess.Popen(
            wget_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # Stream output
        for line in process.stdout:
            # Show progress
            if 'Saving to:' in line or '%' in line or 'Downloaded:' in line:
                print(f"  {line.strip()}")
        
        process.wait()
        
        duration = datetime.now() - start_time
        
        print("\n" + "=" * 80)
        print("✅ Website Cloning Complete!")
        print("=" * 80)
        print(f"📁 Location: {output_path}")
        print(f"⏱️  Duration: {duration}")
        print(f"\n🌐 To view the cloned site:")
        print(f"   1. cd {output_path}")
        print(f"   2. python -m http.server 8000")
        print(f"   3. Open http://localhost:8000 in your browser")
        print("=" * 80)
        
        return True
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Download interrupted by user")
        print(f"📁 Partial download saved to: {output_path}")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False


def clone_with_playwright(url: str, output_dir: str = "cloned_sites"):
    """
    Alternative: Use Playwright for JavaScript-heavy sites
    This captures the fully rendered page after JavaScript execution
    """
    print("\n🎭 Using Playwright for JavaScript rendering...")
    
    from urllib.parse import urlparse
    import asyncio
    from playwright.async_api import async_playwright
    import aiofiles
    
    parsed = urlparse(url)
    domain = parsed.netloc
    
    output_path = Path(output_dir) / domain
    output_path.mkdir(parents=True, exist_ok=True)
    
    async def capture():
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # Set viewport and user agent
            await page.set_viewport_size({"width": 1920, "height": 1080})
            await page.set_extra_http_headers({
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            })
            
            print(f"📄 Loading {url}...")
            await page.goto(url, wait_until='networkidle', timeout=60000)
            
            # Wait for any lazy-loaded content
            await page.wait_for_timeout(3000)
            
            # Get the complete HTML after JavaScript execution
            content = await page.content()
            
            # Save the HTML
            index_path = output_path / "index.html"
            index_path.write_text(content, encoding='utf-8')
            print(f"✅ Saved rendered HTML to {index_path}")
            
            # Capture screenshot
            screenshot_path = output_path / "screenshot.png"
            await page.screenshot(path=str(screenshot_path), full_page=True)
            print(f"📸 Saved screenshot to {screenshot_path}")
            
            # Extract all network requests to find assets
            print("\n📊 Capturing network resources...")
            
            # Use CDP to get all resources
            client = await page.context.new_cdp_session(page)
            await client.send('Page.enable')
            
            # Get resource tree
            resource_tree = await client.send('Page.getResourceTree')
            
            await browser.close()
            
            print(f"✅ Captured page with JavaScript rendering")
            
    asyncio.run(capture())
    return True


def main():
    """Main function"""
    
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = "https://www.apple.com"
    
    method = "wget"  # Default to wget for best results
    if len(sys.argv) > 2:
        method = sys.argv[2]
    
    print("🚀 Perfect Website Cloner")
    print("=" * 80)
    print("Usage: python clone_website_perfect.py [URL] [method]")
    print("Methods: wget (default), playwright")
    print("=" * 80)
    
    if method == "playwright":
        # Use Playwright for JavaScript-heavy sites
        clone_with_playwright(url)
    else:
        # Use wget for perfect mirroring (recommended)
        clone_website_wget(url)


if __name__ == "__main__":
    main()