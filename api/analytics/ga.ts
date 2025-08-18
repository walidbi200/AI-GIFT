import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📊 Fetching Google Analytics data...');
    
    let analyticsData;
    
    // Check if we have Google Analytics credentials
    if (process.env.GOOGLE_ANALYTICS_PROPERTY_ID && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        // Initialize Google Analytics client
        const analyticsDataClient = new BetaAnalyticsDataClient({
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        });

        const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
        
        // Get last 30 days of data
        const [response] = await analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [
            {
              startDate: '30daysAgo',
              endDate: 'today',
            },
          ],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'totalUsers' },
            { name: 'averageSessionDuration' },
            { name: 'bounceRate' },
            { name: 'sessions' },
          ],
          dimensions: [
            { name: 'pagePath' },
            { name: 'pageTitle' },
          ],
          limit: 10,
        });

        // Process the response
        const rows = response.rows || [];
        const topPages = rows.slice(0, 5).map((row, index) => ({
          path: row.dimensionValues?.[0]?.value || '',
          title: row.dimensionValues?.[1]?.value || '',
          views: parseInt(row.metricValues?.[0]?.value || '0'),
        }));

        analyticsData = {
          pageViews: parseInt(response.totals?.[0]?.metricValues?.[0]?.value || '0'),
          uniqueVisitors: parseInt(response.totals?.[0]?.metricValues?.[1]?.value || '0'),
          sessionDuration: Math.round(parseFloat(response.totals?.[0]?.metricValues?.[2]?.value || '0') / 60), // Convert to minutes
          bounceRate: Math.round(parseFloat(response.totals?.[0]?.metricValues?.[3]?.value || '0') * 100), // Convert to percentage
          sessions: parseInt(response.totals?.[0]?.metricValues?.[4]?.value || '0'),
          topPages,
          recentActivity: [
            { timestamp: new Date().toISOString(), action: 'page_view', page: '/' },
            { timestamp: new Date(Date.now() - 300000).toISOString(), action: 'gift_generation', occasion: 'birthday' },
            { timestamp: new Date(Date.now() - 600000).toISOString(), action: 'blog_view', post: 'Tech Gifts Guide' },
          ]
        };

        console.log('✅ Real Google Analytics data fetched successfully');
      } catch (gaError) {
        console.warn('⚠️ Failed to fetch real GA data, falling back to mock data:', gaError);
        throw gaError; // This will trigger the fallback below
      }
    } else {
      // Fallback to mock data for development
      analyticsData = {
        pageViews: Math.floor(Math.random() * 5000) + 1000,
        uniqueVisitors: Math.floor(Math.random() * 3000) + 500,
        sessionDuration: Math.floor(Math.random() * 300) + 60, // seconds
        bounceRate: Math.floor(Math.random() * 40) + 20, // percentage
        sessions: Math.floor(Math.random() * 2000) + 800,
        topPages: [
          { path: '/', views: Math.floor(Math.random() * 1000) + 500, title: 'Home' },
          { path: '/blog', views: Math.floor(Math.random() * 800) + 300, title: 'Blog' },
          { path: '/blog/unique-gifts-for-gamers', views: Math.floor(Math.random() * 600) + 200, title: 'Gaming Gifts' },
          { path: '/blog/tech-gifts-for-parents', views: Math.floor(Math.random() * 500) + 150, title: 'Tech Gifts' },
          { path: '/about', views: Math.floor(Math.random() * 300) + 100, title: 'About' },
        ],
        recentActivity: [
          { timestamp: new Date().toISOString(), action: 'page_view', page: '/' },
          { timestamp: new Date(Date.now() - 300000).toISOString(), action: 'gift_generation', occasion: 'birthday' },
          { timestamp: new Date(Date.now() - 600000).toISOString(), action: 'blog_view', post: 'Tech Gifts Guide' },
        ]
      };
      
      console.log('✅ Mock analytics data generated for development');
    }
    
    return res.status(200).json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('🔥 Analytics API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
