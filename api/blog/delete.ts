import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🗑️ Deleting blog post...');
    
    const { blogId } = req.body;

    if (!blogId) {
      return res.status(400).json({
        success: false,
        error: 'Blog ID is required'
      });
    }

    // Check if the post exists
    const checkResult = await sql`
      SELECT id, title FROM posts WHERE id = ${blogId}
    `;

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    // Delete the post
    const result = await sql`
      DELETE FROM posts WHERE id = ${blogId}
    `;

    console.log(`✅ Blog post deleted successfully: ${blogId}`);
    
    return res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully',
      deletedPost: {
        id: checkResult.rows[0].id,
        title: checkResult.rows[0].title
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
