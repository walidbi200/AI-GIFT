-- Analytics Events Schema

CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(50) NOT NULL, -- e.g. 'page_view', 'affiliate_click', 'time_on_page'
    page VARCHAR(255),
    visitor_id VARCHAR(255), -- Optional, for session tracking if available
    data JSONB, -- Stores event-specific data (e.g. seconds, giftName, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for querying analytics
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_page ON analytics_events(page);
