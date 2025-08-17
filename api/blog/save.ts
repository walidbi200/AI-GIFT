import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

// Helper function to generate SEO-friendly slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper function to calculate word count
function calculateWordCount(content: string): number {
  return content.trim().split(/\s+/).length;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📝 Saving blog via API...');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      title,
      description,
      content,
      tags = [],
      primaryKeyword,
      secondaryKeywords,
      targetAudience,
      toneOfVoice,
      featuredImage
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required'
      });
    }

    const slug = generateSlug(title);
    const wordCount = calculateWordCount(content);

    // Insert the blog post into the database
    const result = await sql`
      INSERT INTO posts (
        slug, title, description, content, tags, 
        primary_keyword, word_count, target_audience, 
        tone_of_voice, featured_image, status
      ) VALUES (
        ${slug}, ${title}, ${description}, ${content}, ${tags}, 
        ${primaryKeyword}, ${wordCount}, ${targetAudience}, 
        ${toneOfVoice}, ${featuredImage}, 'published'
      ) RETURNING *
    `;

    const savedPost = result.rows[0];

    console.log('✅ Blog saved successfully:', savedPost.id);
    
    return res.status(200).json({
      success: true,
      blog: {
        id: savedPost.id,
        slug: savedPost.slug,
        title: savedPost.title,
        description: savedPost.description,
        content: savedPost.content,
        tags: savedPost.tags,
        primaryKeyword: savedPost.primary_keyword,
        wordCount: savedPost.word_count,
        status: savedPost.status,
        createdAt: savedPost.created_at,
        updatedAt: savedPost.updated_at
      }
    });

  } catch (error) {
    console.error('🔥 API Error:', error);
    
    // Handle unique constraint violation (duplicate slug)
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(409).json({
        success: false,
        error: 'A blog post with this title already exists'
      });
    }

    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
