import type { VercelRequest, VercelResponse } from '@vercel/node';
import { addBlogPost } from './blog-posts';

// Serverless-compatible interfaces
interface SaveToBlogRequest {
  title: string;
  targetAudience: string;
  goal: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  toneOfVoice: string;
  outline: string[];
  references: string[];
  specialNotes: string[];
  featuredImage?: string;
}

interface SaveToBlogResponse {
  success: boolean;
  message: string;
  data?: {
    filePath?: string;
    postId?: string;
    slug?: string;
    wordCount?: number;
  };
  errors?: string[];
  timestamp: string;
  requestId: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  tags: string[];
  publishedAt: string;
  status: 'published' | 'draft';
  readingTime: number;
  wordCount: number;
  featuredImage?: string;
}

// Utility functions
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, ' ');
  const wordCount = textContent.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Serverless-compatible validation
function validateBlogRequest(body: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    // Check if body exists
    if (!body || typeof body !== 'object') {
      errors.push('Request body is missing or invalid');
      return { isValid: false, errors };
    }

    // Validate title (required, 1-200 chars)
    if (!body.title || typeof body.title !== 'string') {
      errors.push('Title is required and must be a string');
    } else {
      const title = body.title.trim();
      if (title.length === 0) {
        errors.push('Title cannot be empty');
      } else if (title.length > 200) {
        errors.push('Title must be 200 characters or less');
      }
    }

    // Validate targetAudience (required, 1-100 chars)
    if (!body.targetAudience || typeof body.targetAudience !== 'string') {
      errors.push('Target audience is required and must be a string');
    } else {
      const audience = body.targetAudience.trim();
      if (audience.length === 0) {
        errors.push('Target audience cannot be empty');
      } else if (audience.length > 100) {
        errors.push('Target audience must be 100 characters or less');
      }
    }

    // Validate goal (required, 1-50 chars)
    if (!body.goal || typeof body.goal !== 'string') {
      errors.push('Goal is required and must be a string');
    } else {
      const goal = body.goal.trim();
      if (goal.length === 0) {
        errors.push('Goal cannot be empty');
      } else if (goal.length > 50) {
        errors.push('Goal must be 50 characters or less');
      }
    }

    // Validate primaryKeyword (required, 1-50 chars)
    if (!body.primaryKeyword || typeof body.primaryKeyword !== 'string') {
      errors.push('Primary keyword is required and must be a string');
    } else {
      const keyword = body.primaryKeyword.trim();
      if (keyword.length === 0) {
        errors.push('Primary keyword cannot be empty');
      } else if (keyword.length > 50) {
        errors.push('Primary keyword must be 50 characters or less');
      }
    }

    // Validate secondaryKeywords (optional array, max 10 items)
    if (body.secondaryKeywords !== undefined) {
      if (!Array.isArray(body.secondaryKeywords)) {
        errors.push('Secondary keywords must be an array');
      } else if (body.secondaryKeywords.length > 10) {
        errors.push('Secondary keywords cannot exceed 10 items');
      } else {
        body.secondaryKeywords.forEach((keyword: any, index: number) => {
          if (typeof keyword !== 'string' || keyword.trim().length === 0) {
            errors.push(`Secondary keyword at index ${index} must be a non-empty string`);
          } else if (keyword.trim().length > 50) {
            errors.push(`Secondary keyword at index ${index} must be 50 characters or less`);
          }
        });
      }
    }

    // Validate other fields
    if (body.outline !== undefined && !Array.isArray(body.outline)) {
      errors.push('Outline must be an array');
    }
    if (body.references !== undefined && !Array.isArray(body.references)) {
      errors.push('References must be an array');
    }
    if (body.specialNotes !== undefined && !Array.isArray(body.specialNotes)) {
      errors.push('Special notes must be an array');
    }
    if (body.featuredImage !== undefined && typeof body.featuredImage !== 'string') {
      errors.push('Featured image must be a string');
    }

  } catch (validationError) {
    console.error('Validation error:', validationError);
    errors.push('Request validation failed');
  }

  return { isValid: errors.length === 0, errors };
}

