import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔥 Blog API called with method:', req.method);
  console.log('🔥 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const { topic, tone, length, primaryKeyword, secondaryKeywords } = req.body;
    
    // Load the human-first SEO rules (optional - for reference)
    let _seoRules = '';
    try {
      const rulesPath = path.join(process.cwd(), 'content', 'human_first_seo_rules.md');
      _seoRules = fs.readFileSync(rulesPath, 'utf8');
    } catch (error) {
      console.log('📋 SEO rules file not found, using default rules');
    }

    // Enhanced prompt using the template structure
    const enhancedPrompt = `You are an expert ${topic} writer. Write a ${length} blog post with the following requirements:

TOPIC: ${topic}
TONE: ${tone}
PRIMARY KEYWORD: ${primaryKeyword || topic}
SECONDARY KEYWORDS: ${secondaryKeywords || 'related terms'}

HUMAN-FIRST SEO RULES TO FOLLOW:
1. Write for people first - conversational tone, avoid jargon unless explained
2. Show expertise - include real examples, reference credible sources  
3. Structure matters - H1 for title, H2 for main sections, H3 for sub-points
4. Engage, don't dump keywords - natural keyword placement, no stuffing
5. Make it scannable - bullet points, short paragraphs, bold important words
6. Add unique angle - personal insights, fresh perspectives

AVOID AI-SOUNDING PHRASES:
- Don't overuse: "Moreover", "Furthermore", "In conclusion", "Overall"
- Don't use vague words like "things", "stuff"  
- DO use contractions: you're, don't, it's
- DO vary sentence lengths
- DO add personal touches and mini-examples

Return ONLY valid JSON with this structure:
{
  "title": "Engaging title under 60 chars with primary keyword",
  "description": "Compelling meta description under 155 chars",
  "content": "Full HTML blog post with proper H2/H3 structure and engaging content",
  "tags": ["primary-keyword", "secondary-keyword", "topic-related"],
  "primaryKeyword": "${primaryKeyword || topic}",
  "wordCount": [estimated word count as number]
}`;

    // Use optimized parameters
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional blog writer who creates engaging, human-like content that ranks well in search engines. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.2,
        presence_penalty: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.log('❌ OpenAI error:', errorData);
      return res.status(500).json({ error: 'OpenAI API error', details: errorData });
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    
    // Parse the JSON response
    let blogContent;
    try {
      blogContent = JSON.parse(rawContent);
      
      // Add SEO analysis
      blogContent.seoAnalysis = {
        titleLength: blogContent.title?.length || 0,
        descriptionLength: blogContent.description?.length || 0,
        hasKeywordInTitle: blogContent.title?.toLowerCase().includes((primaryKeyword || topic).toLowerCase()),
        estimatedReadTime: Math.ceil((blogContent.wordCount || 500) / 200) + ' min'
      };
      
      console.log('🔥 Enhanced blog content generated:', blogContent);
      
    } catch (parseError: unknown) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      console.error('💥 JSON parsing failed:', errorMessage);
      return res.status(500).json({ 
        error: 'Failed to parse generated content', 
        details: errorMessage,
        rawResponse: rawContent.substring(0, 500) 
      });
    }

    res.status(200).json(blogContent);
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('💥 Blog generation error:', errorMessage);
    res.status(500).json({ 
      error: 'Failed to generate blog post',
      details: errorMessage
    });
  }
}
