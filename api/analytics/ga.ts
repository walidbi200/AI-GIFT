import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📊 Fetching Google Analytics data...');
    
    // Mock analytics data for development
    // In production, you would integrate with Google Analytics API
    const mockAnalyticsData = {
      pageViews: Math.floor(Math.random() * 5000) + 1000,
      uniqueVisitors: Math.floor(Math.random() * 3000) + 500,
      sessionDuration: Math.floor(Math.random() * 300) + 60, // seconds
      bounceRate: Math.floor(Math.random() * 40) + 20, // percentage
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

    console.log('✅ Analytics data fetched successfully');
    
    return res.status(200).json({
      success: true,
      data: mockAnalyticsData
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
