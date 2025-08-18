import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { verifyAuth, createAuthErrorResponse } from '../../middleware/auth';
import { deleteBlogPostSchema } from '../../lib/validation/schemas';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    console.log('🔐 Verifying authentication...');
    
    // Verify authentication
    const authResult = await verifyAuth(req as any);
    if (!authResult.authenticated) {
      return createAuthErrorResponse(authResult.error || 'Authentication required');
    }

    console.log('🗑️ Deleting blog post...');
    
    // Validate input data using Zod schema
    let validatedData;
    try {
      validatedData = deleteBlogPostSchema.parse(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: (error as any).errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      throw error;
    }

    const { blogId } = validatedData;

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
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('🔥 API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
