// Blog AI utilities for content analysis, optimization, and quality assessment

export interface SEOAnalysis {
  keywordDensity: { [keyword: string]: number };
  readabilityScore: number;
  contentLength: number;
  headingStructure: { h2: number; h3: number };
  internalLinks: number;
  seoScore: number;
  suggestions: string[];
}

export interface ContentQuality {
  grammarScore: number;
  structureScore: number;
  engagementScore: number;
  overallScore: number;
  issues: string[];
  improvements: string[];
}

export interface OptimizedContent {
  content: string;
  seoScore: number;
  readingTime: number;
  wordCount: number;
  keywordDensity: { [keyword: string]: number };
}

// Calculate reading time based on content
export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Analyze keyword density in content
export const analyzeKeywordDensity = (content: string, keywords: string[]): { [keyword: string]: number } => {
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

// Calculate readability score using Flesch Reading Ease
export const calculateReadabilityScore = (content: string): number => {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const syllables = countSyllables(content);

  if (sentences.length === 0 || words.length === 0) return 0;

  const averageSentenceLength = words.length / sentences.length;
  const averageSyllablesPerWord = syllables / words.length;

  // Flesch Reading Ease formula
  const score = 206.835 - (1.015 * averageSentenceLength) - (84.6 * averageSyllablesPerWord);
  
  return Math.max(0, Math.min(100, score));
};

// Count syllables in text (simplified version)
const countSyllables = (text: string): number => {
  const words = text.toLowerCase().split(/\s+/);
  let syllableCount = 0;

  words.forEach(word => {
    // Remove common suffixes that don't add syllables
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    // Count vowel groups
    const matches = word.match(/[aeiouy]{1,2}/g);
    syllableCount += matches ? matches.length : 1;
  });

  return syllableCount;
};

// Analyze heading structure
export const analyzeHeadingStructure = (content: string): { h2: number; h3: number } => {
  const h2Matches = content.match(/^##\s+/gm);
  const h3Matches = content.match(/^###\s+/gm);
  
  return {
    h2: h2Matches ? h2Matches.length : 0,
    h3: h3Matches ? h3Matches.length : 0
  };
};

// Count internal links
export const countInternalLinks = (content: string): number => {
  const internalLinkRegex = /\[([^\]]+)\]\([^)]*\)/g;
  const matches = content.match(internalLinkRegex);
  return matches ? matches.length : 0;
};

// Comprehensive SEO analysis
export const analyzeSEO = (content: string, keywords: string[]): SEOAnalysis => {
  const keywordDensity = analyzeKeywordDensity(content, keywords);
  const readabilityScore = calculateReadabilityScore(content);
  const contentLength = content.split(/\s+/).filter(word => word.length > 0).length;
  const headingStructure = analyzeHeadingStructure(content);
  const internalLinks = countInternalLinks(content);

  // Calculate overall SEO score
  let seoScore = 0;
  const suggestions: string[] = [];

  // Keyword density scoring (0-25 points)
  const avgKeywordDensity = Object.values(keywordDensity).reduce((sum, density) => sum + density, 0) / keywords.length;
  if (avgKeywordDensity >= 0.5 && avgKeywordDensity <= 2.5) {
    seoScore += 25;
  } else if (avgKeywordDensity > 0.3 && avgKeywordDensity < 3.0) {
    seoScore += 15;
  } else {
    suggestions.push('Optimize keyword density - aim for 0.5-2.5%');
  }

  // Readability scoring (0-25 points)
  if (readabilityScore >= 60) {
    seoScore += 25;
  } else if (readabilityScore >= 40) {
    seoScore += 15;
  } else {
    suggestions.push('Improve readability - aim for Flesch score of 60+');
  }

  // Content length scoring (0-20 points)
  if (contentLength >= 800 && contentLength <= 2000) {
    seoScore += 20;
  } else if (contentLength >= 500 && contentLength <= 2500) {
    seoScore += 15;
  } else {
    suggestions.push('Optimize content length - aim for 800-2000 words');
  }

  // Heading structure scoring (0-15 points)
  if (headingStructure.h2 >= 3 && headingStructure.h3 >= 2) {
    seoScore += 15;
  } else if (headingStructure.h2 >= 2) {
    seoScore += 10;
  } else {
    suggestions.push('Add more H2 and H3 headings for better structure');
  }

  // Internal linking scoring (0-15 points)
  if (internalLinks >= 3) {
    seoScore += 15;
  } else if (internalLinks >= 1) {
    seoScore += 10;
  } else {
    suggestions.push('Add internal links to improve SEO');
  }

  return {
    keywordDensity,
    readabilityScore,
    contentLength,
    headingStructure,
    internalLinks,
    seoScore,
    suggestions
  };
};

// Assess content quality
export const assessContentQuality = (content: string): ContentQuality => {
  const issues: string[] = [];
  const improvements: string[] = [];

  // Grammar and spelling check (simplified)
  let grammarScore = 80; // Base score
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  sentences.forEach(sentence => {
    // Check for common issues
    if (sentence.length > 100) {
      grammarScore -= 2;
      issues.push('Long sentences detected');
    }
    if (sentence.match(/[A-Z][a-z]*\s+[A-Z][a-z]*\s+[A-Z][a-z]*/)) {
      grammarScore -= 1;
      issues.push('Potential capitalization issues');
    }
  });

  grammarScore = Math.max(0, grammarScore);

  // Structure analysis
  let structureScore = 70;
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
  const headings = content.match(/^#{1,3}\s+/gm);

  if (paragraphs.length >= 5) structureScore += 10;
  if (headings && headings.length >= 3) structureScore += 10;
  if (content.length > 1000) structureScore += 10;

  structureScore = Math.min(100, structureScore);

  // Engagement analysis
  let engagementScore = 75;
  const questions = content.match(/\?/g);
  const exclamations = content.match(/!/g);
  const lists = content.match(/^[-*+]\s+/gm);

  if (questions && questions.length > 0) engagementScore += 5;
  if (exclamations && exclamations.length > 0) engagementScore += 5;
  if (lists && lists.length > 0) engagementScore += 10;

  engagementScore = Math.min(100, engagementScore);

  // Overall score
  const overallScore = Math.round((grammarScore + structureScore + engagementScore) / 3);

  // Generate improvement suggestions
  if (grammarScore < 80) improvements.push('Review grammar and sentence structure');
  if (structureScore < 80) improvements.push('Improve content structure with better headings and paragraphs');
  if (engagementScore < 80) improvements.push('Add more engaging elements like questions and lists');

  return {
    grammarScore,
    structureScore,
    engagementScore,
    overallScore,
    issues: [...new Set(issues)],
    improvements
  };
};

// Optimize content for better SEO and readability
export const optimizeContent = (content: string, keywords: string[]): OptimizedContent => {
  let optimizedContent = content;

  // Add internal links if missing
  if (!content.includes('[AI Gift Finder]')) {
    optimizedContent += '\n\n**Ready to find the perfect gift?** Try our [AI Gift Finder](/), the smartest way to discover personalized gift recommendations!';
  }

  // Ensure proper heading structure
  if (!content.match(/^##\s+/m)) {
    optimizedContent = content.replace(/^#\s+(.+)$/m, '## $1');
  }

  // Add call-to-action if missing
  if (!content.toLowerCase().includes('call to action') && !content.toLowerCase().includes('try our')) {
    optimizedContent += '\n\n## Ready to Find the Perfect Gift?\n\nDon\'t stress about gift-giving anymore! Use our AI-powered gift finder to get personalized recommendations in seconds. [Start your gift search now →](/)\n\n';
  }

  // Analyze the optimized content
  const seoAnalysis = analyzeSEO(optimizedContent, keywords);
  const readingTime = calculateReadingTime(optimizedContent);
  const wordCount = optimizedContent.split(/\s+/).filter(word => word.length > 0).length;

  return {
    content: optimizedContent,
    seoScore: seoAnalysis.seoScore,
    readingTime,
    wordCount,
    keywordDensity: seoAnalysis.keywordDensity
  };
};

// Generate content suggestions based on keywords
export const generateContentSuggestions = (keywords: string[]): string[] => {
  const suggestions: string[] = [];
  
  keywords.forEach(keyword => {
    const variations = [
      `Ultimate ${keyword} Gift Guide`,
      `Best ${keyword} Gifts for Every Budget`,
      `${keyword} Gift Ideas That Will Impress`,
      `How to Choose the Perfect ${keyword} Gift`,
      `${keyword} Gift Trends for 2025`
    ];
    suggestions.push(...variations);
  });

  return suggestions.slice(0, 10); // Return top 10 suggestions
};

// Check for duplicate content (simplified)
export const checkDuplicateContent = (content: string, existingContent: string[]): { isDuplicate: boolean; similarity: number } => {
  const contentWords = content.toLowerCase().split(/\s+/).filter(word => word.length > 3);
  let maxSimilarity = 0;

  existingContent.forEach(existing => {
    const existingWords = existing.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const commonWords = contentWords.filter(word => existingWords.includes(word));
    const similarity = commonWords.length / Math.max(contentWords.length, existingWords.length);
    maxSimilarity = Math.max(maxSimilarity, similarity);
  });

  return {
    isDuplicate: maxSimilarity > 0.7,
    similarity: maxSimilarity
  };
};

// Format content for social media
export const formatForSocialMedia = (content: string, platform: 'twitter' | 'facebook' | 'linkedin'): string => {
  const maxLengths = {
    twitter: 280,
    facebook: 632,
    linkedin: 1300
  };

  // Extract first paragraph or create summary
  const firstParagraph = content.split('\n\n')[0] || content.substring(0, 200);
  let formatted = firstParagraph.replace(/[#*`]/g, '').trim();

  if (formatted.length > maxLengths[platform]) {
    formatted = formatted.substring(0, maxLengths[platform] - 3) + '...';
  }

  return formatted;
};
