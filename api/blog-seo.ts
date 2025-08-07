import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SEOAnalysisRequest {
  content: string;
  title: string;
  keywords: string[];
  url: string;
}

interface SEOAnalysisResponse {
  seoScore: number;
  metaDescription: string;
  keywordDensity: { [keyword: string]: number };
  suggestions: string[];
  optimizedTitle: string;
  internalLinkSuggestions: string[];
  contentGaps: string[];
}

interface KeywordAnalysisRequest {
  keywords: string[];
  content: string;
}

interface KeywordAnalysisResponse {
  keywordOptimizations: Array<{
    keyword: string;
    density: number;
    optimizationScore: number;
    suggestions: string[];
    relatedKeywords: string[];
  }>;
  overallScore: number;
}

interface ContentOptimizationRequest {
  content: string;
  targetKeywords: string[];
  contentType: 'blog' | 'product' | 'landing';
}

interface ContentOptimizationResponse {
  optimizedContent: string;
  seoScore: number;
  readingTime: number;
  wordCount: number;
  keywordDensity: { [keyword: string]: number };
  suggestions: string[];
}

// Rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const limit = rateLimit.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (limit.count >= 10) { // 10 requests per minute
    return false;
  }
  
  limit.count++;
  return true;
};

// Generate meta description from content
const generateMetaDescription = (content: string, maxLength: number = 160): string => {
  // Remove markdown formatting
  const cleanContent = content
    .replace(/[#*`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();

  // Extract first meaningful paragraph
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  if (sentences.length === 0) {
    return 'Discover amazing gift ideas and recommendations for every occasion.';
  }

  let description = sentences[0].trim();
  
  // Add more sentences if space allows
  for (let i = 1; i < sentences.length; i++) {
    const candidate = description + '. ' + sentences[i].trim();
    if (candidate.length <= maxLength) {
      description = candidate;
    } else {
      break;
    }
  }

  // Ensure it ends with a period
  if (!description.endsWith('.')) {
    description += '.';
  }

  // Truncate if still too long
  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3) + '...';
  }

  return description;
};

// Analyze keyword density
const analyzeKeywordDensity = (content: string, keywords: string[]): { [keyword: string]: number } => {
  const wordCount = content.toLowerCase().split(/\s+/).filter(word => word.length > 0).length;
  const density: { [keyword: string]: number } = {};

  keywords.forEach(keyword => {
    const regex = new RegExp(keyword.toLowerCase(), 'gi');
    const matches = content.toLowerCase().match(regex);
    const count = matches ? matches.length : 0;
    density[keyword] = wordCount > 0 ? (count / wordCount) * 100 : 0;
  });

  return density;
};

// Calculate SEO score
const calculateSEOScore = (content: string, title: string, keywords: string[]): number => {
  let score = 0;
  
  // Title optimization (25 points)
  if (title.length >= 30 && title.length <= 60) score += 25;
  else if (title.length > 0) score += 15;

  // Content length (20 points)
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 2000) score += 20;
  else if (wordCount > 0) score += 10;

  // Keyword optimization (30 points)
  const density = analyzeKeywordDensity(content, keywords);
  const avgDensity = Object.values(density).reduce((sum, d) => sum + d, 0) / keywords.length;
  if (avgDensity >= 0.5 && avgDensity <= 2.5) score += 30;
  else if (avgDensity > 0) score += 15;

  // Heading structure (15 points)
  const h2Count = (content.match(/^##\s+/gm) || []).length;
  const h3Count = (content.match(/^###\s+/gm) || []).length;
  if (h2Count >= 2 && h3Count >= 3) score += 15;
  else if (h2Count > 0 || h3Count > 0) score += 8;

  // Internal links (10 points)
  const internalLinks = (content.match(/\[([^\]]+)\]\([^)]*\)/g) || []).length;
  if (internalLinks >= 2) score += 10;
  else if (internalLinks > 0) score += 5;

  return Math.min(100, score);
};

// Generate SEO suggestions
const generateSEOSuggestions = (content: string, title: string, keywords: string[], score: number): string[] => {
  const suggestions: string[] = [];
  
  if (score < 50) {
    suggestions.push('Optimize title length (30-60 characters)');
    suggestions.push('Increase content length (minimum 300 words)');
    suggestions.push('Add more relevant keywords naturally');
  }
  
  if (title.length < 30) {
    suggestions.push('Title is too short - aim for 30-60 characters');
  } else if (title.length > 60) {
    suggestions.push('Title is too long - keep under 60 characters');
  }
  
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 300) {
    suggestions.push('Content is too short - expand to at least 300 words');
  }
  
  const density = analyzeKeywordDensity(content, keywords);
  const avgDensity = Object.values(density).reduce((sum, d) => sum + d, 0) / keywords.length;
  if (avgDensity < 0.5) {
    suggestions.push('Increase keyword density - aim for 0.5-2.5%');
  } else if (avgDensity > 2.5) {
    suggestions.push('Reduce keyword density - avoid over-optimization');
  }
  
  const h2Count = (content.match(/^##\s+/gm) || []).length;
  if (h2Count < 2) {
    suggestions.push('Add more H2 headings for better structure');
  }
  
  const internalLinks = (content.match(/\[([^\]]+)\]\([^)]*\)/g) || []).length;
  if (internalLinks < 2) {
    suggestions.push('Add internal links to improve site structure');
  }
  
  return suggestions;
};

