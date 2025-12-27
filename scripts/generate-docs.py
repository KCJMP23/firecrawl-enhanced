#!/usr/bin/env python3
"""
Documentation Generation Script for Firecrawl Clone Platform
===========================================================

This script automates the generation of comprehensive documentation
including API specs, architecture diagrams, and integration guides.

Usage:
    python scripts/generate-docs.py [options]

Options:
    --webharvest-only    Generate only WebHarvest documentation
    --webclone-only     Generate only WebClone Pro documentation
    --api-only          Generate only API documentation
    --diagrams-only     Generate only architecture diagrams
    --force-rebuild     Force complete rebuild ignoring cache
    --output-dir DIR    Custom output directory (default: docs/)
    --format FORMAT     Output format: html, pdf, markdown (default: html,markdown)

Examples:
    python scripts/generate-docs.py
    python scripts/generate-docs.py --api-only --output-dir ./api-docs
    python scripts/generate-docs.py --force-rebuild --format pdf
"""

import argparse
import json
import logging
import os
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional
import yaml

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DocumentationGenerator:
    """Main documentation generator class."""
    
    def __init__(self, output_dir: str = "docs", formats: List[str] = None):
        """Initialize the documentation generator.
        
        Args:
            output_dir: Output directory for generated documentation
            formats: List of output formats (html, pdf, markdown)
        """
        self.output_dir = Path(output_dir)
        self.formats = formats or ["html", "markdown"]
        self.project_root = Path(__file__).parent.parent
        self.webharvest_dir = self.project_root / "webharvest"
        self.webclone_dir = self.project_root / "webclone-pro"
        
        # Ensure output directories exist
        self.api_dir = self.output_dir / "api"
        self.diagrams_dir = self.output_dir / "diagrams"
        self.site_dir = self.output_dir / "site"
        
        for directory in [self.api_dir, self.diagrams_dir, self.site_dir]:
            directory.mkdir(parents=True, exist_ok=True)
    
    def generate_webharvest_openapi(self) -> bool:
        """Generate OpenAPI specification for WebHarvest API."""
        logger.info("🔧 Generating WebHarvest OpenAPI specification...")
        
        try:
            # Change to webharvest directory
            os.chdir(self.webharvest_dir)
            
            # Generate OpenAPI spec using FastAPI
            script = """
import sys
sys.path.append('.')
from app.main import app
import json

# Generate OpenAPI spec
openapi_spec = app.openapi()

# Add custom metadata
openapi_spec['info']['title'] = 'WebHarvest API'
openapi_spec['info']['description'] = '''
# WebHarvest API Documentation

Self-hosted web scraping platform with MCP (Model Context Protocol) integration.

## Features
- 🕷️ Advanced web scraping with Playwright
- 🤖 MCP server integration for AI workflows
- 📊 Real-time progress tracking
- 🔄 Batch processing capabilities
- 🗄️ Persistent storage and caching
- 📡 WebSocket support for real-time updates

## Authentication
All API endpoints require Bearer token authentication with the `wh_` prefix:
```
Authorization: Bearer wh_your_api_key_here
```

## Rate Limiting
- Default: 60 requests per minute per API key
- Burst: Up to 100 requests in 10 seconds
- Headers: `X-RateLimit-*` headers included in responses
'''

# Save to file
output_path = '../docs/api/webharvest-openapi.json'
with open(output_path, 'w') as f:
    json.dump(openapi_spec, f, indent=2)

print(f"✅ WebHarvest OpenAPI spec generated: {output_path}")
"""
            
            result = subprocess.run([
                sys.executable, "-c", script
            ], capture_output=True, text=True, cwd=self.webharvest_dir)
            
            if result.returncode == 0:
                logger.info(result.stdout)
                
                # Also generate YAML version
                json_path = self.api_dir / "webharvest-openapi.json"
                yaml_path = self.api_dir / "webharvest-openapi.yaml"
                
                if json_path.exists():
                    with open(json_path, 'r') as f:
                        spec = json.load(f)
                    
                    with open(yaml_path, 'w') as f:
                        yaml.dump(spec, f, default_flow_style=False, sort_keys=False)
                    
                    logger.info(f"✅ YAML version generated: {yaml_path}")
                
                return True
            else:
                logger.error(f"❌ Failed to generate WebHarvest OpenAPI: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error generating WebHarvest OpenAPI: {e}")
            return False
        finally:
            os.chdir(self.project_root)
    
    def generate_webclone_openapi(self) -> bool:
        """Generate OpenAPI specification for WebClone Pro API."""
        logger.info("🔧 Generating WebClone Pro OpenAPI specification...")
        
        try:
            # WebClone Pro already has a complete OpenAPI spec
            source_path = self.webclone_dir / "docs" / "api" / "openapi.yaml"
            dest_path = self.api_dir / "webclone-pro-openapi.yaml"
            
            if source_path.exists():
                # Copy the existing spec
                with open(source_path, 'r') as src:
                    content = src.read()
                
                with open(dest_path, 'w') as dst:
                    dst.write(content)
                
                # Also generate JSON version
                with open(source_path, 'r') as f:
                    spec = yaml.safe_load(f)
                
                json_path = self.api_dir / "webclone-pro-openapi.json"
                with open(json_path, 'w') as f:
                    json.dump(spec, f, indent=2)
                
                logger.info(f"✅ WebClone Pro OpenAPI spec copied: {dest_path}")
                logger.info(f"✅ JSON version generated: {json_path}")
                return True
            else:
                logger.warning(f"⚠️ WebClone Pro OpenAPI spec not found: {source_path}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error generating WebClone Pro OpenAPI: {e}")
            return False
    
    def generate_html_docs(self) -> bool:
        """Generate HTML documentation from OpenAPI specs."""
        logger.info("🎨 Generating HTML documentation...")
        
        try:
            # Install redocly CLI if not available
            result = subprocess.run(["which", "redocly"], capture_output=True)
            if result.returncode != 0:
                logger.info("📦 Installing Redocly CLI...")
                subprocess.run(["npm", "install", "-g", "@redocly/cli"], check=True)
            
            html_dir = self.site_dir / "html"
            html_dir.mkdir(exist_ok=True)
            
            # Generate WebHarvest HTML docs
            webharvest_json = self.api_dir / "webharvest-openapi.json"
            if webharvest_json.exists():
                webharvest_html = html_dir / "webharvest-api.html"
                subprocess.run([
                    "redocly", "build-docs", str(webharvest_json),
                    "--output", str(webharvest_html),
                    "--theme.openapi.theme", "dark"
                ], check=True)
                logger.info(f"✅ WebHarvest HTML docs: {webharvest_html}")
            
            # Generate WebClone Pro HTML docs
            webclone_json = self.api_dir / "webclone-pro-openapi.json"
            if webclone_json.exists():
                webclone_html = html_dir / "webclone-pro-api.html"
                subprocess.run([
                    "redocly", "build-docs", str(webclone_json),
                    "--output", str(webclone_html),
                    "--theme.openapi.theme", "dark"
                ], check=True)
                logger.info(f"✅ WebClone Pro HTML docs: {webclone_html}")
            
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Failed to generate HTML docs: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ Error generating HTML docs: {e}")
            return False
    
    def generate_site_index(self) -> bool:
        """Generate the main documentation site index."""
        logger.info("🏠 Generating documentation site index...")
        
        try:
            index_html = self.site_dir / "index.html"
            
            html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔥 Firecrawl Clone Documentation</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card-hover:hover { transform: translateY(-4px); transition: all 0.3s ease; }
        .glass { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.1); }
    </style>
