// Advanced SEO utilities for blog optimization and analysis

import type { Post } from '../types/post';

export interface SEOAnalysis {
  score: number;
  suggestions: string[];
  metaDescription: string;
  keywordDensity: { [keyword: string]: number };
  internalLinks: string[];
  contentGaps: string[];
  competitorInsights: CompetitorInsight[];
}

export interface CompetitorInsight {
  keyword: string;
  competitorUrls: string[];
  estimatedTraffic: number;
  contentGaps: string[];
  opportunities: string[];
}

export interface InternalLinkSuggestion {
  sourcePost: Post;
  targetPost: Post;
  relevance: number;
  anchorText: string;
  context: string;
}

export interface ContentGapAnalysis {
  missingKeywords: string[];
  lowCompetitionKeywords: string[];
  trendingTopics: string[];
  seasonalOpportunities: string[];
}

export interface KeywordOptimization {
  primaryKeyword: string;
  relatedKeywords: string[];
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  optimizationScore: number;
  suggestions: string[];
}

// Auto-generate meta descriptions from content
export const generateMetaDescription = (content: string, maxLength: number = 160): string => {
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

// Generate internal linking suggestions
export const generateInternalLinkSuggestions = (
  currentPost: Post,
  allPosts: Post[],
  maxSuggestions: number = 5
): InternalLinkSuggestion[] => {
  const suggestions: InternalLinkSuggestion[] = [];
  
  // Calculate relevance scores
  allPosts.forEach(targetPost => {
    if (targetPost.slug === currentPost.slug) return;

    let relevance = 0;
    let anchorText = '';
    let context = '';

    // Tag overlap
    const commonTags = currentPost.tags.filter(tag => targetPost.tags.includes(tag));
    relevance += commonTags.length * 10;

    // Content similarity (simple keyword matching)
    const currentWords = currentPost.content.toLowerCase().split(/\s+/);
    const targetWords = targetPost.content.toLowerCase().split(/\s+/);
    const commonWords = currentWords.filter(word => 
      word.length > 3 && targetWords.includes(word)
    );
    relevance += commonWords.length * 2;

    // Topic relevance
    if (currentPost.title.toLowerCase().includes('gift') && targetPost.title.toLowerCase().includes('gift')) {
      relevance += 15;
    }

    if (relevance > 5) {
      // Generate anchor text
      anchorText = commonTags.length > 0 ? commonTags[0] : targetPost.title.split(' ').slice(0, 3).join(' ');
      
      // Generate context
      context = `Related to ${commonTags.length > 0 ? commonTags.join(', ') : 'gift ideas'}`;

      suggestions.push({
        sourcePost: currentPost,
        targetPost,
        relevance,
        anchorText,
        context
      });
    }
  });

  // Sort by relevance and return top suggestions
  return suggestions
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, maxSuggestions);
};

// Analyze keyword optimization opportunities
export const analyzeKeywordOptimization = (
  content: string,
  targetKeywords: string[]
): KeywordOptimization[] => {
  const optimizations: KeywordOptimization[] = [];

  targetKeywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const contentLower = content.toLowerCase();
    
    // Count keyword occurrences
    const regex = new RegExp(keywordLower, 'gi');
    const matches = contentLower.match(regex);
    const count = matches ? matches.length : 0;
    
    // Calculate density
    const wordCount = contentLower.split(/\s+/).length;
    const density = wordCount > 0 ? (count / wordCount) * 100 : 0;
    
    // Generate related keywords
    const relatedKeywords = generateRelatedKeywords(keyword);
    
    // Mock search volume and competition (in real app, this would come from SEO APIs)
    const searchVolume = Math.floor(Math.random() * 10000) + 100;
    const competition = density < 0.5 ? 'low' : density < 1.5 ? 'medium' : 'high';
    
    // Calculate optimization score
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
    
    if (contentLower.includes(keywordLower)) {
      optimizationScore += 20;
    } else {
      suggestions.push(`Add "${keyword}" to your content`);
    }
    
    // Check for keyword in title
    if (contentLower.includes(`# ${keywordLower}`) || contentLower.includes(`## ${keywordLower}`)) {
      optimizationScore += 30;
    } else {
      suggestions.push(`Use "${keyword}" in a heading`);
    }

    optimizations.push({
      primaryKeyword: keyword,
      relatedKeywords,
      searchVolume,
      competition,
      optimizationScore: Math.min(100, optimizationScore),
      suggestions
    });
  });

  return optimizations;
};

// Generate related keywords
const generateRelatedKeywords = (keyword: string): string[] => {
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
};

// Analyze content gaps
export const analyzeContentGaps = (
  existingPosts: Post[],
  targetKeywords: string[]
): ContentGapAnalysis => {
  const existingKeywords = new Set<string>();
  const existingTopics = new Set<string>();

  // Extract keywords from existing posts
  existingPosts.forEach(post => {
    post.tags.forEach(tag => existingKeywords.add(tag.toLowerCase()));
    existingTopics.add(post.title.toLowerCase());
  });

  // Find missing keywords
  const missingKeywords = targetKeywords.filter(keyword => 
    !existingKeywords.has(keyword.toLowerCase())
  );

  // Generate low competition keywords (mock data)
  const lowCompetitionKeywords = [
    'unique gift ideas',
    'personalized gifts',
    'eco-friendly gifts',
    'budget-friendly gifts',
    'last-minute gifts',
    'luxury gift guide',
    'tech gifts for seniors',
    'gifts for remote workers'
  ].filter(keyword => !existingKeywords.has(keyword));

  // Generate trending topics (mock data)
  const trendingTopics = [
    'sustainable gift wrapping',
    'virtual gift experiences',
    'subscription box gifts',
    'local artisan gifts',
    'digital gift cards',
    'experience gifts',
    'charitable gifts',
    'zero-waste gifts'
  ];

  // Generate seasonal opportunities
  const currentMonth = new Date().getMonth();
  const seasonalOpportunities = getSeasonalKeywords(currentMonth);

  return {
    missingKeywords,
    lowCompetitionKeywords,
    trendingTopics,
    seasonalOpportunities
  };
};

