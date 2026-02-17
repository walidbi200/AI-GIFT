import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS check (optional for setup, but good practice)
  if (
    process.env.NODE_ENV !== 'development' &&
    !req.headers.authorization?.startsWith('Bearer ' + process.env.ADMIN_SECRET)
  ) {
    // Optional: Protect this endpoint
  }

  try {
    // Create analytics events table
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        event_name VARCHAR(50) NOT NULL,
        page VARCHAR(255),
        visitor_id VARCHAR(255),
        data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create indices
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_page ON analytics_events(page);`;

    return res.status(200).json({ message: 'Analytics schema initialized' });
  } catch (error) {
    console.error('Schema initialization error:', error);
    return res.status(500).json({ error: String(error) });
  }
}
