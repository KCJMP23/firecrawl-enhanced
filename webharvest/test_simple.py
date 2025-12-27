#!/usr/bin/env python3
"""
Simple test of WebHarvest scraper using httpx (no browser required)
"""

import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'worker'))

import httpx
from worker.app.scraping.extractor import ContentExtractor

async def test_scrape_apple_simple():
    """Test scraping Apple's website with httpx"""
    print("=" * 60)
    print("WebHarvest Simple Scraper Test - Apple.com")
    print("=" * 60)
    
    extractor = ContentExtractor()
    url = "https://www.apple.com"
    
    try:
        print(f"\n📱 Fetching {url}...")
        
        # Use httpx to fetch the page
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
                },
                timeout=30.0
            )
            
            print(f"✅ Status Code: {response.status_code}")
            
            if response.status_code == 200:
                html = response.text
                print(f"📊 Downloaded: {len(html)} bytes")
                
                # Extract metadata
                metadata = extractor.extract_metadata(html, url)
                print(f"\n📋 Metadata:")
                print(f"  Title: {metadata.get('title', 'N/A')}")
                print(f"  Description: {metadata.get('description', 'N/A')[:100]}...")
                
                # Extract main content
                print(f"\n🔍 Extracting main content...")
                main_content = extractor.extract_main_content(html)
                print(f"  Main content size: {len(main_content)} chars")
                
                # Convert to Markdown
                print(f"\n📝 Converting to Markdown...")
                markdown = extractor.html_to_markdown(main_content)
                print(f"  Markdown size: {len(markdown)} chars")
                
                # Show preview
                print(f"\n📄 Content Preview (first 500 chars):")
                print("-" * 40)
                preview = markdown[:500].strip()
                if preview:
                    print(preview)
                else:
                    # If no markdown, show raw text
                    soup = extractor._get_soup(html)
                    text = soup.get_text()[:500].strip()
                    print(text)
                print("-" * 40)
                
                # Extract links
                links = extractor.extract_links(html, url)
                print(f"\n🔗 Links found: {len(links)}")
                if links:
                    print("  Sample links:")
                    for link in links[:5]:
                        print(f"    - {link}")
                
                # Extract images
                images = extractor.extract_images(html, url)
                print(f"\n🖼️  Images found: {len(images)}")
                if images:
                    print("  Sample images:")
                    for img in images[:5]:
                        print(f"    - {img}")
                
                # Calculate content hash
                content_hash = extractor.calculate_content_hash(markdown or html)
                print(f"\n🔒 Content hash: {content_hash[:32]}...")
                
                print(f"\n✅ Scrape completed successfully!")
                
            else:
                print(f"❌ Failed to fetch page: HTTP {response.status_code}")
                
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 WebHarvest Simple Scraper Test")
    print("=" * 60)
    asyncio.run(test_scrape_apple_simple())