// Get seasonal keywords based on current month
const getSeasonalKeywords = (month: number): string[] => {
  const seasonalMap: { [key: number]: string[] } = {
    0: ['new year gifts', 'resolution gifts', 'winter gifts'], // January
    1: ['valentine gifts', 'romantic gifts', 'love gifts'], // February
    2: ['spring gifts', 'easter gifts', 'mother day gifts'], // March
    3: ['spring gifts', 'easter gifts', 'outdoor gifts'], // April
    4: ['mother day gifts', 'graduation gifts', 'spring gifts'], // May
    5: ['father day gifts', 'summer gifts', 'outdoor gifts'], // June
    6: ['summer gifts', 'vacation gifts', 'outdoor gifts'], // July
    7: ['back to school', 'summer gifts', 'vacation gifts'], // August
    8: ['fall gifts', 'back to school', 'autumn gifts'], // September
    9: ['halloween gifts', 'fall gifts', 'autumn gifts'], // October
    10: ['thanksgiving gifts', 'fall gifts', 'family gifts'], // November
    11: ['christmas gifts', 'holiday gifts', 'winter gifts'] // December
  };

  return seasonalMap[month] || [];
};

// Analyze competitor content (mock implementation)
export const analyzeCompetitorContent = (
  targetKeywords: string[]
): CompetitorInsight[] => {
  const competitors = [
    'giftadvisor.com',
    'giftideas.com',
    'giftguide.com',
    'giftfinder.com'
  ];

  return targetKeywords.map(keyword => {
    const competitorUrls = competitors.map(domain => 
      `https://${domain}/${keyword.replace(/\s+/g, '-')}`
    );

    return {
      keyword,
      competitorUrls,
      estimatedTraffic: Math.floor(Math.random() * 50000) + 1000,
      contentGaps: [
        `No comprehensive ${keyword} guide`,
        `Missing budget options for ${keyword}`,
        `No seasonal ${keyword} recommendations`
      ],
      opportunities: [
        `Create ultimate ${keyword} guide`,
        `Focus on unique ${keyword} options`,
        `Add video content for ${keyword}`
      ]
    };
  });
};

// Generate SEO score for a post
export const calculateSEOScore = (
  post: Post,
  allPosts: Post[]
): number => {
  let score = 0;
  const content = post.content;
  const title = post.title;
  const description = post.description;

  // Title optimization (25 points)
  if (title.length >= 30 && title.length <= 60) score += 25;
  else if (title.length > 0) score += 15;

  // Meta description optimization (20 points)
  if (description.length >= 120 && description.length <= 160) score += 20;
  else if (description.length > 0) score += 10;

  // Content length (20 points)
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 2000) score += 20;
  else if (wordCount > 0) score += 10;

  // Tags optimization (15 points)
  if (post.tags.length >= 3 && post.tags.length <= 8) score += 15;
  else if (post.tags.length > 0) score += 8;

  // Image optimization (10 points)
  if (post.image) score += 10;

  // Internal linking (10 points)
  const internalLinks = generateInternalLinkSuggestions(post, allPosts, 1);
  if (internalLinks.length > 0) score += 10;

  return Math.min(100, score);
};

// Generate XML sitemap for blog posts
export const generateBlogSitemap = (posts: Post[]): string => {
  const baseUrl = 'https://smartgiftfinder.xyz';
  
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add blog index page
  sitemap += '  <url>\n';
  sitemap += `    <loc>${baseUrl}/blog</loc>\n`;
  sitemap += '    <changefreq>daily</changefreq>\n';
  sitemap += '    <priority>0.8</priority>\n';
  sitemap += '  </url>\n';
  
  // Add individual blog posts
  posts.forEach(post => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
    sitemap += `    <lastmod>${new Date(post.date).toISOString()}</lastmod>\n`;
    sitemap += '    <changefreq>monthly</changefreq>\n';
    sitemap += '    <priority>0.6</priority>\n';
    sitemap += '  </url>\n';
  });
  
  sitemap += '</urlset>';
  
  return sitemap;
};

// Generate robots.txt content
export const generateRobotsTxt = (): string => {
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://smartgiftfinder.xyz/sitemap.xml
Sitemap: https://smartgiftfinder.xyz/blog-sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/

# Crawl delay
Crawl-delay: 1`;
};

// Track SEO performance metrics
export interface SEOMetrics {
  pageViews: number;
  organicTraffic: number;
  keywordRankings: { [keyword: string]: number };
  clickThroughRate: number;
  bounceRate: number;
  averageTimeOnPage: number;
}

export const trackSEOMetrics = (postSlug: string): SEOMetrics => {
  // Mock implementation - in real app, this would integrate with Google Analytics
  return {
    pageViews: Math.floor(Math.random() * 10000) + 100,
    organicTraffic: Math.floor(Math.random() * 5000) + 50,
    keywordRankings: {
      'gift ideas': Math.floor(Math.random() * 50) + 1,
      'birthday gifts': Math.floor(Math.random() * 50) + 1,
      'christmas gifts': Math.floor(Math.random() * 50) + 1
    },
    clickThroughRate: Math.random() * 10 + 1,
    bounceRate: Math.random() * 50 + 20,
    averageTimeOnPage: Math.random() * 300 + 60
  };
};
