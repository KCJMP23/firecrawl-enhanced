#!/usr/bin/env python3
"""
Simple test script for the WebHarvest scraper
Tests basic functionality without full Docker setup
"""

import asyncio
import sys
import os

# Add the worker directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'worker'))

from worker.app.scraping.scraper import WebScraper
from worker.app.scraping.extractor import ContentExtractor

async def test_scrape_apple():
    """Test scraping Apple's website"""
    print("=" * 60)
    print("WebHarvest Scraper Test - Apple.com")
    print("=" * 60)
    
    # Initialize scraper
    scraper = WebScraper()
    extractor = ContentExtractor()
    
    try:
        print("\n📱 Scraping Apple.com...")
        print("URL: https://www.apple.com")
        
        # Perform scrape
        result = await scraper.scrape(
            url="https://www.apple.com",
            formats=["markdown", "links", "images"],
            only_main_content=True,
            wait_for=2000  # Wait 2 seconds for dynamic content
        )
        
        if result["success"]:
            print("\n✅ Scrape successful!")
            
            # Display metadata
            metadata = result["data"].get("metadata", {})
            print(f"\n📊 Metadata:")
            print(f"  Title: {metadata.get('title', 'N/A')}")
            print(f"  Description: {metadata.get('description', 'N/A')[:100]}...")
            print(f"  Status Code: {metadata.get('statusCode', 'N/A')}")
            
            # Display content preview
            markdown = result["data"].get("markdown", "")
            print(f"\n📄 Content Preview (first 500 chars):")
            print("-" * 40)
            print(markdown[:500])
            print("-" * 40)
            
            # Display links found
            links = result["data"].get("links", [])
            print(f"\n🔗 Links found: {len(links)}")
            if links:
                print("  Sample links:")
                for link in links[:5]:
                    print(f"    - {link}")
            
            # Display images found
            images = result["data"].get("images", [])
            print(f"\n🖼️  Images found: {len(images)}")
            if images:
                print("  Sample images:")
                for img in images[:5]:
                    print(f"    - {img}")
            
            # Test content extraction
            print("\n🔍 Testing content extraction...")
            html = result["data"].get("html", "")
            if html:
                # Extract clean content
                clean_content = extractor.extract_main_content(html)
                print(f"  Extracted main content: {len(clean_content)} chars")
                
                # Calculate content hash
                content_hash = extractor.calculate_content_hash(markdown)
                print(f"  Content hash: {content_hash[:16]}...")
                
                # Extract all links
                all_links = extractor.extract_links(html, "https://www.apple.com")
                print(f"  Total links extracted: {len(all_links)}")
        else:
            print(f"\n❌ Scrape failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"\n❌ Error during scrape: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Clean up if cleanup method exists
        if hasattr(scraper, 'cleanup'):
            await scraper.cleanup()
            print("\n🧹 Cleanup complete")
        else:
            print("\n✅ Test complete")

async def test_without_browser():
    """Test basic functionality without browser"""
    print("\n" + "=" * 60)
    print("Testing Content Extraction (without browser)")
    print("=" * 60)
    
    extractor = ContentExtractor()
    
    # Test HTML with sample Apple-like content
    sample_html = """
    <html>
    <head>
        <title>Apple - Think Different</title>
        <meta name="description" content="Discover the innovative world of Apple.">
    </head>
    <body>
        <header>
            <nav>
                <a href="/mac">Mac</a>
                <a href="/iphone">iPhone</a>
                <a href="/ipad">iPad</a>
            </nav>
        </header>
        <main>
            <h1>Welcome to Apple</h1>
            <p>Discover our latest products and innovations.</p>
            <div class="products">
                <div class="product">
                    <h2>iPhone 15 Pro</h2>
                    <p>Titanium. So strong. So light. So Pro.</p>
                    <img src="/images/iphone15pro.jpg" alt="iPhone 15 Pro">
                </div>
            </div>
        </main>
    </body>
    </html>
    """
    
    # Test metadata extraction
    print("\n📊 Testing metadata extraction...")
    metadata = extractor.extract_metadata(sample_html, "https://www.apple.com")
    print(f"  Title: {metadata.get('title')}")
    print(f"  Description: {metadata.get('description')}")
    
    # Test HTML to Markdown
    print("\n📝 Testing HTML to Markdown conversion...")
    markdown = extractor.html_to_markdown(sample_html)
    print(f"  Markdown output:\n{markdown}")
    
    # Test link extraction
    print("\n🔗 Testing link extraction...")
    links = extractor.extract_links(sample_html, "https://www.apple.com")
    print(f"  Links found: {links}")
    
    # Test content hash
    print("\n🔒 Testing content hash...")
    hash1 = extractor.calculate_content_hash("Test content")
    hash2 = extractor.calculate_content_hash("Test content")
    hash3 = extractor.calculate_content_hash("Different content")
    print(f"  Same content same hash: {hash1 == hash2}")
    print(f"  Different content different hash: {hash1 != hash3}")

if __name__ == "__main__":
    print("🚀 WebHarvest Scraper Test Suite")
    print("================================\n")
    
    # Check if we should run full browser test
    if len(sys.argv) > 1 and sys.argv[1] == "--full":
        print("Running full test with browser (requires Playwright)...")
        asyncio.run(test_scrape_apple())
    else:
        print("Running basic tests without browser...")
        print("Use --full flag to run browser-based scraping test")
        asyncio.run(test_without_browser())