// Optimize title for SEO
const optimizeTitle = (title: string, keywords: string[]): string => {
  if (title.length >= 30 && title.length <= 60) {
    return title; // Already optimized
  }
  
  // Try to include primary keyword
  const primaryKeyword = keywords[0];
  if (primaryKeyword && !title.toLowerCase().includes(primaryKeyword.toLowerCase())) {
    const optimized = `${title} - ${primaryKeyword}`;
    if (optimized.length <= 60) {
      return optimized;
    }
  }
  
  // Truncate if too long
  if (title.length > 60) {
    return title.substring(0, 57) + '...';
  }
  
  return title;
};

// Generate internal link suggestions
const generateInternalLinkSuggestions = (content: string, keywords: string[]): string[] => {
  const suggestions: string[] = [];
  
  // Suggest linking to related topics
  keywords.forEach(keyword => {
    if (keyword.includes('gift')) {
      suggestions.push(`Link to "gift guide" or "gift ideas" pages`);
    }
    if (keyword.includes('birthday')) {
      suggestions.push(`Link to "birthday gift" related content`);
    }
    if (keyword.includes('christmas')) {
      suggestions.push(`Link to "holiday gift" or "christmas gift" content`);
    }
  });
  
  return [...new Set(suggestions)]; // Remove duplicates
};

