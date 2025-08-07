import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Types for the API
interface GenerateBlogRequest {
  topic: string;
  audience: 'parents' | 'young-adults' | 'professionals' | 'seniors' | 'general';
  contentLength: '800-1200' | '1200-1800' | '1800+';
  tone: 'professional' | 'casual' | 'friendly' | 'expert';
  keywords: string[];
}

interface GeneratedBlog {
  title: string;
  slug: string;
  description: string;
  content: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  estimatedReadingTime: number;
  suggestedFeaturedImage: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  requests: new Map<string, { count: number; resetTime: number }>(),
};

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRequests = rateLimit.requests.get(ip);

  if (!userRequests || now > userRequests.resetTime) {
    rateLimit.requests.set(ip, { count: 1, resetTime: now + rateLimit.windowMs });
    return true;
  }

  if (userRequests.count >= rateLimit.max) {
    return false;
  }

  userRequests.count++;
  return true;
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// AI Prompts for different content types
const getPrompt = (params: GenerateBlogRequest): string => {
  const { topic, audience, contentLength, tone, keywords } = params;
  
  const audienceMap = {
    'parents': 'parents and families',
    'young-adults': 'young adults and millennials',
    'professionals': 'working professionals',
    'seniors': 'seniors and older adults',
    'general': 'general audience'
  };

  const toneMap = {
    'professional': 'professional and authoritative',
    'casual': 'casual and conversational',
    'friendly': 'friendly and approachable',
    'expert': 'expert and informative'
  };

  const lengthMap = {
    '800-1200': '800-1200 words',
    '1200-1800': '1200-1800 words',
    '1800+': '1800+ words'
  };

  return `Create a comprehensive, SEO-optimized blog post about "${topic}" for gift-giving with the following specifications:

TARGET AUDIENCE: ${audienceMap[audience]}
TONE: ${toneMap[tone]}
LENGTH: ${lengthMap[contentLength]}
SEO KEYWORDS: ${keywords.join(', ')}

REQUIREMENTS:
1. Create an engaging, click-worthy title that includes the main keyword
2. Write a compelling meta description (150-160 characters)
3. Structure the content with proper H2 and H3 headings
4. Include 8-12 specific gift recommendations with price ranges
5. Add practical tips and advice for gift-givers
6. Include a mix of budget-friendly and premium options
7. End with a strong call-to-action to use our AI gift finder tool
8. Optimize for the provided SEO keywords naturally
9. Make the content valuable and actionable for readers

FORMAT THE RESPONSE AS JSON WITH THE FOLLOWING STRUCTURE:
{
  "title": "Engaging title here",
  "description": "Meta description here",
  "content": "Full markdown content with proper formatting",
  "tags": ["tag1", "tag2", "tag3"],
  "metaTitle": "SEO-optimized title (60 characters max)",
  "metaDescription": "SEO meta description (150-160 characters)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "suggestedFeaturedImage": "Brief description of ideal featured image"
}

Ensure the content is original, helpful, and provides real value to readers looking for gift ideas.`;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      error: 'OpenAI API key not configured',
      suggestion: 'Add OPENAI_API_KEY to your environment variables'
    });
  }

  // Rate limiting
  const clientIP = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      suggestion: 'Please wait 15 minutes before making another request'
    });
  }

  try {
    const { topic, audience, contentLength, tone, keywords }: GenerateBlogRequest = req.body;

    // Validate input
    if (!topic || !audience || !contentLength || !tone) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['topic', 'audience', 'contentLength', 'tone'],
        received: { topic, audience, contentLength, tone }
      });
    }

    if (topic.length < 3 || topic.length > 100) {
      return res.status(400).json({
        error: 'Topic must be between 3 and 100 characters'
      });
    }

    // Generate content using OpenAI
    const prompt = getPrompt({ topic, audience, contentLength, tone, keywords: keywords || [] });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert gift-giving blogger and SEO specialist. Create high-quality, engaging content that helps readers find the perfect gifts.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      return res.status(500).json({ error: 'Failed to generate content' });
    }

    // Parse the JSON response
    let parsedResponse: any;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      parsedResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return res.status(500).json({ 
        error: 'Failed to parse generated content',
        rawResponse: responseText.substring(0, 500) + '...'
      });
    }

    // Validate and structure the response
    const generatedBlog: GeneratedBlog = {
      title: parsedResponse.title || `Gift Guide: ${topic}`,
      slug: generateSlug(parsedResponse.title || topic),
      description: parsedResponse.description || '',
      content: parsedResponse.content || '',
      tags: Array.isArray(parsedResponse.tags) ? parsedResponse.tags : [topic, 'gifts', 'gift-guide'],
      metaTitle: parsedResponse.metaTitle || parsedResponse.title || `Gift Guide: ${topic}`,
      metaDescription: parsedResponse.metaDescription || parsedResponse.description || '',
      keywords: Array.isArray(parsedResponse.keywords) ? parsedResponse.keywords : keywords || [],
      estimatedReadingTime: calculateReadingTime(parsedResponse.content || ''),
      suggestedFeaturedImage: parsedResponse.suggestedFeaturedImage || 'Gift-related stock photo'
    };

    // Log usage for monitoring
    console.log(`Blog generated for topic: "${topic}" | Tokens used: ${completion.usage?.total_tokens || 'unknown'}`);

    return res.status(200).json({
      success: true,
      data: generatedBlog,
      usage: {
        totalTokens: completion.usage?.total_tokens,
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens
      }
    });

  } catch (error) {
    console.error('Blog generation error:', error);
    
    if (error instanceof OpenAI.APIError) {
      return res.status(error.status || 500).json({
        error: 'OpenAI API error',
        message: error.message,
        code: error.code
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
