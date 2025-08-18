import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ error: 'Slug is required' });
    }

    try {
        const { rows } = await sql`
            SELECT 
                id, slug, title, description, content, tags, 
                featured_image, created_at, word_count, primary_keyword
            FROM posts 
            WHERE slug = ${slug} AND status = 'published'
            LIMIT 1;
        `;

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const post = rows[0];

        // Safely handle tags, whether it's an array or a string like "{tag1,tag2}"
        const cleanedTags = Array.isArray(post.tags)
            ? post.tags
            : (post.tags || '').replace(/[{}]/g, '').split(',');

        const fullPost = {
            ...post,
            tags: cleanedTags,
            readingTime: Math.ceil((post.word_count || 0) / 200)
        };

        return res.status(200).json({ post: fullPost });

    } catch (error) {
        console.error(`Error fetching post with slug ${slug}:`, error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
