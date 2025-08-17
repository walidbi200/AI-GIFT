import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📋 Fetching blog posts...');
    
    // Get query parameters for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total FROM posts WHERE status = 'published'
    `;
    const totalCount = parseInt(countResult.rows[0].total);
    
    // Get posts with pagination
    const result = await sql`
      SELECT 
        id, slug, title, description, content, tags, 
        primary_keyword, word_count, status, target_audience, 
        tone_of_voice, featured_image, created_at, updated_at
      FROM posts 
      WHERE status = 'published'
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    const posts = result.rows.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content,
      tags: post.tags || [],
      primaryKeyword: post.primary_keyword,
      wordCount: post.word_count,
      status: post.status,
      targetAudience: post.target_audience,
      toneOfVoice: post.tone_of_voice,
      featuredImage: post.featured_image,
      createdAt: post.created_at,
      updatedAt: post.updated_at
    }));

    console.log(`✅ Fetched ${posts.length} blog posts`);
    
    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
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
