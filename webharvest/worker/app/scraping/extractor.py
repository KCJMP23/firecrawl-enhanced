"""
Content extraction module for web pages
Handles HTML parsing, main content extraction, and conversion to various formats
"""

import re
import hashlib
from typing import Dict, Any, List, Optional
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from readability import Document
import markdownify
import logging

logger = logging.getLogger(__name__)

class ContentExtractor:
    """Extract and process content from web pages"""
    
    @staticmethod
    def extract_main_content(html: str, url: str = "") -> str:
        """
        Extract main content from HTML using Readability algorithm
        
        Args:
            html: Raw HTML content
            url: Source URL for relative link resolution
            
        Returns:
            Cleaned HTML of main content
        """
        try:
            doc = Document(html, url=url)
            result = doc.summary()
            return result
        except Exception as e:
            logger.error(f"Readability extraction failed: {e}")
            # Fallback to basic extraction
            soup = BeautifulSoup(html, 'lxml')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Try to find main content areas
            main_content = (
                soup.find('main') or
                soup.find('article') or
                soup.find('div', {'class': re.compile(r'content|main|body', re.I)}) or
                soup.find('div', {'id': re.compile(r'content|main|body', re.I)}) or
                soup.body
            )
            
            if main_content:
                return str(main_content)
            
            return html
    
    @staticmethod
    def html_to_markdown(html: str, base_url: str = "") -> str:
        """
        Convert HTML to Markdown
        
        Args:
            html: HTML content to convert
            base_url: Base URL for resolving relative links
            
        Returns:
            Markdown formatted text
        """
        try:
            # Configure markdownify options
            markdown = markdownify.markdownify(
                html,
                heading_style="ATX",
                bullets="-",
                code_language="",
                strip=["script", "style", "meta", "link"],
                wrap=True,
                wrap_width=80
            )
            
            # Clean up excessive whitespace
            markdown = re.sub(r'\n{3,}', '\n\n', markdown)
            markdown = re.sub(r'[ \t]+', ' ', markdown)
            
            # Fix relative links if base_url provided
            if base_url:
                markdown = ContentExtractor._fix_relative_links(markdown, base_url)
            
            return markdown.strip()
            
        except Exception as e:
            logger.error(f"Markdown conversion failed: {e}")
            # Fallback to simple text extraction
            soup = BeautifulSoup(html, 'lxml')
            return soup.get_text(separator='\n', strip=True)
    
    @staticmethod
    def extract_links(html: str, base_url: str = "") -> List[str]:
        """
        Extract all links from HTML
        
        Args:
            html: HTML content
            base_url: Base URL for resolving relative links
            
        Returns:
            List of absolute URLs
        """
        links = []
        soup = BeautifulSoup(html, 'lxml')
        
        for link in soup.find_all(['a', 'link']):
            href = link.get('href')
            if href:
                # Make absolute URL
                if base_url:
                    href = urljoin(base_url, href)
                
                # Filter out non-HTTP(S) links
                if href.startswith(('http://', 'https://')):
                    links.append(href)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_links = []
        for link in links:
            if link not in seen:
                seen.add(link)
                unique_links.append(link)
        
        return unique_links
    
    @staticmethod
    def extract_images(html: str, base_url: str = "") -> List[str]:
        """
        Extract all image URLs from HTML
        
        Args:
            html: HTML content
            base_url: Base URL for resolving relative links
            
        Returns:
            List of absolute image URLs
        """
        images = []
        soup = BeautifulSoup(html, 'lxml')
        
        for img in soup.find_all(['img', 'picture']):
            # Try different attributes
            src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            
            if src:
                # Make absolute URL
                if base_url:
                    src = urljoin(base_url, src)
                
                # Filter valid image URLs
                if src.startswith(('http://', 'https://', 'data:')):
                    images.append(src)
            
            # Also check srcset for responsive images
            srcset = img.get('srcset')
            if srcset:
                for part in srcset.split(','):
                    url = part.strip().split(' ')[0]
                    if base_url:
                        url = urljoin(base_url, url)
                    if url.startswith(('http://', 'https://')):
                        images.append(url)
        
        # Remove duplicates
        return list(dict.fromkeys(images))
    
    @staticmethod
    def extract_metadata(html: str, url: str = "") -> Dict[str, Any]:
        """
        Extract metadata from HTML
        
        Args:
            html: HTML content
            url: Source URL
            
        Returns:
            Dictionary of metadata
        """
        soup = BeautifulSoup(html, 'lxml')
        metadata = {
            "sourceURL": url,
            "title": None,
            "description": None,
            "keywords": None,
            "author": None,
            "language": None,
            "publishedDate": None,
            "modifiedDate": None,
            "favicon": None
        }
        
        # Extract title
        title_tag = soup.find('title')
        if title_tag:
            metadata["title"] = title_tag.get_text(strip=True)
        
        # Extract meta tags
        for meta in soup.find_all('meta'):
            name = meta.get('name', '').lower()
            property = meta.get('property', '').lower()
            content = meta.get('content', '')
            
            if not content:
                continue
            
            # Description
            if name == 'description' or property == 'og:description':
                metadata["description"] = content
            
            # Keywords
            elif name == 'keywords':
                metadata["keywords"] = content
            
            # Author
            elif name == 'author' or property == 'article:author':
                metadata["author"] = content
            
            # Language
            elif name == 'language' or property == 'og:locale':
                metadata["language"] = content[:2] if content else None
            
            # Dates
            elif property == 'article:published_time':
                metadata["publishedDate"] = content
            elif property == 'article:modified_time':
                metadata["modifiedDate"] = content
            
            # OpenGraph title (fallback)
            elif property == 'og:title' and not metadata["title"]:
                metadata["title"] = content
        
        # Extract language from html tag
        if not metadata["language"]:
            html_tag = soup.find('html')
            if html_tag:
                lang = html_tag.get('lang', '').lower()
                if lang:
                    metadata["language"] = lang[:2]
        
        # Extract favicon
        favicon_link = soup.find('link', rel=re.compile(r'icon', re.I))
        if favicon_link:
            favicon_url = favicon_link.get('href')
            if favicon_url and url:
                metadata["favicon"] = urljoin(url, favicon_url)
        
        return metadata
    
    @staticmethod
    def filter_by_tags(
        html: str,
        include_tags: Optional[List[str]] = None,
        exclude_tags: Optional[List[str]] = None
    ) -> str:
        """
        Filter HTML content by including/excluding specific tags
        
        Args:
            html: HTML content to filter
            include_tags: List of tags to include (if specified, only these are kept)
            exclude_tags: List of tags to exclude
            
        Returns:
            Filtered HTML
        """
        soup = BeautifulSoup(html, 'lxml')
        
        # Remove excluded tags
        if exclude_tags:
            for tag_name in exclude_tags:
                for tag in soup.find_all(tag_name):
                    tag.decompose()
        
        # Keep only included tags
        if include_tags:
            # Create a new soup with only included content
            new_soup = BeautifulSoup('<div></div>', 'lxml')
            container = new_soup.div
            
            for tag_name in include_tags:
                for tag in soup.find_all(tag_name):
                    container.append(tag)
            
            return str(container)
        
        return str(soup)
    
    @staticmethod
    def calculate_content_hash(content: str) -> str:
        """
        Calculate SHA256 hash of content
        
        Args:
            content: Text content to hash
            
        Returns:
            Hexadecimal hash string
        """
        return hashlib.sha256(content.encode('utf-8')).hexdigest()
    
    @staticmethod
    def _fix_relative_links(markdown: str, base_url: str) -> str:
        """
        Convert relative links to absolute in markdown
        
        Args:
            markdown: Markdown text with potentially relative links
            base_url: Base URL for resolution
            
        Returns:
            Markdown with absolute links
        """
        # Fix markdown links [text](url)
        def replace_md_link(match):
            text = match.group(1)
            url = match.group(2)
            absolute_url = urljoin(base_url, url)
            return f"[{text}]({absolute_url})"
        
        markdown = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', replace_md_link, markdown)
        
        # Fix reference-style links [text][ref]
        # This is more complex and might need full markdown parsing
        # For now, we'll leave reference links as-is
        
        return markdown
    
    @staticmethod
    def clean_text(text: str) -> str:
        """
        Clean text by removing excessive whitespace and special characters
        
        Args:
            text: Text to clean
            
        Returns:
            Cleaned text
        """
        # Remove null bytes
        text = text.replace('\x00', '')
        
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove control characters
        text = ''.join(char for char in text if ord(char) >= 32 or char in '\n\r\t')
        
        return text.strip()