-- WebClone Pro Production Database Migration
-- Version: 001
-- Description: Initial schema setup with security and performance optimizations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user', 'guest', 'moderator');
CREATE TYPE project_status AS ENUM ('active', 'pending', 'completed', 'failed', 'archived');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE webhook_status AS ENUM ('pending', 'delivered', 'failed', 'retrying');

-- Users table with enhanced security
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    role user_role DEFAULT 'user',
    subscription_tier subscription_tier DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- Indexes for performance
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users USING btree (email);
CREATE INDEX idx_users_role ON users USING btree (role);
CREATE INDEX idx_users_subscription ON users USING btree (subscription_tier);
CREATE INDEX idx_users_created_at ON users USING brin (created_at);
CREATE INDEX idx_users_metadata ON users USING gin (metadata);

-- Projects table with comprehensive tracking
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    status project_status DEFAULT 'pending',
    crawl_depth INTEGER DEFAULT 1,
    max_pages INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    statistics JSONB DEFAULT '{}'::JSONB,
    settings JSONB DEFAULT '{}'::JSONB,
    
    -- Performance constraints
    CONSTRAINT crawl_depth_range CHECK (crawl_depth BETWEEN 1 AND 10),
    CONSTRAINT max_pages_range CHECK (max_pages BETWEEN 1 AND 10000)
);

CREATE INDEX idx_projects_user_id ON projects USING btree (user_id);
CREATE INDEX idx_projects_status ON projects USING btree (status);
CREATE INDEX idx_projects_created_at ON projects USING brin (created_at);
CREATE INDEX idx_projects_statistics ON projects USING gin (statistics);

-- Pages table for crawled content
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title VARCHAR(512),
    content TEXT,
    html_content TEXT,
    markdown_content TEXT,
    headers JSONB DEFAULT '{}'::JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,
    links TEXT[],
    images TEXT[],
    status_code INTEGER,
    error_message TEXT,
    crawled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processing_time_ms INTEGER,
    
    UNIQUE(project_id, url)
);

CREATE INDEX idx_pages_project_id ON pages USING btree (project_id);
CREATE INDEX idx_pages_url ON pages USING hash (url);
CREATE INDEX idx_pages_crawled_at ON pages USING brin (crawled_at);
CREATE INDEX idx_pages_metadata ON pages USING gin (metadata);
CREATE INDEX idx_pages_full_text ON pages USING gin (to_tsvector('english', content));

-- Payments table for transaction tracking
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) DEFAULT 'USD',
    status payment_status DEFAULT 'pending',
    description TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_payments_user_id ON payments USING btree (user_id);
CREATE INDEX idx_payments_status ON payments USING btree (status);
CREATE INDEX idx_payments_stripe_id ON payments USING btree (stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON payments USING brin (created_at);

-- Sessions table for user session management
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

CREATE INDEX idx_sessions_user_id ON sessions USING btree (user_id);
CREATE INDEX idx_sessions_token_hash ON sessions USING hash (token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions USING btree (expires_at);

-- API Keys table for programmatic access
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    permissions JSONB DEFAULT '[]'::JSONB,
    rate_limit INTEGER DEFAULT 1000, -- Requests per hour
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_api_keys_user_id ON api_keys USING btree (user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys USING hash (key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys USING btree (is_active);

-- Webhooks table for event notifications
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret_hash VARCHAR(64),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhooks_user_id ON webhooks USING btree (user_id);
CREATE INDEX idx_webhooks_is_active ON webhooks USING btree (is_active);

-- Webhook deliveries table for tracking
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status webhook_status DEFAULT 'pending',
    status_code INTEGER,
    response_body TEXT,
    attempt_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries USING btree (webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries USING btree (status);
CREATE INDEX idx_webhook_deliveries_next_retry ON webhook_deliveries USING btree (next_retry_at);

-- Rate limiting table for API protection
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL, -- IP or user_id
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    UNIQUE(identifier, endpoint, window_start)
);

CREATE INDEX idx_rate_limits_identifier ON rate_limits USING hash (identifier);
CREATE INDEX idx_rate_limits_window ON rate_limits USING btree (window_end);

-- Audit logs table for compliance
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs USING btree (user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs USING btree (action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs USING brin (created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs USING btree (resource_type, resource_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create cleanup function for expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP;
    DELETE FROM rate_limits WHERE window_end < CURRENT_TIMESTAMP - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Create index maintenance function
CREATE OR REPLACE FUNCTION maintain_indexes()
RETURNS void AS $$
BEGIN
    REINDEX TABLE CONCURRENTLY users;
    REINDEX TABLE CONCURRENTLY projects;
    REINDEX TABLE CONCURRENTLY pages;
    ANALYZE users, projects, pages;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects
CREATE POLICY projects_user_policy ON projects
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY pages_user_policy ON pages
    FOR ALL
    USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE user_id = current_setting('app.current_user_id')::UUID
        )
    );

-- Create materialized view for user statistics
CREATE MATERIALIZED VIEW user_statistics AS
SELECT 
    u.id as user_id,
    COUNT(DISTINCT p.id) as total_projects,
    COUNT(DISTINCT pg.id) as total_pages,
    SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
    AVG(pg.processing_time_ms) as avg_processing_time,
    MAX(p.created_at) as last_project_created
FROM users u
LEFT JOIN projects p ON u.id = p.user_id
LEFT JOIN pages pg ON p.id = pg.project_id
GROUP BY u.id;

CREATE UNIQUE INDEX idx_user_statistics_user_id ON user_statistics (user_id);

-- Create performance monitoring view
CREATE VIEW performance_metrics AS
SELECT 
    'projects' as table_name,
    pg_size_pretty(pg_total_relation_size('projects')) as total_size,
    (SELECT COUNT(*) FROM projects) as row_count
UNION ALL
SELECT 
    'pages' as table_name,
    pg_size_pretty(pg_total_relation_size('pages')) as total_size,
    (SELECT COUNT(*) FROM pages) as row_count
UNION ALL
SELECT 
    'users' as table_name,
    pg_size_pretty(pg_total_relation_size('users')) as total_size,
    (SELECT COUNT(*) FROM users) as row_count;

-- Grant permissions for application user
GRANT USAGE ON SCHEMA public TO webclone_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO webclone_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO webclone_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO webclone_app;

-- Add comments for documentation
COMMENT ON TABLE users IS 'Core user table with authentication and subscription tracking';
COMMENT ON TABLE projects IS 'Web cloning projects with crawl configuration';
COMMENT ON TABLE pages IS 'Crawled page content and metadata';
COMMENT ON TABLE payments IS 'Payment transactions via Stripe';
COMMENT ON TABLE sessions IS 'User session management for authentication';
COMMENT ON TABLE api_keys IS 'API keys for programmatic access';
COMMENT ON TABLE webhooks IS 'Webhook configurations for event notifications';
COMMENT ON TABLE audit_logs IS 'Audit trail for compliance and security';

-- Migration completion
INSERT INTO schema_migrations (version, executed_at) 
VALUES ('001_initial_schema', CURRENT_TIMESTAMP)
ON CONFLICT (version) DO NOTHING;