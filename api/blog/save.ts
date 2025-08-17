import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// This function generates a URL-friendly slug from a title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')         // Replace spaces with hyphens
        .replace(/-+/g, '-')          // Replace multiple hyphens with a single one
        .trim();                      // Trim leading/trailing hyphens
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        console.log('📝 Saving blog via API...');
        const {
            title,
            description,
            content,
            tags,
            primaryKeyword,
            wordCount,
            targetAudience,
            toneOfVoice,
            featuredImage
        } = req.body;

        // Basic validation
        if (!title || !content) {
            return res.status(400).json({ success: false, error: 'Title and content are required.' });
        }

        const slug = generateSlug(title);

        // The key change is adding "RETURNING *" to the end of the SQL query.
        // This tells Postgres to return the entire row that was just inserted.
        const { rows } = await sql`
            INSERT INTO posts (
                slug, title, description, content, tags, primary_keyword,
                word_count, status, target_audience, tone_of_voice, featured_image
            )
            VALUES (
                ${slug}, ${title}, ${description}, ${content}, ${tags}, ${primaryKeyword},
                ${wordCount}, 'published', ${targetAudience}, ${toneOfVoice}, ${featuredImage}
            )
            RETURNING *;
        `;

        // The newly created blog post is now in rows[0]
        const newPost = rows[0];

        console.log('✅ Blog saved successfully to DB with ID:', newPost.id);

        // We now return the complete blog object, including the new ID
        return res.status(200).json({ success: true, blog: newPost });

    } catch (error) {
        console.error('🔥 API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
