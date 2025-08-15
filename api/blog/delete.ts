import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BlogManager } from '../../src/lib/blogUtils.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { blogId, filename } = req.body;
    
    if (!blogId || !filename) {
      return res.status(400).json({ error: 'Missing blogId or filename' });
    }

    const blogManager = new BlogManager();
    const result = await blogManager.deleteBlog(blogId, filename);
    
    if (result.success) {
      return res.status(200).json({ success: true, message: 'Blog deleted successfully' });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error deleting blog:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
