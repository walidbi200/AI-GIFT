import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📊 Fetching blog statistics...');
    
    // Get total count of published posts
    const countResult = await sql`
      SELECT COUNT(*) as total FROM posts WHERE status = 'published'
    `;
    
    const totalPosts = parseInt(countResult.rows[0].total);

    // Get count of posts created this month
    const monthlyResult = await sql`
      SELECT COUNT(*) as monthly FROM posts 
      WHERE status = 'published' 
      AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `;
    
    const monthlyPosts = parseInt(monthlyResult.rows[0].monthly);

    // Get count of posts created this week
    const weeklyResult = await sql`
      SELECT COUNT(*) as weekly FROM posts 
      WHERE status = 'published' 
      AND created_at >= DATE_TRUNC('week', CURRENT_DATE)
    `;
    
    const weeklyPosts = parseInt(weeklyResult.rows[0].weekly);

    console.log(`✅ Blog stats fetched: ${totalPosts} total, ${monthlyPosts} this month, ${weeklyPosts} this week`);
    
    return res.status(200).json({
      success: true,
      stats: {
        totalPosts,
        monthlyPosts,
        weeklyPosts
      }
    });

  } catch (error) {
    console.error('🔥 API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
