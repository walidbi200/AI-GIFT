import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BlogManager } from '../../src/lib/blogUtils.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const blogManager = new BlogManager();
    const indexData = blogManager.loadBlogIndex();
    
    // Support pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedBlogs = indexData.blogs.slice(startIndex, endIndex);
    
    return res.status(200).json({
      success: true,
      blogs: paginatedBlogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(indexData.totalCount / limit),
        totalCount: indexData.totalCount,
        hasNext: endIndex < indexData.totalCount,
        hasPrev: startIndex > 0
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