// Serverless-compatible content generation
async function generateBlogContent(brief: SaveToBlogRequest): Promise<{ content: string; description: string; tags: string[] }> {
  try {
    console.log('🤖 Attempting to generate content with OpenAI...');
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API key not found, using fallback content');
      throw new Error('OpenAI API key not configured');
    }

    // Use OpenAI API to generate content
    const openai = require('openai');
    const client = new openai.OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `Write a blog post about "${brief.title}" for ${brief.targetAudience}. 
    
    Requirements:
    - Goal: ${brief.goal}
    - Primary keyword: ${brief.primaryKeyword}
    - Secondary keywords: ${brief.secondaryKeywords.join(', ')}
    - Tone: ${brief.toneOfVoice}
    - Outline: ${brief.outline.join(', ')}
    - Special notes: ${brief.specialNotes.join(', ')}
    
    Please write a comprehensive, engaging blog post that includes:
    1. An introduction that hooks the reader
    2. Well-structured content with headings
    3. Practical tips and actionable advice
    4. A conclusion that summarizes key points
    
    Format the response as HTML with proper headings (h2, h3) and paragraphs.`;

    console.log('📝 Sending request to OpenAI...');
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional content writer specializing in gift guides and lifestyle content. Write engaging, SEO-friendly blog posts that provide real value to readers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || '';
    console.log('✅ OpenAI content generated successfully');
    
    // Generate description from content
    const description = content
      .replace(/<[^>]*>/g, '')
      .substring(0, 160)
      .trim() + '...';

    // Generate tags from keywords and content
    const tags = [
      brief.primaryKeyword,
      ...brief.secondaryKeywords,
      'gift ideas',
      'lifestyle'
    ].filter(Boolean);

    return { content, description, tags };
  } catch (error) {
    console.error('❌ Error generating content with OpenAI:', error);
    console.error('📋 Error stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    
    console.log('🔄 Using fallback content generation...');
    
    // Fallback content if OpenAI fails
    const fallbackContent = `
      <h2>Introduction</h2>
      <p>Welcome to our guide on ${brief.title}. This comprehensive resource is designed specifically for ${brief.targetAudience} who are looking for ${brief.primaryKeyword}.</p>
      
      <h2>Understanding Your Needs</h2>
      <p>When it comes to ${brief.primaryKeyword}, it's important to consider what matters most to ${brief.targetAudience}. Whether you're looking for ${brief.secondaryKeywords.join(' or ')}, we've got you covered.</p>
      
      <h2>Key Considerations</h2>
      <p>Before making any decisions about ${brief.primaryKeyword}, consider these important factors:</p>
      <ul>
        <li>Quality and durability</li>
        <li>Value for money</li>
        <li>Personal preferences</li>
        <li>Practical usability</li>
      </ul>
      
      <h2>Our Top Recommendations</h2>
      <p>Based on extensive research and feedback from ${brief.targetAudience}, here are our top picks for ${brief.primaryKeyword}:</p>
      
      <h3>1. Premium Option</h3>
      <p>For those who want the best of the best, consider investing in a high-quality option that offers exceptional features and longevity.</p>
      
      <h3>2. Budget-Friendly Choice</h3>
      <p>If you're working with a limited budget, there are excellent options available that provide great value without compromising on quality.</p>
      
      <h3>3. Most Popular Pick</h3>
      <p>This option strikes the perfect balance between quality and affordability, making it a favorite among ${brief.targetAudience}.</p>
      
      <h2>Making Your Decision</h2>
      <p>When choosing the right ${brief.primaryKeyword}, remember that the best choice is one that aligns with your specific needs and preferences. Consider your budget, requirements, and long-term goals.</p>
      
      <h2>Conclusion</h2>
      <p>We hope this guide has helped you understand the key aspects of ${brief.primaryKeyword} and how to choose the best option for your needs. Remember, the right choice is one that brings you satisfaction and meets your expectations.</p>
    `;

    const fallbackDescription = `Discover the best ${brief.primaryKeyword} options for ${brief.targetAudience}. Our comprehensive guide covers everything you need to know to make an informed decision.`;

    const fallbackTags = [brief.primaryKeyword, ...brief.secondaryKeywords, 'gift ideas', 'lifestyle'].filter(Boolean);

    console.log('✅ Fallback content generated successfully');
    return { 
      content: fallbackContent, 
      description: fallbackDescription, 
      tags: fallbackTags 
    };
  }
}

