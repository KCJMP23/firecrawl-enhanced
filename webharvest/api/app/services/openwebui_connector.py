"""
OpenWebUI connector service for syncing scraped content to knowledge collections
"""

import os
import io
import zipfile
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import httpx
import asyncio

logger = logging.getLogger(__name__)

class OpenWebUIConnector:
    """Connect and sync with OpenWebUI instance"""
    
    def __init__(self):
        self.base_url = os.getenv("OPENWEBUI_BASE_URL", "http://openwebui:8080")
        self.api_key = os.getenv("OPENWEBUI_API_KEY", "")
        self.timeout = 30.0
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def upload_file(
        self,
        filename: str,
        content: bytes,
        content_type: str = "text/markdown"
    ) -> Optional[str]:
        """
        Upload a file to OpenWebUI
        
        Args:
            filename: Name of the file
            content: File content as bytes
            content_type: MIME type of the content
            
        Returns:
            File ID if successful, None otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                files = {
                    "file": (filename, content, content_type)
                }
                headers = {
                    "Authorization": f"Bearer {self.api_key}"
                }
                
                response = await client.post(
                    f"{self.base_url}/api/v1/files/",
                    files=files,
                    headers=headers
                )
                
                if response.status_code == 200:
                    result = response.json()
                    file_id = result.get("id")
                    logger.info(f"Uploaded file {filename} to OpenWebUI: {file_id}")
                    return file_id
                else:
                    logger.error(f"Failed to upload file: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error uploading file to OpenWebUI: {e}")
            return None
    
    async def add_file_to_collection(
        self,
        collection_id: str,
        file_id: str
    ) -> bool:
        """
        Add a file to a knowledge collection
        
        Args:
            collection_id: Knowledge collection ID
            file_id: File ID to add
            
        Returns:
            True if successful, False otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/v1/knowledge/{collection_id}/file/add",
                    json={"file_id": file_id},
                    headers=self._get_headers()
                )
                
                if response.status_code == 200:
                    logger.info(f"Added file {file_id} to collection {collection_id}")
                    return True
                else:
                    logger.error(f"Failed to add file to collection: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error adding file to collection: {e}")
            return False
    
    async def create_collection(
        self,
        name: str,
        description: str = ""
    ) -> Optional[str]:
        """
        Create a new knowledge collection
        
        Args:
            name: Collection name
            description: Collection description
            
        Returns:
            Collection ID if successful, None otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/v1/knowledge/",
                    json={
                        "name": name,
                        "description": description,
                        "created_at": datetime.utcnow().isoformat()
                    },
                    headers=self._get_headers()
                )
                
                if response.status_code == 200:
                    result = response.json()
                    collection_id = result.get("id")
                    logger.info(f"Created knowledge collection: {collection_id}")
                    return collection_id
                else:
                    logger.error(f"Failed to create collection: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error creating collection: {e}")
            return None
    
    async def sync_crawl_to_collection(
        self,
        crawl_id: str,
        collection_id: str,
        pages: List[Dict[str, Any]],
        mode: str = "bundle_zip",
        title_prefix: str = ""
    ) -> Dict[str, Any]:
        """
        Sync crawl results to OpenWebUI knowledge collection
        
        Args:
            crawl_id: Crawl job ID
            collection_id: Target collection ID
            pages: List of page results with url, markdown, metadata
            mode: "per_page" or "bundle_zip"
            title_prefix: Prefix for file titles
            
        Returns:
            Result dictionary with success status and details
        """
        if not pages:
            return {
                "success": False,
                "error": "No pages to sync"
            }
        
        try:
            if mode == "bundle_zip":
                # Create a ZIP file with all pages
                return await self._sync_as_bundle(
                    crawl_id, collection_id, pages, title_prefix
                )
            else:
                # Upload each page as a separate file
                return await self._sync_per_page(
                    crawl_id, collection_id, pages, title_prefix
                )
                
        except Exception as e:
            logger.error(f"Error syncing crawl to collection: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _sync_as_bundle(
        self,
        crawl_id: str,
        collection_id: str,
        pages: List[Dict[str, Any]],
        title_prefix: str
    ) -> Dict[str, Any]:
        """Sync pages as a bundled ZIP file"""
        
        # Create ZIP in memory
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Add metadata
            metadata = {
                "crawl_id": crawl_id,
                "created_at": datetime.utcnow().isoformat(),
                "page_count": len(pages),
                "urls": [p.get("url") for p in pages]
            }
            zip_file.writestr("metadata.json", json.dumps(metadata, indent=2))
            
            # Add each page as a markdown file
            for i, page in enumerate(pages):
                url = page.get("url", f"page_{i}")
                markdown = page.get("markdown", "")
                
                # Create filename from URL
                filename = self._url_to_filename(url)
                
                # Add frontmatter to markdown
                page_metadata = page.get("metadata", {})
                frontmatter = f"""---
