import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BlogGenerationService } from '../src/services/blogGenerationService';

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

    // Initialize blog generation service
    const blogService = new BlogGenerationService();

    // Generate and save blog
    console.log('🔄 Starting blog generation process...');
    const result = await blogService.generateAndSaveBlog(brief);

    console.log('✅ Blog generation completed:', {
      success: result.success,
      filePath: result.filePath,
      warningsCount: result.warnings.length,
      wordpressPublished: result.wordpressPublished
    });

    // Prepare response
    const response: SaveToBlogResponse = {
      success: result.success,
      filePath: result.filePath,
      warnings: result.warnings,
      wordpressPublished: result.wordpressPublished,
      message: result.success 
        ? 'Blog post generated and saved successfully!' 
        : 'Blog generation failed. Check warnings for details.'
    };

    // Log warnings if any
    if (result.warnings.length > 0) {
      console.log('⚠️ Warnings generated:', result.warnings);
    }

    // Send response
    if (result.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }

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
