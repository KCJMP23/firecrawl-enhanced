#!/usr/bin/env python3
"""
Clone website with all assets embedded
Creates a single-file HTML with all CSS, JS, and images embedded
"""

import asyncio
import httpx
from bs4 import BeautifulSoup
import base64
from urllib.parse import urljoin, urlparse
from pathlib import Path
import re
import json

async def download_and_embed_assets(url: str, output_dir: str = "perfect_clone"):
    """
    Download webpage and embed all assets inline
    """
    
    print("=" * 80)
    print("🎯 Perfect Website Cloner - Embedding All Assets")
    print("=" * 80)
    print(f"📍 URL: {url}")
    print("=" * 80)
    
    # Parse domain
    parsed = urlparse(url)
    domain = parsed.netloc
    
    # Create output directory
    output_path = Path(output_dir) / domain
    output_path.mkdir(parents=True, exist_ok=True)
    
    async with httpx.AsyncClient(
        timeout=30.0,
        follow_redirects=True,
        verify=False,
        headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
    ) as client:
        
        # Download main page
        print(f"\n📄 Downloading main page...")
        response = await client.get(url)
        html = response.text
        soup = BeautifulSoup(html, 'lxml')
        
        # Track what we've downloaded
        assets_downloaded = 0
        total_size = len(html)
        
        # Process all CSS files
        print(f"\n🎨 Processing CSS files...")
        for link in soup.find_all('link', rel='stylesheet'):
            href = link.get('href')
            if href:
                css_url = urljoin(url, href)
                try:
                    print(f"  ⬇️  {css_url[:80]}...")
                    css_response = await client.get(css_url)
                    css_content = css_response.text
                    
                    # Process CSS to embed any url() references
                    css_content = await process_css_urls(css_content, css_url, client)
                    
                    # Embed CSS inline
                    style_tag = soup.new_tag('style')
                    style_tag.string = css_content
                    link.replace_with(style_tag)
                    assets_downloaded += 1
                    total_size += len(css_content)
                except Exception as e:
                    print(f"    ❌ Failed: {e}")
        
        # Process all images
        print(f"\n🖼️  Processing images...")
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src')
            if src:
                img_url = urljoin(url, src)
                try:
                    print(f"  ⬇️  {img_url[:80]}...")
                    img_response = await client.get(img_url)
                    img_data = img_response.content
                    
                    # Determine content type
                    content_type = img_response.headers.get('content-type', 'image/jpeg')
                    
                    # Encode as base64 data URL
                    b64_data = base64.b64encode(img_data).decode('utf-8')
                    data_url = f"data:{content_type};base64,{b64_data}"
                    
                    img['src'] = data_url
                    if img.get('data-src'):
                        img['data-src'] = data_url
                    
                    assets_downloaded += 1
                    total_size += len(img_data)
                except Exception as e:
                    print(f"    ❌ Failed: {e}")
        
        # Process srcset attributes
        for elem in soup.find_all(attrs={'srcset': True}):
            srcset = elem.get('srcset')
            if srcset:
                new_srcset = await process_srcset(srcset, url, client)
                elem['srcset'] = new_srcset
        
        # Process all JavaScript files
        print(f"\n📜 Processing JavaScript files...")
        for script in soup.find_all('script', src=True):
            src = script.get('src')
            if src:
                js_url = urljoin(url, src)
                try:
                    print(f"  ⬇️  {js_url[:80]}...")
                    js_response = await client.get(js_url)
                    js_content = js_response.text
                    
                    # Embed JS inline
                    script['src'] = None
                    script.string = js_content
                    assets_downloaded += 1
                    total_size += len(js_content)
                except Exception as e:
                    print(f"    ❌ Failed: {e}")
        
        # Process inline styles with background images
        print(f"\n🎨 Processing inline styles...")
        for elem in soup.find_all(style=True):
            style = elem.get('style')
            if style and 'url(' in style:
                elem['style'] = await process_css_urls(style, url, client)
        
        # Process style tags
        for style_tag in soup.find_all('style'):
            if style_tag.string and 'url(' in style_tag.string:
                style_tag.string = await process_css_urls(style_tag.string, url, client)
        
        # Save the complete HTML with embedded assets
        output_file = output_path / "index.html"
        output_file.write_text(str(soup), encoding='utf-8')
        
        # Also save a backup of original
        original_file = output_path / "original.html"
        original_file.write_text(html, encoding='utf-8')
        
        print(f"\n" + "=" * 80)
        print(f"✅ Clone Complete!")
        print(f"  📁 Location: {output_file}")
        print(f"  📊 Assets embedded: {assets_downloaded}")
        print(f"  💾 Total size: {total_size / 1024 / 1024:.2f} MB")
        print(f"\n🌐 To view: open {output_file}")
        print("=" * 80)

async def process_css_urls(css_content: str, base_url: str, client):
    """
    Process CSS content and embed url() references as data URLs
    """
    # Find all url() references
    url_pattern = re.compile(r'url\(["\']?([^"\'()]+)["\']?\)')
    
    for match in url_pattern.finditer(css_content):
        resource_url = match.group(1)
        if not resource_url.startswith('data:'):
            absolute_url = urljoin(base_url, resource_url)
            try:
                # Download resource
                response = await client.get(absolute_url)
                content = response.content
                content_type = response.headers.get('content-type', 'application/octet-stream')
                
                # Convert to data URL
                b64_data = base64.b64encode(content).decode('utf-8')
                data_url = f"data:{content_type};base64,{b64_data}"
                
                # Replace in CSS
                css_content = css_content.replace(match.group(0), f'url({data_url})')
            except:
                pass  # Keep original URL if download fails
    
    return css_content

async def process_srcset(srcset: str, base_url: str, client):
    """
    Process srcset attribute and convert to data URLs
    """
    new_srcset_parts = []
    
    for part in srcset.split(','):
        parts = part.strip().split()
        if parts:
            img_url = parts[0]
            descriptor = parts[1] if len(parts) > 1 else ''
            
            if not img_url.startswith('data:'):
                absolute_url = urljoin(base_url, img_url)
                try:
                    response = await client.get(absolute_url)
                    content = response.content
                    content_type = response.headers.get('content-type', 'image/jpeg')
                    
                    b64_data = base64.b64encode(content).decode('utf-8')
                    data_url = f"data:{content_type};base64,{b64_data}"
                    
                    new_srcset_parts.append(f"{data_url} {descriptor}".strip())
                except:
                    new_srcset_parts.append(part.strip())
            else:
                new_srcset_parts.append(part.strip())
    
    return ', '.join(new_srcset_parts)

async def main():
    """Main function"""
    url = "https://www.apple.com"
    await download_and_embed_assets(url)

if __name__ == "__main__":
    asyncio.run(main())