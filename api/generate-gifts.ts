import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { OpenAI } from 'openai';

// Initialize Redis for caching (graceful degradation if not configured)
let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (error) {
  console.error('[REDIS INIT ERROR]', error);
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



interface GiftSuggestion {
  id?: string;
  name: string;
  description: string;
  reason?: string;
  price?: string;
  category?: string;
  link?: string;
}

import { checkRateLimit, giftRateLimit } from './middleware/rateLimit';
import { GiftRequestSchema, validateAndSanitize, formatValidationErrors } from '../src/utils/validation';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://www.smartgiftfinder.xyz',
    'https://smartgiftfinder.xyz',
  ];
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check rate limit BEFORE processing request
  const rateLimitPassed = await checkRateLimit(req, res, giftRateLimit);
  if (!rateLimitPassed) {
    return; // Response already sent by checkRateLimit
  }

  try {
    // Validate input with Zod
    const validation = validateAndSanitize(GiftRequestSchema, req.body);

    if (!validation.success) {
      const errors = formatValidationErrors(validation.errors);
      return res.status(400).json({
        error: 'Invalid input',
        validationErrors: errors,
      });
    }

    const { recipient, occasion, budget, interests, negativeKeywords } = validation.data;

    // Create cache key (data is already sanitized by Zod transforms)
    const cacheKey = `gifts:v1:${recipient}:${occasion}:${budget}:${interests}:${negativeKeywords}`;

    // Check cache first (if Redis is configured)
    if (redis) {
      try {
        const cachedResponse = await redis.get<GiftSuggestion[]>(cacheKey);
        if (cachedResponse && Array.isArray(cachedResponse)) {
          console.log('[CACHE HIT]', cacheKey);
          return res.status(200).json({
            gifts: cachedResponse,
            cached: true,
            timestamp: new Date().toISOString(),
          });
        }
        console.log('[CACHE MISS]', cacheKey);
      } catch (cacheError) {
        console.error('[CACHE READ ERROR]', cacheError);
        // Continue to OpenAI if cache fails - graceful degradation
      }
    } else {
      console.log('[CACHE DISABLED] Redis not configured');
    }

    // Build optimized prompt
    const systemPrompt = 'You are a professional gift recommendation expert. Provide thoughtful, creative gift ideas in valid JSON format only. Do not include markdown formatting or code blocks.';

    const userPrompt = `Generate exactly 5 unique and thoughtful gift suggestions for:

Recipient: ${recipient}
Occasion: ${occasion}
Budget: $${budget}
${interests ? `Interests/Hobbies: ${interests}` : ''}
${negativeKeywords ? `Things to avoid: ${negativeKeywords}` : ''}

Return ONLY a JSON array with this exact structure:
[
  {
    "id": "1",
    "name": "🎁 Gift Name (specific product, 50 chars max)",
    "description": "Why this gift is perfect (100-150 chars)",
    "reason": "Explanation of why it's a great choice (one sentence)"
  }
]

Requirements:
- Return ONLY the JSON array, no other text
- Each gift must be unique and thoughtful
- Include relevant emoji in the name
- Descriptions should explain why it fits the recipient
- Price should match the budget range of $${budget}
- Focus on specific, searchable products when possible`;

    // Call OpenAI API
    console.log('[OPENAI API CALL]', { occasion: occasion, budget: budget });
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = completion.choices[0]?.message?.content || '[]';

    // Parse JSON response
    let gifts: GiftSuggestion[] = [];
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const jsonStartIndex = cleanContent.indexOf('[');
      const jsonEndIndex = cleanContent.lastIndexOf(']');

      if (jsonStartIndex === -1 || jsonEndIndex === -1) {
        throw new Error('No JSON array found in response');
      }

      const jsonString = cleanContent.substring(jsonStartIndex, jsonEndIndex + 1);
      gifts = JSON.parse(jsonString);

      // Validate response structure
      if (!Array.isArray(gifts) || gifts.length === 0) {
        throw new Error('Invalid response format');
      }

      // Add Amazon affiliate links
      const affiliateTag = process.env.AMAZON_AFFILIATE_TAG;
      gifts = gifts.map((gift, index) => ({
        ...gift,
        id: gift.id || String(index + 1),
        link: `https://www.amazon.com/s?k=${encodeURIComponent(gift.name)}&tag=${affiliateTag || ''}`
      }));

    } catch (parseError) {
      console.error('[PARSE ERROR]', content.substring(0, 200));

      // Fallback to mock data if parsing fails
      gifts = [
        {
          id: "1",
          name: "🎁 Personalized Gift",
          description: "A thoughtful personalized item perfect for the occasion",
          reason: "Personalized gifts show extra thought and care",
          link: `https://www.amazon.com/s?k=personalized+gifts&tag=${process.env.AMAZON_AFFILIATE_TAG || ''}`
        },
        {
          id: "2",
          name: "✨ Experience Gift",
          description: "Create lasting memories with an experience gift",
          reason: "Experiences often mean more than physical items",
          link: `https://www.amazon.com/s?k=experience+gifts&tag=${process.env.AMAZON_AFFILIATE_TAG || ''}`
        },
        {
          id: "3",
          name: "🎯 Practical Gift",
          description: "Something useful they'll appreciate every day",
          reason: "Practical gifts provide lasting value",
          link: `https://www.amazon.com/s?k=practical+gifts&tag=${process.env.AMAZON_AFFILIATE_TAG || ''}`
        }
      ];
    }

    // Cache the successful response for 7 days (604800 seconds)
    if (redis && gifts.length > 0) {
      try {
        await redis.setex(cacheKey, 604800, gifts);
        console.log('[CACHED]', cacheKey, `(${gifts.length} gifts, 7 days TTL)`);
      } catch (cacheError) {
        console.error('[CACHE WRITE ERROR]', cacheError);
        // Don't fail the request if caching fails
      }
    }

    return res.status(200).json({
      gifts,
      cached: false,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[API ERROR]', error);

    // Check if it's an OpenAI API error
    if (error.status === 401) {
      return res.status(500).json({
        error: 'OpenAI API authentication failed. Please check API key configuration.',
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again in a moment.',
      });
    }

    return res.status(500).json({
      error: 'Failed to generate gift recommendations',
      message: process.env.NODE_ENV === 'development' ? String(error.message) : 'Internal server error',
    });
  }
}