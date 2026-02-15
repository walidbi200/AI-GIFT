import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 1. Total Visitors (unique sessions/visitors if we had them, OR total page views for now)
        // Roughly counting page_view events
        const { rows: totalViews } = await sql`
        SELECT COUNT(*) as count FROM analytics_events WHERE event_name = 'page_view'
    `;

        // 2. Affiliate Clicks
        const { rows: affiliateClicks } = await sql`
        SELECT COUNT(*) as count FROM analytics_events WHERE event_name = 'affiliate_click'
    `;

        // 3. Email Signups (assuming 'email_signup_completed' event)
        const { rows: emailSignups } = await sql`
        SELECT COUNT(*) as count FROM analytics_events WHERE event_name = 'email_signup_completed'
    `;

        // 4. Avg Time On Page (from 'time_on_page' events) - extract seconds from jsonb
        const { rows: avgTime } = await sql`
        SELECT AVG((data->>'seconds')::int) as avg_seconds 
        FROM analytics_events 
        WHERE event_name = 'time_on_page'
    `;

        // 5. Top Pages
        const { rows: topPages } = await sql`
        SELECT page, COUNT(*) as views 
        FROM analytics_events 
        WHERE event_name = 'page_view' 
        GROUP BY page 
        ORDER BY views DESC 
        LIMIT 5
    `;

        // 6. Traffic Sources
        // Assuming we track 'utm_landing' or 'page_view' with UTM data. 
        // Implementing basic aggregation if data exists.
        const { rows: trafficSources } = await sql`
        SELECT data->>'utm_source' as source, COUNT(*) as count 
        FROM analytics_events 
        WHERE event_name = 'utm_landing' OR (event_name = 'page_view' AND data->>'utm_source' IS NOT NULL)
        GROUP BY source 
        ORDER BY count DESC 
        LIMIT 5
    `;


        return res.status(200).json({
            totalVisitors: parseInt(totalViews[0].count),
            affiliateClicks: parseInt(affiliateClicks[0].count),
            emailSignups: parseInt(emailSignups[0].count),
            avgTimeOnPage: Math.round(avgTime[0].avg_seconds || 0),
            topPages: topPages.map(row => ({
                page: row.page,
                views: parseInt(row.views),
                // We'd need to join to get clicks per page for true CTR, simplifying for now
                clicks: 0 // Placeholder
            })),
            trafficSources: trafficSources.map(row => ({
                source: row.source || 'Direct',
                count: parseInt(row.count)
            }))
        });

    } catch (error) {
        console.error('Stats API Error:', error);
        return res.status(500).json({ error: 'Failed to fetch stats' });
    }
}
