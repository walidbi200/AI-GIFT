import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BlogManager } from '../../src/lib/blogUtils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📝 Saving blog via API...');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
    const blogManager = new BlogManager();
    const result = await blogManager.saveBlog(req.body);
    
    if (result.success) {
      console.log('✅ Blog saved successfully:', result.blog?.filename);
      return res.status(200).json(result);
    } else {
      console.error('❌ Failed to save blog:', result.error);
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('🔥 API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