// Analyze content gaps
const analyzeContentGaps = (content: string, keywords: string[]): string[] => {
  const gaps: string[] = [];
  
  // Check for missing content types
  if (!content.includes('##') && !content.includes('###')) {
    gaps.push('Add more headings for better content structure');
  }
  
  if (!content.includes('*') && !content.includes('-')) {
    gaps.push('Add bullet points or lists for better readability');
  }
  
  if (!content.includes('![')) {
    gaps.push('Consider adding images to improve engagement');
  }
  
  // Check for missing keyword variations
  keywords.forEach(keyword => {
    if (!content.toLowerCase().includes(keyword.toLowerCase())) {
      gaps.push(`Include "${keyword}" in your content`);
    }
  });
  
  return gaps;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Rate limiting
  const clientIP = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIP)) {
    res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    return;
  }

  try {
    const { action, ...data } = req.body;

    switch (action) {
      case 'analyze-seo':
        await handleSEOAnalysis(req, res, data as SEOAnalysisRequest);
        break;
      
      case 'analyze-keywords':
        await handleKeywordAnalysis(req, res, data as KeywordAnalysisRequest);
        break;
      
      case 'optimize-content':
        await handleContentOptimization(req, res, data as ContentOptimizationRequest);
        break;
      
      default:
        res.status(400).json({ error: 'Invalid action specified' });
    }
  } catch (error) {
    console.error('SEO API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleSEOAnalysis(
  req: VercelRequest,
  res: VercelResponse,
  data: SEOAnalysisRequest
) {
  const { content, title, keywords, url } = data;

  if (!content || !title || !keywords || !Array.isArray(keywords)) {
    res.status(400).json({ error: 'Missing required fields: content, title, keywords' });
    return;
  }

  try {
    const seoScore = calculateSEOScore(content, title, keywords);
    const metaDescription = generateMetaDescription(content);
    const keywordDensity = analyzeKeywordDensity(content, keywords);
    const suggestions = generateSEOSuggestions(content, title, keywords, seoScore);
    const optimizedTitle = optimizeTitle(title, keywords);
    const internalLinkSuggestions = generateInternalLinkSuggestions(content, keywords);
    const contentGaps = analyzeContentGaps(content, keywords);

    const response: SEOAnalysisResponse = {
      seoScore,
      metaDescription,
      keywordDensity,
      suggestions,
      optimizedTitle,
      internalLinkSuggestions,
      contentGaps
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('SEO Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze SEO' });
  }
}

async function handleKeywordAnalysis(
  req: VercelRequest,
  res: VercelResponse,
  data: KeywordAnalysisRequest
) {
  const { keywords, content } = data;

  if (!keywords || !Array.isArray(keywords) || !content) {
    res.status(400).json({ error: 'Missing required fields: keywords, content' });
    return;
  }

  try {
    const keywordOptimizations = keywords.map(keyword => {
      const density = analyzeKeywordDensity(content, [keyword])[keyword];
      let optimizationScore = 0;
      const suggestions: string[] = [];

      if (density < 0.5) {
        optimizationScore += 30;
        suggestions.push(`Increase usage of "${keyword}" in content`);
      } else if (density > 2.5) {
        optimizationScore += 20;
        suggestions.push(`Reduce overuse of "${keyword}" - aim for 1-2% density`);
      } else {
        optimizationScore += 50;
      }

      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        optimizationScore += 20;
      } else {
        suggestions.push(`Add "${keyword}" to your content`);
      }

      // Generate related keywords
      const relatedKeywords = generateRelatedKeywords(keyword);

      return {
        keyword,
        density,
        optimizationScore: Math.min(100, optimizationScore),
        suggestions,
        relatedKeywords
      };
    });

    const overallScore = Math.round(
      keywordOptimizations.reduce((sum, k) => sum + k.optimizationScore, 0) / keywordOptimizations.length
    );

    const response: KeywordAnalysisResponse = {
      keywordOptimizations,
      overallScore
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Keyword Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze keywords' });
  }
}

async function handleContentOptimization(
  req: VercelRequest,
  res: VercelResponse,
  data: ContentOptimizationRequest
) {
  const { content, targetKeywords, contentType } = data;

  if (!content || !targetKeywords || !Array.isArray(targetKeywords)) {
    res.status(400).json({ error: 'Missing required fields: content, targetKeywords' });
    return;
  }

  try {
    // Basic content optimization
    let optimizedContent = content;
    
    // Ensure proper heading structure
    if (!optimizedContent.includes('##')) {
      optimizedContent = `## Introduction\n\n${optimizedContent}`;
    }

    // Add conclusion if missing
    if (!optimizedContent.includes('## Conclusion') && !optimizedContent.includes('## Summary')) {
      optimizedContent += '\n\n## Conclusion\n\nIn conclusion, this guide provides comprehensive insights for finding the perfect gifts.';
    }

    const seoScore = calculateSEOScore(optimizedContent, 'Optimized Content', targetKeywords);
    const readingTime = Math.ceil(optimizedContent.split(/\s+/).length / 200);
    const wordCount = optimizedContent.split(/\s+/).length;
    const keywordDensity = analyzeKeywordDensity(optimizedContent, targetKeywords);
    const suggestions = generateSEOSuggestions(optimizedContent, 'Optimized Content', targetKeywords, seoScore);

    const response: ContentOptimizationResponse = {
      optimizedContent,
      seoScore,
      readingTime,
      wordCount,
      keywordDensity,
      suggestions
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Content Optimization Error:', error);
    res.status(500).json({ error: 'Failed to optimize content' });
  }
}

// Helper function to generate related keywords
function generateRelatedKeywords(keyword: string): string[] {
  const keywordMap: { [key: string]: string[] } = {
    'gift': ['present', 'surprise', 'treat', 'gift idea', 'gift guide'],
    'birthday': ['birthday gift', 'birthday present', 'birthday surprise'],
    'christmas': ['christmas gift', 'holiday gift', 'christmas present'],
    'anniversary': ['anniversary gift', 'romantic gift', 'couple gift'],
    'tech': ['technology', 'electronic', 'gadget', 'smart device'],
    'fashion': ['style', 'clothing', 'accessory', 'trendy'],
    'cooking': ['kitchen', 'culinary', 'food', 'recipe'],
    'fitness': ['workout', 'exercise', 'health', 'sports'],
    'travel': ['vacation', 'trip', 'adventure', 'journey'],
    'gaming': ['video game', 'console', 'gamer', 'esports']
  };

  return keywordMap[keyword.toLowerCase()] || [];
}
