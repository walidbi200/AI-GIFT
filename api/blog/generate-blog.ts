import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { verifyAuth, createAuthErrorResponse } from '../../middleware/auth';
import { blogGenerationSchema } from '../../lib/validation/schemas';
import { aiGenerationRateLimit } from '../../middleware/rate-limit';
import { z } from 'zod';

// This initializes the OpenAI client with your API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ 
            success: false, 
            error: 'OpenAI API key not configured.' 
        });
    }

    // Check if streaming is requested
    const { stream } = req.body;
    const shouldStream = stream === true;

    try {
        console.log('🔐 Verifying authentication and rate limits...');
        
        // Check rate limiting first
        const rateLimitResponse = await aiGenerationRateLimit(req as any);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }
        
        // Verify authentication
        const authResult = await verifyAuth(req as any);
        if (!authResult.authenticated) {
            return createAuthErrorResponse(authResult.error || 'Authentication required');
        }

        console.log('🤖 Starting AI blog generation...');
        
        // Validate input data using Zod schema
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
        
        const wordCountMap = {
            short: '800-1200',
            medium: '1200-1800',
            long: '1800+'
        };
        
        // --- The New, Highly-Detailed "Mega-Prompt" ---
        const megaPrompt = `
You are an expert content creator and SEO specialist for "Smart Gift Finder," a premier gift recommendation website. Your writing style is engaging, helpful, and human-like.

Your task is to write a high-quality, comprehensive, and genuinely useful blog post on the topic: **"${topic}"**.

**Target Audience:** ${audience}
**Tone:** ${tone}
**Primary SEO Keyword:** "${primaryKeyword}"
**Secondary SEO Keywords:** "${secondaryKeywords}"
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
            // Set up streaming response
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

            // Send initial status
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

            // Send completion signal
            res.write(`data: ${JSON.stringify({ type: 'complete', fullContent })}\n\n`);
            res.end();
        } else {
            // Non-streaming response (original behavior)
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