</head>
<body class="bg-gray-50">
    <header class="gradient-bg text-white">
        <div class="container mx-auto px-6 py-16">
            <div class="text-center">
                <h1 class="text-5xl font-bold mb-4">🔥 Firecrawl Clone Platform</h1>
                <p class="text-xl mb-8">Comprehensive Documentation Hub</p>
                <p class="text-lg opacity-90 max-w-2xl mx-auto">
                    Self-hosted web scraping and AI-native website cloning platform
                    with advanced document processing and real-time collaboration.
                </p>
            </div>
        </div>
    </header>

    <main class="container mx-auto px-6 py-12">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- WebHarvest API -->
            <div class="bg-white rounded-lg shadow-lg p-6 card-hover">
                <div class="text-blue-600 text-3xl mb-4">
                    <i class="fas fa-spider"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">WebHarvest API</h3>
                <p class="text-gray-600 mb-4">Self-hosted web scraping platform with MCP integration</p>
                <div class="space-y-2">
                    <a href="./html/webharvest-api.html" class="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center">
                        <i class="fas fa-book mr-2"></i>API Documentation
                    </a>
                </div>
            </div>

            <!-- WebClone Pro API -->
            <div class="bg-white rounded-lg shadow-lg p-6 card-hover">
                <div class="text-purple-600 text-3xl mb-4">
                    <i class="fas fa-magic"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">WebClone Pro API</h3>
                <p class="text-gray-600 mb-4">AI-native website cloning and creation platform</p>
                <div class="space-y-2">
                    <a href="./html/webclone-pro-api.html" class="block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-center">
                        <i class="fas fa-book mr-2"></i>API Documentation
                    </a>
                </div>
            </div>

            <!-- Architecture -->
            <div class="bg-white rounded-lg shadow-lg p-6 card-hover">
                <div class="text-green-600 text-3xl mb-4">
                    <i class="fas fa-sitemap"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">Architecture Diagrams</h3>
                <p class="text-gray-600 mb-4">System architecture and component diagrams</p>
                <div class="space-y-2">
                    <a href="../architecture-diagrams/" class="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center">
                        <i class="fas fa-project-diagram mr-2"></i>View Diagrams
                    </a>
                </div>
            </div>

            <!-- Developer Guide -->
            <div class="bg-white rounded-lg shadow-lg p-6 card-hover">
                <div class="text-orange-600 text-3xl mb-4">
                    <i class="fas fa-code"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">Developer Setup</h3>
                <p class="text-gray-600 mb-4">Complete development environment setup</p>
                <div class="space-y-2">
                    <a href="../DEVELOPER_SETUP_GUIDE.md" class="block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-center">
                        <i class="fas fa-rocket mr-2"></i>Setup Guide
                    </a>
                </div>
            </div>

            <!-- Deployment Guide -->
            <div class="bg-white rounded-lg shadow-lg p-6 card-hover">
                <div class="text-red-600 text-3xl mb-4">
                    <i class="fas fa-server"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">Deployment Guide</h3>
                <p class="text-gray-600 mb-4">Production deployment with Docker & Kubernetes</p>
                <div class="space-y-2">
                    <a href="../DEPLOYMENT_GUIDE.md" class="block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-center">
                        <i class="fas fa-cloud mr-2"></i>Deploy Now
                    </a>
                </div>
            </div>

            <!-- API Integration -->
            <div class="bg-white rounded-lg shadow-lg p-6 card-hover">
                <div class="text-teal-600 text-3xl mb-4">
                    <i class="fas fa-plug"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">API Integration</h3>
                <p class="text-gray-600 mb-4">Connect and integrate with external systems</p>
                <div class="space-y-2">
                    <a href="../API_INTEGRATION_GUIDE.md" class="block bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 text-center">
                        <i class="fas fa-link mr-2"></i>Integration Guide
                    </a>
                </div>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold mb-6 text-center">📊 Platform Overview</h2>
            <div class="grid md:grid-cols-4 gap-6 text-center">
                <div>
                    <div class="text-3xl font-bold text-blue-600">40+</div>
                    <div class="text-gray-600">API Endpoints</div>
                </div>
                <div>
                    <div class="text-3xl font-bold text-purple-600">10+</div>
                    <div class="text-gray-600">MCP Tools</div>
                </div>
                <div>
                    <div class="text-3xl font-bold text-green-600">6</div>
                    <div class="text-gray-600">Output Formats</div>
                </div>
                <div>
                    <div class="text-3xl font-bold text-orange-600">100%</div>
                    <div class="text-gray-600">Self-hosted</div>
                </div>
            </div>
        </div>

        <!-- Features Grid -->
        <div class="mt-12">
            <h2 class="text-2xl font-bold mb-6 text-center">✨ Key Features</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-blue-50 p-4 rounded-lg text-center">
                    <i class="fas fa-robot text-blue-600 text-2xl mb-2"></i>
                    <div class="font-semibold">AI Integration</div>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg text-center">
                    <i class="fas fa-users text-purple-600 text-2xl mb-2"></i>
                    <div class="font-semibold">Real-time Collaboration</div>
                </div>
                <div class="bg-green-50 p-4 rounded-lg text-center">
                    <i class="fas fa-file-pdf text-green-600 text-2xl mb-2"></i>
                    <div class="font-semibold">PDF Processing</div>
                </div>
                <div class="bg-orange-50 p-4 rounded-lg text-center">
                    <i class="fas fa-cloud text-orange-600 text-2xl mb-2"></i>
                    <div class="font-semibold">Cloud Ready</div>
                </div>
            </div>
        </div>
    </main>

    <footer class="bg-gray-800 text-white py-8 mt-16">
        <div class="container mx-auto px-6 text-center">
            <p>&copy; 2024 Firecrawl Clone Platform. Built with ❤️ for the open source community.</p>
            <div class="mt-4">
                <a href="https://github.com/yourusername/firecrawl-clone" class="text-blue-400 hover:underline mx-2">
                    <i class="fab fa-github mr-1"></i>GitHub
                </a>
                <a href="#" class="text-blue-400 hover:underline mx-2">
                    <i class="fas fa-book mr-1"></i>Documentation
                </a>
                <a href="#" class="text-blue-400 hover:underline mx-2">
                    <i class="fas fa-life-ring mr-1"></i>Support
                </a>
            </div>
        </div>
    </footer>