title: {page_metadata.get('title', 'Untitled')}
url: {url}
scraped_at: {datetime.utcnow().isoformat()}
---

"""
                content = frontmatter + markdown
                
                zip_file.writestr(f"pages/{filename}", content)
        
        # Upload ZIP file
        zip_buffer.seek(0)
        filename = f"{title_prefix}crawl_{crawl_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.zip"
        
        file_id = await self.upload_file(
            filename=filename,
            content=zip_buffer.getvalue(),
            content_type="application/zip"
        )
        
        if not file_id:
            return {
                "success": False,
                "error": "Failed to upload ZIP file"
            }
        
        # Add to collection
        added = await self.add_file_to_collection(collection_id, file_id)
        
        return {
            "success": added,
            "file_id": file_id,
            "filename": filename,
            "pages_count": len(pages),
            "mode": "bundle_zip"
        }
    
    async def _sync_per_page(
        self,
        crawl_id: str,
        collection_id: str,
        pages: List[Dict[str, Any]],
        title_prefix: str
    ) -> Dict[str, Any]:
        """Sync each page as a separate file"""
        
        uploaded_files = []
        failed_uploads = []
        
        for page in pages:
            url = page.get("url", "")
            markdown = page.get("markdown", "")
            metadata = page.get("metadata", {})
            
            # Create filename
            filename = f"{title_prefix}{self._url_to_filename(url)}"
            
            # Add frontmatter
            frontmatter = f"""---
title: {metadata.get('title', 'Untitled')}
url: {url}
description: {metadata.get('description', '')}
scraped_at: {datetime.utcnow().isoformat()}
crawl_id: {crawl_id}
---

"""
            content = frontmatter + markdown
            
            # Upload file
            file_id = await self.upload_file(
                filename=filename,
                content=content.encode('utf-8'),
                content_type="text/markdown"
            )
            
            if file_id:
                # Add to collection
                added = await self.add_file_to_collection(collection_id, file_id)
                if added:
                    uploaded_files.append({
                        "file_id": file_id,
                        "filename": filename,
                        "url": url
                    })
                else:
                    failed_uploads.append(url)
            else:
                failed_uploads.append(url)
        
        return {
            "success": len(uploaded_files) > 0,
            "uploaded_count": len(uploaded_files),
            "failed_count": len(failed_uploads),
            "uploaded_files": uploaded_files,
            "failed_urls": failed_uploads,
            "mode": "per_page"
        }
    
    def _url_to_filename(self, url: str) -> str:
        """Convert URL to a safe filename"""
        # Remove protocol
        url = url.replace("https://", "").replace("http://", "")
        # Replace special characters
        url = url.replace("/", "_").replace("?", "_").replace("&", "_")
        url = url.replace(":", "_").replace("=", "_").replace("#", "_")
        # Limit length
        if len(url) > 100:
            url = url[:100]
        # Add .md extension if not present
        if not url.endswith(".md"):
            url += ".md"
        return url
    
    async def list_collections(self) -> List[Dict[str, Any]]:
        """
        List all knowledge collections
        
        Returns:
            List of collection dictionaries
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/v1/knowledge/",
                    headers=self._get_headers()
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to list collections: {response.status_code}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error listing collections: {e}")
            return []
    
    async def test_connection(self) -> bool:
        """
        Test connection to OpenWebUI
        
        Returns:
            True if connection successful
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(
                    f"{self.base_url}/api/v1/health/",
                    headers=self._get_headers()
                )
                
                return response.status_code == 200
                
        except Exception:
            return False