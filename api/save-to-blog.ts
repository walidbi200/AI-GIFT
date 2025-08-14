import type { VercelRequest, VercelResponse } from '@vercel/node';
import { addBlogPost } from './blog-posts';

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
  filePath?: string;
  warnings: string[];
  wordpressPublished: boolean;
  message: string;
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
  const textContent = content.replace(/<[^>]*>/g, ' ');
  const wordCount = textContent.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Generate blog content using AI (simplified version for production)
async function generateBlogContent(brief: SaveToBlogRequest): Promise<{ content: string; description: string; tags: string[] }> {
  try {
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
    console.error('Error generating content with OpenAI:', error);
    
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

    return { 
      content: fallbackContent, 
      description: fallbackDescription, 
      tags: fallbackTags 
    };
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      message: 'Method not allowed. Only POST requests are supported.'
    });
    return;
  }

  try {
    console.log('🚀 Save to Blog API called');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));

    // Validate request body
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

    // Validate required fields
    if (!title || !targetAudience || !goal || !primaryKeyword) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: title, targetAudience, goal, primaryKeyword'
      });
      return;
    }

    // Create editorial brief
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

    console.log('📋 Editorial brief created:', brief);

    // Generate blog content
    console.log('🔄 Starting blog generation process...');
    const { content, description, tags } = await generateBlogContent(brief);

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

    // Add to shared blog posts storage
    addBlogPost(newPost);

    console.log('✅ Blog generation completed:', {
      success: true,
      postId: newPost.id,
      slug: newPost.slug,
      wordCount: newPost.wordCount
    });

    // Prepare response
    const response: SaveToBlogResponse = {
      success: true,
      filePath: `/blog/${newPost.slug}`,
      warnings: [],
      wordpressPublished: false,
      message: 'Blog post generated and saved successfully!'
    };

    // Send success response
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Save to Blog API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      warnings: [errorMessage],
      wordpressPublished: false,
      message: `Blog generation failed: ${errorMessage}`
    });
  }
}
