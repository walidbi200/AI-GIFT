import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { rows: posts } = await sql`
            SELECT 
                id, 
                slug, 
                title, 
                description, 
                tags, 
                featured_image, 
                created_at, 
                word_count
            FROM posts 
            WHERE status = 'published' 
            ORDER BY created_at DESC;
        `;

        // Calculate reading time (assuming 200 words per minute)
        const postsWithReadingTime = posts.map(post => ({
            ...post,
            readingTime: Math.ceil((post.word_count || 0) / 200)
        }));

        return res.status(200).json({ posts: postsWithReadingTime });

    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
