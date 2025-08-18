-- Database Security Setup for Smart Gift Finder
-- This script creates separate users for read and write operations

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

-- Create admin user for database management
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_primary_keyword ON posts(primary_keyword);

-- Create a view for public blog posts (read-only access)
CREATE OR REPLACE VIEW public_posts AS
SELECT 
    id, slug, title, description, content, tags, 
    primary_keyword, word_count, created_at, updated_at
FROM posts 
WHERE status = 'published'
ORDER BY created_at DESC;

-- Grant read access to the view
GRANT SELECT ON public_posts TO app_reader;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to generate slugs
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    unique_id TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert to lowercase and replace special characters
    base_slug := lower(regexp_replace(title, '[^a-z0-9\s-]', '', 'g'));
    -- Replace spaces with hyphens
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    -- Replace multiple hyphens with single hyphen
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    -- Trim leading/trailing hyphens
    base_slug := trim(both '-' from base_slug);
    
    -- Add unique identifier
    unique_id := substr(md5(random()::text), 1, 6);
    final_slug := base_slug || '-' || unique_id;
    
    -- Check if slug exists and generate new one if needed
    WHILE EXISTS(SELECT 1 FROM posts WHERE slug = final_slug) LOOP
        counter := counter + 1;
        unique_id := substr(md5(random()::text || counter::text), 1, 6);
        final_slug := base_slug || '-' || unique_id;
        
        -- Prevent infinite loop
        IF counter > 10 THEN
            RAISE EXCEPTION 'Unable to generate unique slug after 10 attempts';
        END IF;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION generate_slug(TEXT) TO app_writer;
GRANT EXECUTE ON FUNCTION generate_slug(TEXT) TO app_admin;