// Serverless-compatible response helper
function sendJsonResponse(
  res: VercelResponse, 
  statusCode: number, 
  success: boolean, 
  message: string, 
  data?: any, 
  errors?: string[]
): void {
  try {
    const response: SaveToBlogResponse = {
      success,
      message,
      data,
      errors,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    console.log(`📤 Sending ${statusCode} response:`, JSON.stringify(response, null, 2));
    res.status(statusCode).json(response);
  } catch (responseError) {
    console.error('❌ Error sending response:', responseError);
    // Fallback response if JSON serialization fails
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  }
}

// Main serverless function handler
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`🚀 Save to Blog API called [${requestId}]`);
    console.log('📋 Request method:', req.method);
    console.log('📋 Request headers:', JSON.stringify(req.headers, null, 2));
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      console.log('✅ CORS preflight request handled');
      res.status(200).end();
      return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('❌ Invalid method:', req.method);
      sendJsonResponse(
        res, 
        405, 
        false, 
        'Method not allowed. Only POST requests are supported.'
      );
      return;
    }

    // Log incoming payload
    console.log('📝 Incoming payload:', JSON.stringify(req.body, null, 2));
    console.log('📝 Request body type:', typeof req.body);
    console.log('📝 Request body keys:', req.body ? Object.keys(req.body) : 'No body');

    // Validate request body
    const validation = validateBlogRequest(req.body);
    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.errors);
      sendJsonResponse(
        res, 
        400, 
        false, 
        'Invalid request data', 
        undefined, 
        validation.errors
      );
      return;
    }

    console.log('✅ Request validation passed');

    const {
      title,
      targetAudience,
      goal,
      primaryKeyword,
      secondaryKeywords,
      toneOfVoice,
      outline,
      references,
      specialNotes,
      featuredImage
    }: SaveToBlogRequest = req.body;

    // Create editorial brief with additional validation
    const brief = {
      title: title.trim(),
      targetAudience: targetAudience.trim(),
      goal: goal.trim(),
      primaryKeyword: primaryKeyword.trim(),
      secondaryKeywords: Array.isArray(secondaryKeywords) ? secondaryKeywords : [],
      toneOfVoice: toneOfVoice?.trim() || 'friendly',
      outline: Array.isArray(outline) ? outline : [],
      references: Array.isArray(references) ? references : [],
      specialNotes: Array.isArray(specialNotes) ? specialNotes : [],
      featuredImage: featuredImage?.trim()
    };

    console.log('📋 Editorial brief created:', JSON.stringify(brief, null, 2));

    // Generate blog content
    console.log('🔄 Starting blog generation process...');
    const { content, description, tags } = await generateBlogContent(brief);

    console.log('✅ Content generation completed');
    console.log('📝 Content length:', content.length);
    console.log('📝 Description:', description);
    console.log('📝 Tags:', tags);

    // Create blog post
    const newPost: BlogPost = {
      id: `post_${Date.now()}`,
      title: brief.title,
      slug: generateSlug(brief.title),
      description,
      content,
      tags,
      publishedAt: new Date().toISOString(),
      status: 'published',
      readingTime: calculateReadingTime(content),
      wordCount: content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length,
      featuredImage: brief.featuredImage
    };

    console.log('📝 Blog post object created:', JSON.stringify({
      id: newPost.id,
      title: newPost.title,
      slug: newPost.slug,
      wordCount: newPost.wordCount,
      readingTime: newPost.readingTime
    }, null, 2));

    // Add to shared blog posts storage
    console.log('💾 Saving blog post to storage...');
    try {
      addBlogPost(newPost);
      console.log('✅ Blog post saved to storage successfully');
    } catch (storageError) {
      console.error('❌ Error saving to storage:', storageError);
      throw new Error(`Failed to save blog post to storage: ${storageError instanceof Error ? storageError.message : 'Unknown storage error'}`);
    }

    console.log('✅ Blog generation completed successfully:', {
      success: true,
      postId: newPost.id,
      slug: newPost.slug,
      wordCount: newPost.wordCount
    });

    // Send success response
    sendJsonResponse(
      res, 
      200, 
      true, 
      'Blog post generated and saved successfully!',
      {
        filePath: `/blog/${newPost.slug}`,
        postId: newPost.id,
        slug: newPost.slug,
        wordCount: newPost.wordCount
      }
    );

  } catch (error) {
    console.error('❌ Save to Blog API error:', error);
    console.error('📋 Error stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    console.error('📋 Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('📋 Error message:', error instanceof Error ? error.message : 'Unknown error');
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    sendJsonResponse(
      res, 
      500, 
      false, 
      `Blog generation failed: ${errorMessage}`,
      undefined,
      [errorMessage]
    );
  }
}
