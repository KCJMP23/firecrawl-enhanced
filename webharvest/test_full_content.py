#!/usr/bin/env python3
"""
Full content test - shows complete scraped content from Apple.com
"""

import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'worker'))

import httpx
from bs4 import BeautifulSoup
from worker.app.scraping.extractor import ContentExtractor

async def test_scrape_full_content():
    """Test scraping and show full content"""
    print("=" * 80)
    print("WebHarvest Full Content Scraper - Apple.com")
    print("=" * 80)
    
    extractor = ContentExtractor()
    url = "https://www.apple.com"
    
    try:
        print(f"\n🌐 Fetching {url}...")
        
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                timeout=30.0
            )
            
            print(f"✅ Status Code: {response.status_code}")
            
            if response.status_code == 200:
                html = response.text
                print(f"📦 Downloaded: {len(html):,} bytes")
                
                # Parse with BeautifulSoup
                soup = BeautifulSoup(html, 'lxml')
                
                # Extract metadata
                print(f"\n" + "="*80)
                print("📋 PAGE METADATA")
                print("="*80)
                metadata = extractor.extract_metadata(html, url)
                for key, value in metadata.items():
                    if value:
                        print(f"  {key}: {str(value)[:100]}")
                
                # Extract raw text content
                print(f"\n" + "="*80)
                print("📝 RAW TEXT CONTENT (first 2000 chars)")
                print("="*80)
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                text_content = soup.get_text()
                # Clean up whitespace
                lines = (line.strip() for line in text_content.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                text_content = ' '.join(chunk for chunk in chunks if chunk)
                print(text_content[:2000])
                
                # Try different content extraction methods
                print(f"\n" + "="*80)
                print("🎯 MAIN CONTENT EXTRACTION ATTEMPTS")
                print("="*80)
                
                # Method 1: Look for main content areas
                main_areas = ['main', 'article', 'section']
                for area in main_areas:
                    elements = soup.find_all(area)
                    if elements:
                        print(f"\n  Found {len(elements)} <{area}> element(s)")
                        for i, elem in enumerate(elements[:2]):  # Show first 2
                            text = elem.get_text(strip=True)[:300]
                            if text:
                                print(f"    [{area} {i+1}]: {text}...")
                
                # Method 2: Look for divs with specific classes
                print(f"\n  Looking for content divs...")
                content_divs = soup.find_all('div', class_=lambda x: x and any(
                    keyword in x.lower() for keyword in ['content', 'main', 'hero', 'product']
                ))
                if content_divs:
                    print(f"  Found {len(content_divs)} content div(s)")
                    for i, div in enumerate(content_divs[:3]):
                        text = div.get_text(strip=True)[:200]
                        if text:
                            classes = div.get('class', [])
                            print(f"    [div.{'.'.join(classes[:2])}]: {text}...")
                
                # Extract navigation links
                print(f"\n" + "="*80)
                print("🔗 NAVIGATION & PRODUCT LINKS")
                print("="*80)
                nav_links = soup.find_all('a', href=True)[:30]
                seen_texts = set()
                for link in nav_links:
                    text = link.get_text(strip=True)
                    href = link['href']
                    if text and text not in seen_texts and len(text) > 2:
                        seen_texts.add(text)
                        if href.startswith('/'):
                            href = f"https://www.apple.com{href}"
                        print(f"  [{text}]: {href}")
                
                # Extract product information
                print(f"\n" + "="*80)
                print("🛍️ PRODUCT INFORMATION")
                print("="*80)
                
                # Look for headings
                headings = soup.find_all(['h1', 'h2', 'h3'])[:10]
                if headings:
                    print(f"  Found {len(headings)} headings:")
                    for h in headings:
                        text = h.get_text(strip=True)
                        if text:
                            print(f"    <{h.name}>: {text}")
                
                # Extract images with alt text
                print(f"\n" + "="*80)
                print("🖼️ IMAGES WITH DESCRIPTIONS")
                print("="*80)
                images = soup.find_all('img', alt=True)[:10]
                for img in images:
                    alt = img.get('alt', '').strip()
                    src = img.get('src', '')
                    if alt and len(alt) > 5:  # Skip empty or very short alt texts
                        if not src.startswith('http'):
                            src = f"https://www.apple.com{src}" if src.startswith('/') else src
                        print(f"  [{alt}]")
                        print(f"    {src[:80]}...")
                
                # Try to find Apple-specific content
                print(f"\n" + "="*80)
                print("🍎 APPLE-SPECIFIC CONTENT")
                print("="*80)
                
                # Look for product tiles or cards
                product_cards = soup.find_all(class_=lambda x: x and 'unit' in str(x).lower())
                if product_cards:
                    print(f"  Found {len(product_cards)} product units")
                    for i, card in enumerate(product_cards[:3]):
                        text = card.get_text(strip=True)[:150]
                        if text:
                            print(f"    Product {i+1}: {text}...")
                
                print(f"\n" + "="*80)
                print("✅ SCRAPING COMPLETE")
                print("="*80)
                print(f"  Total HTML size: {len(html):,} bytes")
                print(f"  Total text extracted: {len(text_content):,} chars")
                print(f"  Total links found: {len(soup.find_all('a', href=True))}")
                print(f"  Total images found: {len(soup.find_all('img'))}")
                
            else:
                print(f"❌ Failed to fetch page: HTTP {response.status_code}")
                
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_scrape_full_content())