</body>
</html>"""
            
            with open(index_html, 'w') as f:
                f.write(html_content)
            
            logger.info(f"✅ Documentation site index generated: {index_html}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error generating site index: {e}")
            return False
    
    def run_full_generation(self, webharvest_only: bool = False, 
                          webclone_only: bool = False,
                          api_only: bool = False) -> bool:
        """Run the complete documentation generation process."""
        logger.info("🚀 Starting documentation generation...")
        
        success = True
        
        # Generate API documentation
        if not webclone_only:
            success &= self.generate_webharvest_openapi()
        
        if not webharvest_only:
            success &= self.generate_webclone_openapi()
        
        if "html" in self.formats and not api_only:
            success &= self.generate_html_docs()
            success &= self.generate_site_index()
        
        if success:
            logger.info("🎉 Documentation generation completed successfully!")
            logger.info(f"📁 Output directory: {self.output_dir.absolute()}")
            if (self.site_dir / "index.html").exists():
                logger.info(f"🌐 Open: file://{(self.site_dir / 'index.html').absolute()}")
        else:
            logger.error("❌ Documentation generation completed with errors.")
        
        return success


def main():
    """Main entry point for the documentation generator."""
    parser = argparse.ArgumentParser(
        description="Generate comprehensive documentation for Firecrawl Clone platform",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument(
        "--webharvest-only",
        action="store_true",
        help="Generate only WebHarvest documentation"
    )
    
    parser.add_argument(
        "--webclone-only",
        action="store_true",
        help="Generate only WebClone Pro documentation"
    )
    
    parser.add_argument(
        "--api-only",
        action="store_true",
        help="Generate only API documentation"
    )
    
    parser.add_argument(
        "--diagrams-only",
        action="store_true",
        help="Generate only architecture diagrams (not implemented yet)"
    )
    
    parser.add_argument(
        "--force-rebuild",
        action="store_true",
        help="Force complete rebuild ignoring cache"
    )
    
    parser.add_argument(
        "--output-dir",
        default="docs",
        help="Custom output directory (default: docs/)"
    )
    
    parser.add_argument(
        "--format",
        default="html,markdown",
        help="Output formats: html, pdf, markdown (default: html,markdown)"
    )
    
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Parse formats
    formats = [fmt.strip() for fmt in args.format.split(",")]
    
    # Create generator instance
    generator = DocumentationGenerator(
        output_dir=args.output_dir,
        formats=formats
    )
    
    # Run generation
    try:
        success = generator.run_full_generation(
            webharvest_only=args.webharvest_only,
            webclone_only=args.webclone_only,
            api_only=args.api_only
        )
        
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        logger.info("⏹️ Documentation generation interrupted by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"💥 Unexpected error: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()