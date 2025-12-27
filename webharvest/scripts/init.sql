-- WebHarvest Database Schema
-- PostgreSQL initialization script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    openwebui_collection_id VARCHAR(255),
    sync_mode VARCHAR(50) DEFAULT 'bundle_zip' CHECK (sync_mode IN ('per_page', 'bundle_zip')),
    domain_allowlist TEXT[] DEFAULT '{}',
    domain_denylist TEXT[] DEFAULT '{}',
    max_pages_per_crawl INTEGER DEFAULT 10000,
    rate_limit_per_domain INTEGER DEFAULT 2,
    rate_limit_delay_ms INTEGER DEFAULT 500
);

-- Crawl jobs table
CREATE TABLE IF NOT EXISTS crawl_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    seed_url TEXT NOT NULL,
    request_json JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'scraping', 'completed', 'failed', 'canceled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    total_discovered INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    failed INTEGER DEFAULT 0,
    canceled BOOLEAN DEFAULT FALSE,
    error TEXT,
    webhook_url TEXT,
    created_by VARCHAR(255)
);

-- Crawl pages table
CREATE TABLE IF NOT EXISTS crawl_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crawl_job_id UUID NOT NULL REFERENCES crawl_jobs(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    normalized_url TEXT NOT NULL,
    status_code INTEGER,
    markdown TEXT,
    html TEXT,
    raw_html TEXT,
    links TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    content_hash VARCHAR(255),
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processing_time_ms INTEGER
);

-- Scrape cache table
CREATE TABLE IF NOT EXISTS scrape_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    url TEXT NOT NULL,
    normalized_url TEXT NOT NULL,
    request_hash VARCHAR(255) NOT NULL,
    response_json JSONB NOT NULL,
    content_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Batch jobs table
CREATE TABLE IF NOT EXISTS batch_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    urls TEXT[] NOT NULL,
    request_json JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'canceled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    total_urls INTEGER NOT NULL,
    completed INTEGER DEFAULT 0,
    failed INTEGER DEFAULT 0,
    webhook_url TEXT,
    created_by VARCHAR(255)
);

-- Batch results table
CREATE TABLE IF NOT EXISTS batch_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_job_id UUID NOT NULL REFERENCES batch_jobs(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    status_code INTEGER,
    markdown TEXT,
    html TEXT,
    metadata JSONB DEFAULT '{}',
    content_hash VARCHAR(255),
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    target TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled jobs table
CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('crawl', 'batch_scrape')),
    cron_schedule VARCHAR(255) NOT NULL,
    job_config JSONB NOT NULL,
    webhook_url TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

-- API keys table (for authentication)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{}',
    rate_limit INTEGER DEFAULT 1000,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for performance
CREATE INDEX idx_crawl_pages_normalized_url ON crawl_pages(normalized_url);
CREATE INDEX idx_crawl_pages_crawl_job_id ON crawl_pages(crawl_job_id);
CREATE INDEX idx_crawl_pages_content_hash ON crawl_pages(content_hash);
CREATE INDEX idx_crawl_pages_created_at ON crawl_pages(created_at);

CREATE INDEX idx_scrape_cache_normalized_url ON scrape_cache(normalized_url);
CREATE INDEX idx_scrape_cache_expires_at ON scrape_cache(expires_at);
CREATE INDEX idx_scrape_cache_created_at ON scrape_cache(created_at);

CREATE INDEX idx_crawl_jobs_status ON crawl_jobs(status);
CREATE INDEX idx_crawl_jobs_created_at ON crawl_jobs(created_at);
CREATE INDEX idx_crawl_jobs_project_id ON crawl_jobs(project_id);

CREATE INDEX idx_batch_jobs_status ON batch_jobs(status);
CREATE INDEX idx_batch_jobs_created_at ON batch_jobs(created_at);
CREATE INDEX idx_batch_jobs_project_id ON batch_jobs(project_id);

CREATE INDEX idx_batch_results_batch_job_id ON batch_results(batch_job_id);
CREATE INDEX idx_batch_results_created_at ON batch_results(created_at);

CREATE INDEX idx_audit_log_actor ON audit_log(actor);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_project_id ON api_keys(project_id);

-- Full text search indexes
CREATE INDEX idx_crawl_pages_url_gin ON crawl_pages USING gin(to_tsvector('english', url));
CREATE INDEX idx_crawl_pages_markdown_gin ON crawl_pages USING gin(to_tsvector('english', markdown));

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO webharvest;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO webharvest;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO webharvest;