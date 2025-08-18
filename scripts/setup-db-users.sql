-- Database Security Setup Script
-- This script creates separate users for read and write operations
-- Run this script as a database superuser (postgres)

-- Create read-only user for public endpoints
CREATE USER app_reader WITH PASSWORD 'generate-secure-password-here';
GRANT CONNECT ON DATABASE postgres TO app_reader;
GRANT USAGE ON SCHEMA public TO app_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_reader;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO app_reader;

-- Grant permissions on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO app_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO app_reader;

-- Create write user for admin endpoints
CREATE USER app_writer WITH PASSWORD 'generate-secure-password-here';
GRANT CONNECT ON DATABASE postgres TO app_writer;
GRANT USAGE ON SCHEMA public TO app_writer;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_writer;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_writer;

-- Grant permissions on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_writer;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_writer;

-- Create admin user for full access
CREATE USER app_admin WITH PASSWORD 'generate-secure-password-here';
GRANT CONNECT ON DATABASE postgres TO app_admin;
GRANT ALL PRIVILEGES ON SCHEMA public TO app_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_admin;

-- Grant permissions on future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app_admin;

-- Revoke unnecessary permissions from main user (if exists)
-- REVOKE ALL ON ALL TABLES IN SCHEMA public FROM main_user;
-- REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM main_user;

-- Create indexes for better performance and security
CREATE INDEX IF NOT EXISTS idx_posts_status_created_at ON posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_primary_keyword ON posts(primary_keyword);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

-- Create a view for public blog posts (read-only access)
CREATE OR REPLACE VIEW public_posts AS
SELECT 
    id, slug, title, description, content, tags, 
    primary_keyword, word_count, target_audience, 
    tone_of_voice, featured_image, created_at, updated_at
FROM posts 
WHERE status = 'published'
ORDER BY created_at DESC;

-- Grant read access to the view
GRANT SELECT ON public_posts TO app_reader;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for posts table
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Grant permissions on audit_logs
GRANT SELECT ON audit_logs TO app_reader;
GRANT INSERT ON audit_logs TO app_writer;
GRANT ALL ON audit_logs TO app_admin;

-- Create index on audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id VARCHAR(255),
    p_action VARCHAR(100),
    p_table_name VARCHAR(100),
    p_record_id INTEGER,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id, action, table_name, record_id, 
        old_values, new_values, ip_address, user_agent
    ) VALUES (
        p_user_id, p_action, p_table_name, p_record_id,
        p_old_values, p_new_values, p_ip_address, p_user_agent
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on audit function
GRANT EXECUTE ON FUNCTION log_audit_event TO app_writer;
GRANT EXECUTE ON FUNCTION log_audit_event TO app_admin;

-- Create trigger for posts table audit logging
CREATE OR REPLACE FUNCTION audit_posts_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_audit_event(
            NEW.created_by,
            'INSERT',
            'posts',
            NEW.id,
            NULL,
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_audit_event(
            NEW.updated_by,
            'UPDATE',
            'posts',
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_audit_event(
            OLD.deleted_by,
            'DELETE',
            'posts',
            OLD.id,
            to_jsonb(OLD),
            NULL
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit trigger for posts table
DROP TRIGGER IF EXISTS audit_posts_trigger ON posts;
CREATE TRIGGER audit_posts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION audit_posts_changes();

-- Add columns for audit tracking (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'created_by') THEN
        ALTER TABLE posts ADD COLUMN created_by VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'updated_by') THEN
        ALTER TABLE posts ADD COLUMN updated_by VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'deleted_by') THEN
        ALTER TABLE posts ADD COLUMN deleted_by VARCHAR(255);
    END IF;
END $$;

-- Create comments for documentation
COMMENT ON TABLE posts IS 'Blog posts table with full content and metadata';
COMMENT ON TABLE audit_logs IS 'Audit trail for security monitoring and compliance';
COMMENT ON VIEW public_posts IS 'Public view of published blog posts only';
COMMENT ON FUNCTION log_audit_event IS 'Function to log audit events for security monitoring';
COMMENT ON FUNCTION audit_posts_changes IS 'Trigger function to automatically audit posts table changes';
