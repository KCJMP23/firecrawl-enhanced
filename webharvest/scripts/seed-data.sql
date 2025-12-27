-- WebHarvest Seed Data
-- Sample data for testing and development

-- Insert default project
INSERT INTO projects (id, name, description, domain_allowlist, domain_denylist, max_pages_per_crawl)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 
     'Default Project', 
     'Default project for testing and development',
     '{}',
     '{}',
     10000)
ON CONFLICT DO NOTHING;

-- Insert sample API keys (for testing only - replace in production)
-- Key: wh_test_key_123456789 (SHA256: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92)
INSERT INTO api_keys (key_hash, name, project_id, permissions, rate_limit)
VALUES 
    ('8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
     'Test API Key',
     '00000000-0000-0000-0000-000000000001',
     '{"scrape": true, "crawl": true, "batch": true, "map": true}',
     1000)
ON CONFLICT DO NOTHING;

-- Insert sample crawl job (completed)
INSERT INTO crawl_jobs (
    id, 
    project_id, 
    seed_url, 
    request_json, 
    status,
    total_discovered,
    completed,
    failed
)
VALUES 
    ('00000000-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000001',
     'https://example.com',
     '{"limit": 10, "includePaths": ["^/docs/.*"], "maxDepth": 3}',
     'completed',
     10,
     9,
     1)
ON CONFLICT DO NOTHING;

-- Insert sample pages for the crawl job
INSERT INTO crawl_pages (crawl_job_id, url, normalized_url, status_code, markdown, metadata)
VALUES 
    ('00000000-0000-0000-0000-000000000002',
     'https://example.com/docs/getting-started',
     'https://example.com/docs/getting-started',
     200,
     '# Getting Started\n\nWelcome to the documentation.',
     '{"title": "Getting Started", "description": "Learn how to get started"}'),
    ('00000000-0000-0000-0000-000000000002',
     'https://example.com/docs/api-reference',
     'https://example.com/docs/api-reference',
     200,
     '# API Reference\n\nComplete API documentation.',
     '{"title": "API Reference", "description": "API endpoints documentation"}')
ON CONFLICT DO NOTHING;

-- Note: These are sample entries for development/testing only
-- In production, use proper API key generation and management