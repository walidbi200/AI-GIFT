import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// This initializes the OpenAI client with your API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ success: false, error: 'OpenAI API key not configured.' });
    }

    try {
        const { topic, tone, length, primaryKeyword, secondaryKeywords } = req.body;
        const audience = req.body.audience || 'gift shoppers';

        if (!topic || !primaryKeyword) {
            return res.status(400).json({ success: false, error: 'Topic and primary keyword are required.' });
        }
        
        const wordCountMap = {
            short: '800-1200',
            medium: '1200-1800',
            long: '1800+'
        };
        
        // --- The New, Highly-Detailed "Mega-Prompt" is now embedded directly ---
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

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o', // Using a more powerful model for higher quality
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

        return res.status(200).json({ success: true, blog: fullBlogData });

    } catch (error) {
        console.error('🔥 AI Blog Generation Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate blog post',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
