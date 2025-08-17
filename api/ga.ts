import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Ensure you have these environment variables set in Vercel
const propertyId = process.env.GA_PROPERTY_ID;
const client_email = process.env.GA_CLIENT_EMAIL;
const private_key = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Vercel needs this replacement

if (!propertyId || !client_email || !private_key) {
  throw new Error("Google Analytics environment variables are not set.");
}

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email,
    private_key,
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '28daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
    });

    const uniqueVisitors = response.rows?.[0]?.metricValues?.[0]?.value ?? '0';
    const pageViews = response.rows?.[0]?.metricValues?.[1]?.value ?? '0';
    const sessionDuration = parseFloat(response.rows?.[0]?.metricValues?.[2]?.value ?? '0').toFixed(2);
    const bounceRate = (parseFloat(response.rows?.[0]?.metricValues?.[3]?.value ?? '0') * 100).toFixed(2);

    return res.status(200).json({
      uniqueVisitors: parseInt(uniqueVisitors, 10),
      pageViews: parseInt(pageViews, 10),
      sessionDuration: Math.round(parseFloat(sessionDuration)),
      bounceRate: parseFloat(bounceRate),
    });
  } catch (error) {
    console.error('Error fetching Google Analytics data:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics data', message: error instanceof Error ? error.message : 'Unknown error' });
  }
}
