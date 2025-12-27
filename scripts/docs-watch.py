#!/usr/bin/env python3
"""
Documentation Watch & Auto-Regeneration Script
==============================================

Monitors file changes and automatically regenerates documentation
when source files are modified. Perfect for development workflow.

Usage:
    python scripts/docs-watch.py [options]

Options:
    --interval SECONDS     Check interval in seconds (default: 2)
    --output-dir DIR      Output directory (default: docs/)
    --debounce SECONDS    Debounce time for batch changes (default: 1)
    --ignore-patterns     File patterns to ignore (default: __pycache__,node_modules)
    --verbose             Enable verbose logging

Example:
    python scripts/docs-watch.py --interval 1 --verbose
"""

import argparse
import logging
import os
import sys
import time
from pathlib import Path
from typing import Dict, Set
import subprocess
import hashlib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class FileWatcher:
    """File system watcher for documentation regeneration."""
    
    def __init__(self, 
                 watch_paths: list,
                 output_dir: str = "docs",
                 interval: float = 2.0,
                 debounce: float = 1.0,
                 ignore_patterns: list = None):
        """Initialize the file watcher.
        
        Args:
            watch_paths: List of paths to watch for changes
            output_dir: Output directory for generated docs
            interval: Check interval in seconds
            debounce: Debounce time for batch changes
            ignore_patterns: File patterns to ignore
        """
        self.watch_paths = [Path(p) for p in watch_paths]
        self.output_dir = Path(output_dir)
        self.interval = interval
        self.debounce = debounce
        self.ignore_patterns = ignore_patterns or ['__pycache__', 'node_modules', '.git']
        
        self.file_hashes: Dict[str, str] = {}
        self.last_change_time = 0
        self.generation_script = Path(__file__).parent / "generate-docs.py"
        
        logger.info(f"📁 Watching paths: {[str(p) for p in self.watch_paths]}")
        logger.info(f"📤 Output directory: {self.output_dir}")
        logger.info(f"⏱️ Check interval: {self.interval}s")
        logger.info(f"🕰️ Debounce time: {self.debounce}s")
    
    def should_ignore(self, file_path: Path) -> bool:
        """Check if file should be ignored based on patterns."""
        file_str = str(file_path)
        
        for pattern in self.ignore_patterns:
            if pattern in file_str:
                return True
        
        # Ignore non-source files
        if file_path.suffix not in ['.py', '.ts', '.tsx', '.js', '.jsx', '.md', '.yaml', '.yml']:
            return True
        
        # Ignore generated files
        if 'docs/' in file_str and file_str.endswith(('.html', '.json')):
            return True
        
        return False
    
    def get_file_hash(self, file_path: Path) -> str:
        """Get MD5 hash of file content."""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except (IOError, OSError):
            return ""
    
    def scan_files(self) -> Dict[str, str]:
        """Scan all watched files and return their hashes."""
        file_hashes = {}
        
        for watch_path in self.watch_paths:
            if not watch_path.exists():
                continue
            
            if watch_path.is_file():
                if not self.should_ignore(watch_path):
                    file_hashes[str(watch_path)] = self.get_file_hash(watch_path)
            else:
                # Recursively scan directory
                for file_path in watch_path.rglob('*'):
                    if file_path.is_file() and not self.should_ignore(file_path):
                        file_hashes[str(file_path)] = self.get_file_hash(file_path)
        
        return file_hashes
    
    def detect_changes(self) -> Set[str]:
        """Detect changed files since last scan."""
        current_hashes = self.scan_files()
        changed_files = set()
        
        # Find new or modified files
        for file_path, file_hash in current_hashes.items():
            if (file_path not in self.file_hashes or 
                self.file_hashes[file_path] != file_hash):
                changed_files.add(file_path)
        
        # Find deleted files
        for file_path in self.file_hashes:
            if file_path not in current_hashes:
                changed_files.add(file_path)
        
        self.file_hashes = current_hashes
        return changed_files
    
    def categorize_changes(self, changed_files: Set[str]) -> Dict[str, Set[str]]:
        """Categorize changed files by type/location."""
        categories = {
            'webharvest_api': set(),
            'webclone_api': set(),
            'documentation': set(),
            'configuration': set(),
            'other': set()
        }
        
        for file_path in changed_files:
            file_path_lower = file_path.lower()
            
            if 'webharvest' in file_path_lower and ('/api/' in file_path_lower or file_path.endswith('.py')):
                categories['webharvest_api'].add(file_path)
            elif 'webclone-pro' in file_path_lower and '/api/' in file_path_lower:
                categories['webclone_api'].add(file_path)
            elif file_path.endswith('.md'):
                categories['documentation'].add(file_path)
            elif file_path.endswith(('.yaml', '.yml', '.json')):
                categories['configuration'].add(file_path)
            else:
                categories['other'].add(file_path)
        
        return categories
    
    def regenerate_documentation(self, change_categories: Dict[str, Set[str]]) -> bool:
        """Regenerate documentation based on changed files."""
        logger.info("🔄 Changes detected, regenerating documentation...")
        
        # Determine which parts of documentation to regenerate
        args = [sys.executable, str(self.generation_script), "--output-dir", str(self.output_dir)]
        
        if change_categories['webharvest_api'] and not change_categories['webclone_api']:
            args.append("--webharvest-only")
            logger.info("📡 Regenerating WebHarvest documentation only")
        elif change_categories['webclone_api'] and not change_categories['webharvest_api']:
            args.append("--webclone-only")
            logger.info("🎨 Regenerating WebClone Pro documentation only")
        else:
            logger.info("📚 Regenerating all documentation")
        
        try:
            # Run documentation generation
            result = subprocess.run(
                args,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            if result.returncode == 0:
                logger.info("✅ Documentation regenerated successfully")
                if result.stdout.strip():
                    logger.debug(f"Output: {result.stdout}")
                return True
            else:
                logger.error(f"❌ Documentation generation failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("❌ Documentation generation timed out")
            return False
        except Exception as e:
            logger.error(f"❌ Error running documentation generation: {e}")
            return False
    
    def log_changes(self, change_categories: Dict[str, Set[str]]):
        """Log detected changes in a user-friendly format."""
        total_changes = sum(len(files) for files in change_categories.values())
        
        if total_changes == 0:
            return
        
        logger.info(f"📝 Detected {total_changes} file changes:")
        
        for category, files in change_categories.items():
            if not files:
                continue
            
            category_emoji = {
                'webharvest_api': '🕷️',
                'webclone_api': '🎨',
                'documentation': '📚',
                'configuration': '⚙️',
                'other': '📄'
            }.get(category, '📄')
            
            category_name = category.replace('_', ' ').title()
            logger.info(f"  {category_emoji} {category_name}: {len(files)} files")
            
            # Show first few files for context
            for file_path in sorted(files)[:3]:
                relative_path = os.path.relpath(file_path)
                logger.info(f"    • {relative_path}")
            
            if len(files) > 3:
                logger.info(f"    • ... and {len(files) - 3} more")
    
    def run(self):
        """Start the file watching loop."""
        logger.info("🚀 Starting documentation watcher...")
        logger.info("💡 Press Ctrl+C to stop")
        
        # Initial scan
        self.file_hashes = self.scan_files()
        initial_count = len(self.file_hashes)
        logger.info(f"📊 Monitoring {initial_count} files")
        
        # Initial documentation generation
        logger.info("🏗️ Generating initial documentation...")
        try:
            subprocess.run([
                sys.executable, str(self.generation_script),
                "--output-dir", str(self.output_dir)
            ], check=True, capture_output=True)
            logger.info("✅ Initial documentation generated")
        except subprocess.CalledProcessError as e:
            logger.warning(f"⚠️ Initial documentation generation failed: {e}")
        
        try:
            while True:
                time.sleep(self.interval)
                
                changed_files = self.detect_changes()
                if not changed_files:
                    continue
                
                # Record change time for debouncing
                self.last_change_time = time.time()
                
                # Categorize changes
                change_categories = self.categorize_changes(changed_files)
                self.log_changes(change_categories)
                
                # Wait for debounce period to handle batch changes
                logger.info(f"⏳ Waiting {self.debounce}s for additional changes...")
                time.sleep(self.debounce)
                
                # Check for additional changes during debounce
                additional_changes = self.detect_changes()
                if additional_changes:
                    logger.info(f"📝 Found {len(additional_changes)} additional changes")
                    additional_categories = self.categorize_changes(additional_changes)
                    
                    # Merge categories
                    for category in change_categories:
                        change_categories[category].update(additional_categories[category])
                
                # Regenerate documentation
                self.regenerate_documentation(change_categories)
                
        except KeyboardInterrupt:
            logger.info("⏹️ Documentation watcher stopped by user")
        except Exception as e:
            logger.error(f"💥 Unexpected error: {e}")
            raise


def main():
    """Main entry point for the documentation watcher."""
    parser = argparse.ArgumentParser(
        description="Watch files and automatically regenerate documentation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument(
        "--interval",
        type=float,
        default=2.0,
        help="Check interval in seconds (default: 2)"
    )
    
    parser.add_argument(
        "--output-dir",
        default="docs",
        help="Output directory (default: docs/)"
    )
    
    parser.add_argument(
        "--debounce",
        type=float,
        default=1.0,
        help="Debounce time for batch changes (default: 1)"
    )
    
    parser.add_argument(
        "--ignore-patterns",
        default="__pycache__,node_modules,.git,*.pyc,*.pyo",
        help="Comma-separated file patterns to ignore"
    )
    
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Parse ignore patterns
    ignore_patterns = [p.strip() for p in args.ignore_patterns.split(",")]
    
    # Define paths to watch
    project_root = Path(__file__).parent.parent
    watch_paths = [
        project_root / "webharvest" / "app",
        project_root / "webclone-pro" / "app" / "api",
        project_root / "webclone-pro" / "components",
        project_root / "docs",
        project_root / "README.md",
        project_root / "DEVELOPER_SETUP_GUIDE.md",
        project_root / "DEPLOYMENT_GUIDE.md",
        project_root / "API_INTEGRATION_GUIDE.md",
        project_root / "architecture-diagrams"
    ]
    
    # Filter existing paths
    watch_paths = [p for p in watch_paths if p.exists()]
    
    if not watch_paths:
        logger.error("❌ No valid paths found to watch")
        sys.exit(1)
    
    # Create and run watcher
    watcher = FileWatcher(
        watch_paths=watch_paths,
        output_dir=args.output_dir,
        interval=args.interval,
        debounce=args.debounce,
        ignore_patterns=ignore_patterns
    )
    
    try:
        watcher.run()
    except Exception as e:
        logger.error(f"💥 Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()