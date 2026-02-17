import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust closer to prod if needed
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle Beacon API (text/plain) or regular JSON
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // Invalid JSON
      }
    }

    const { event, page, ...data } = body || {};

    if (!event) {
      return res.status(400).json({ error: 'Event name required' });
    }

    // Insert into DB
    await sql`
      INSERT INTO analytics_events (event_name, page, data, created_at)
      VALUES (${event}, ${page || ''}, ${JSON.stringify(data)}, NOW())
    `;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics Beacon Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
