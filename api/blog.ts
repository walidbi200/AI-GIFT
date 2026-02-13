import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { jwtVerify } from 'jose';

async function verifyAdmin(req: VercelRequest): Promise<boolean> {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return false;
        }

        const token = authHeader.substring(7);
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        return payload.role === 'admin';
    } catch {
        return false;
    }
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    const { method } = req;
    const { slug } = req.query;

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET - List all posts or get single post
        if (method === 'GET') {
            if (slug) {
                // Get single post
                const { rows } = await sql`
          SELECT * FROM posts WHERE slug = ${slug as string}
        `;
                if (rows.length === 0) {
                    return res.status(404).json({ error: 'Post not found' });
                }
                return res.status(200).json(rows[0]);
            } else {
                // List posts
                // Optional limit
                const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

                const { rows } = await sql`
          SELECT * FROM posts ORDER BY created_at DESC LIMIT ${limit}
        `;
                return res.status(200).json(rows);
            }
        }

        // All other methods require admin auth
        const isAdmin = await verifyAdmin(req);
        if (!isAdmin) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // POST - Create new post
        if (method === 'POST') {
            const { title, content, excerpt, slug: postSlug, published } = req.body;

            const { rows } = await sql`
        INSERT INTO posts (title, content, excerpt, slug, published, created_at, updated_at)
        VALUES (${title}, ${content}, ${excerpt || ''}, ${postSlug}, ${published || false}, NOW(), NOW())
        RETURNING *
      `;

            return res.status(201).json(rows[0]);
        }

        // PUT - Update post
        if (method === 'PUT') {
            if (!slug) {
                return res.status(400).json({ error: 'Slug required for update. Use query param ?slug=...' });
            }

            const { title, content, excerpt, published } = req.body;

            // Handle partial updates if needed, but for now assuming full body or at least title/content
            const { rows } = await sql`
        UPDATE posts
        SET title = ${title}, content = ${content}, excerpt = ${excerpt || ''}, 
            published = ${published}, updated_at = NOW()
        WHERE slug = ${slug as string}
        RETURNING *
      `;

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }

            return res.status(200).json(rows[0]);
        }

        // DELETE - Delete post
        if (method === 'DELETE') {
            if (!slug) {
                return res.status(400).json({ error: 'Slug required' });
            }

            await sql`DELETE FROM posts WHERE slug = ${slug as string}`;

            return res.status(200).json({ message: 'Post deleted' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Blog API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
