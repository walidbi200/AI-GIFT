import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';
import OpenAI from 'openai';
import { verifyAuth, createAuthErrorResponse } from '../middleware/auth';
import { 
    createBlogPostSchema, 
    deleteBlogPostSchema, 
    blogGenerationSchema 
} from '../lib/validation/schemas';
import { aiGenerationRateLimit } from '../middleware/rate-limit';
import { z } from 'zod';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to generate unique slug
function generateSlug(title: string): string {
    const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    const uniqueId = Date.now().toString(36).slice(-6);
    return `${baseSlug}-${uniqueId}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { method } = req;

    try {
        switch (method) {
            case 'GET':
                return await handleGet(req, res);
            case 'POST':
                return await handlePost(req, res);
            case 'DELETE':
                return await handleDelete(req, res);
            default:
                return res.status(405).json({ 
                    success: false, 
                    error: 'Method not allowed' 
                });
        }
    } catch (error) {
        console.error('🔥 Blog API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
}

// GET - Handle list, single post, and stats
async function handleGet(req: VercelRequest, res: VercelResponse) {
    const { slug, action } = req.query;

    // Handle specific post by slug
    if (slug && typeof slug === 'string') {
        return await getPostBySlug(slug, res);
    }

    // Handle stats
    if (action === 'stats') {
        return await getStats(res);
    }

    // Default: get all posts
    return await getAllPosts(res);
}

// POST - Handle blog generation and saving
async function handlePost(req: VercelRequest, res: VercelResponse) {
    const { action } = req.query;

    // Handle blog generation
    if (action === 'generate') {
        return await generateBlog(req, res);
    }

    // Default: save blog post
    return await saveBlog(req, res);
}

// DELETE - Handle blog deletion
async function handleDelete(req: VercelRequest, res: VercelResponse) {
    return await deleteBlog(req, res);
}

// Helper functions
async function getAllPosts(res: VercelResponse) {
    try {
        const posts = await prisma.post.findMany({
            where: {
                status: 'published'
            },
            select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                tags: true,
                featuredImage: true,
                createdAt: true,
                wordCount: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const postsWithReadingTime = posts.map(post => ({
            ...post,
            created_at: post.createdAt,
            readingTime: Math.ceil((post.wordCount || 0) / 200)
        }));

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
        res.setHeader('CDN-Cache-Control', 'max-age=3600');
        res.setHeader('Vary', 'Accept-Encoding');

        return res.status(200).json({ posts: postsWithReadingTime });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function getPostBySlug(slug: string, res: VercelResponse) {
    try {
        const post = await prisma.post.findFirst({
            where: {
                slug: slug,
                status: 'published'
            },
            select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                content: true,
                tags: true,
                featuredImage: true,
                createdAt: true,
                wordCount: true,
                primaryKeyword: true
            }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const fullPost = {
            ...post,
            created_at: post.createdAt,
            readingTime: Math.ceil((post.wordCount || 0) / 200)
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

async function getStats(res: VercelResponse) {
    try {
        console.log('📊 Fetching blog statistics...');
        
        const totalPosts = await prisma.post.count({
            where: {
                status: 'published'
            }
        });

        const monthlyPosts = await prisma.post.count({
            where: {
                status: 'published',
                createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }
        });

        const weeklyPosts = await prisma.post.count({
            where: {
                status: 'published',
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        });

        console.log(`✅ Blog stats fetched: ${totalPosts} total, ${monthlyPosts} this month, ${weeklyPosts} this week`);
        
        return res.status(200).json({
            success: true,
            stats: {
                totalPosts,
                monthlyPosts,
                weeklyPosts
            }
        });
    } catch (error) {
        console.error('🔥 Stats API Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function generateBlog(req: VercelRequest, res: VercelResponse) {
    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ 
            success: false, 
            error: 'OpenAI API key not configured.' 
        });
    }

    const { stream } = req.body;
    const shouldStream = stream === true;

    try {
        console.log('🔐 Verifying authentication and rate limits...');
        
        const rateLimitResponse = await aiGenerationRateLimit(req as any);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }
        
        const authResult = await verifyAuth(req as any);
        if (!authResult.authenticated) {
            return createAuthErrorResponse(authResult.error || 'Authentication required');
        }

        console.log('🤖 Starting AI blog generation...');
        
        let validatedData;
        try {
            validatedData = blogGenerationSchema.parse(req.body);
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

        const { 
            topic, 
            tone, 
            length, 
            primaryKeyword, 
            secondaryKeywords,
            targetAudience 
        } = validatedData;

        const audience = targetAudience || 'gift shoppers';
        
        // Handle secondaryKeywords array properly
        const formattedSecondaryKeywords = secondaryKeywords && Array.isArray(secondaryKeywords) 
            ? (secondaryKeywords as string[]).join(', ') 
            : '';
        
        const wordCountMap = {
            short: '800-1200',
            medium: '1200-1800',
            long: '1800+'
        };
        
        const megaPrompt = `
You are an expert content creator and SEO specialist for "Smart Gift Finder," a premier gift recommendation website. Your writing style is engaging, helpful, and human-like.

Your task is to write a high-quality, comprehensive, and genuinely useful blog post on the topic: **"${topic}"**.

**Target Audience:** ${audience}
**Tone:** ${tone}
**Primary SEO Keyword:** "${primaryKeyword}"
**Secondary SEO Keywords:** "${formattedSecondaryKeywords}"
**Target Word Count:** ${wordCountMap[length as keyof typeof wordCountMap] || '1200-1800'} words

**CRITICAL INSTRUCTIONS:**
1.  **Title:** Create a creative, compelling, and SEO-friendly title under 60 characters that includes the primary keyword.
2.  **Meta Description:** Write an engaging meta description between 120 and 160 characters. It must be enticing and include the primary keyword.
3.  **Introduction:** Write a captivating introduction that hooks the reader and clearly states the value they will get from the post.
4.  **Body Content:**
    * This is the most important part. Generate **5 to 7 specific, named gift ideas** related to the topic.
    * For each gift idea, create an \`<h3>\` heading with the product name.
    * Below each heading, write 2-3 detailed paragraphs explaining **what the product is** and **why it's a great gift** for this specific topic and audience.
    * Use bullet points (\`<ul><li>...</li></ul>\`) to list key features or benefits.
5.  **Structure and Formatting:** Use \`<h2>\` for main section titles (like "Our Top Gift Picks") and \`<h3>\` for individual gift ideas. Use paragraphs (\`<p>\`), lists, and bold tags (\`<strong>\`) to make the article scannable.
6.  **Conclusion:** Write a strong concluding paragraph that summarizes the key takeaways and provides a final piece of advice.
7.  **NO PLACEHOLDERS:** Do not use generic text like "Welcome to our guide..." or "In conclusion...". Every sentence must be original and valuable.

**OUTPUT FORMAT:**
You MUST respond with ONLY a single, minified, valid JSON object. Do not add any text before or after it.

{
  "title": "Your generated title here",
  "description": "Your generated meta description here",
  "content": "The full blog post content, formatted as a single, well-structured string of HTML. All newlines must be escaped as \\\\n.",
  "tags": ["an", "array", "of", "5-7", "relevant", "lowercase", "tags"]
}
`;

        console.log("🚀 Sending new 'Mega-Prompt' to OpenAI...");

        if (shouldStream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

            res.write(`data: ${JSON.stringify({ type: 'status', message: 'Starting generation...' })}\n\n`);

            const stream = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: megaPrompt }],
                temperature: 0.7,
                stream: true,
            });

            let fullContent = '';
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    fullContent += content;
                    res.write(`data: ${JSON.stringify({ type: 'content', content })}\n\n`);
                }
            }

            res.write(`data: ${JSON.stringify({ type: 'complete', fullContent })}\n\n`);
            res.end();
        } else {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: megaPrompt }],
                temperature: 0.7,
                response_format: { type: "json_object" },
            });

            const rawContent = completion.choices[0]?.message?.content;
            if (!rawContent) {
                throw new Error('Received an empty response from OpenAI.');
            }

            console.log("✅ Received high-quality response from OpenAI.");

            const blogContent = JSON.parse(rawContent);
            
            const fullBlogData = {
                ...blogContent,
                primaryKeyword: primaryKeyword,
                wordCount: blogContent.content.split(/\s+/).length,
            };

            return res.status(200).json({ 
                success: true, 
                blog: fullBlogData,
                message: 'Blog post generated successfully',
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('🔥 AI Blog Generation Error:', error);
        
        if (shouldStream) {
            res.write(`data: ${JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`);
            res.end();
        } else {
            return res.status(500).json({
                success: false,
                error: 'Failed to generate blog post',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
}

async function saveBlog(req: VercelRequest, res: VercelResponse) {
    try {
        console.log('🔐 Verifying authentication...');
        
        const authResult = await verifyAuth(req as any);
        if (!authResult.authenticated) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: authResult.error || 'Please provide valid authentication credentials',
                timestamp: new Date().toISOString()
            });
        }

        console.log('📝 Saving blog via API...');
        
        let validatedData;
        try {
            validatedData = createBlogPostSchema.parse(req.body);
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

        const {
            title,
            description,
            content,
            tags,
            primaryKeyword,
            targetAudience,
            toneOfVoice,
            featuredImage,
            status
        } = validatedData;

        const wordCount = content.trim().split(/\s+/).length;
        const slug = generateSlug(title);

        // Handle tags array properly for database storage
        const formattedTags = tags && Array.isArray(tags) ? tags : [];

        // Validate inputs before creating post
        if (!slug || !title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'Slug, title, and content are required'
            });
        }

        const newPost = await prisma.post.create({
            data: {
                slug,
                title,
                description: description || '',
                content,
                tags: formattedTags,
                primaryKeyword: primaryKeyword || '',
                wordCount,
                status: status || 'draft',
                targetAudience: targetAudience || '',
                toneOfVoice: toneOfVoice || '',
                featuredImage: featuredImage || ''
            }
        });

        console.log('✅ Blog saved successfully to DB with ID:', newPost.id);

        return res.status(200).json({ 
            success: true, 
            blog: newPost,
            message: 'Blog post saved successfully'
        });

    } catch (error) {
        console.error('🔥 API Error:', error);
        
        // Handle Prisma-specific errors
        if (error instanceof Error) {
            if (error.message.includes('Unique constraint')) {
                return res.status(409).json({
                    success: false,
                    error: 'Duplicate slug',
                    message: 'A post with this title already exists'
                });
            }
        }
        
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
}

async function deleteBlog(req: VercelRequest, res: VercelResponse) {
    try {
        console.log('🔐 Verifying authentication...');
        
        const authResult = await verifyAuth(req as any);
        if (!authResult.authenticated) {
            return createAuthErrorResponse(authResult.error || 'Authentication required');
        }

        console.log('🗑️ Deleting blog post...');
        
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

        // Check if post exists
        const existingPost = await prisma.post.findUnique({
            where: { id: blogId },
            select: { id: true, title: true }
        });

        if (!existingPost) {
            return res.status(404).json({
                success: false,
                error: 'Blog post not found'
            });
        }

        // Delete the post
        await prisma.post.delete({
            where: { id: blogId }
        });

        console.log(`✅ Blog post deleted successfully: ${blogId}`);
        
        return res.status(200).json({
            success: true,
            message: 'Blog post deleted successfully',
            deletedPost: {
                id: existingPost.id,
                title: existingPost.title
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
