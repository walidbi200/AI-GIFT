// AI Prompts for different types of blog content generation

export interface PromptParams {
  topic: string;
  audience: string;
  tone: string;
  contentLength: string;
  keywords: string[];
}

// Gift Guide Prompts
export const giftGuidePrompt = (params: PromptParams): string => {
  const { topic, audience, tone, contentLength, keywords } = params;
  
  return `Create a comprehensive gift guide blog post about "${topic}" with the following requirements:

TARGET AUDIENCE: ${audience}
TONE: ${tone}
LENGTH: ${contentLength} words
SEO KEYWORDS: ${keywords.join(', ')}

CONTENT REQUIREMENTS:
1. Create an engaging, click-worthy title that includes the main keyword
2. Write a compelling meta description (150-160 characters)
3. Include 8-12 specific gift recommendations with price ranges
4. Add practical tips and advice for gift-givers
5. Include a mix of budget-friendly and premium options
6. End with a strong call-to-action to use our AI gift finder tool
7. Optimize for the provided SEO keywords naturally
8. Structure with proper H2 and H3 headings
9. Make the content valuable and actionable for readers

FORMAT THE RESPONSE AS JSON:
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

// Trending Topic Prompts
export const trendingTopicPrompt = (params: PromptParams): string => {
  const { topic, audience, tone, contentLength, keywords } = params;
  
  return `Write an authoritative blog post about "${topic}" in gift-giving with the following specifications:

TARGET AUDIENCE: ${audience}
TONE: ${tone}
LENGTH: ${contentLength} words
SEO KEYWORDS: ${keywords.join(', ')}

CONTENT REQUIREMENTS:
1. Include current trends and statistics related to gift-giving
2. Provide expert insights and predictions for the future
3. Add practical advice for gift-givers in this category
4. Include real-world examples and case studies
5. Address common challenges and solutions
6. Optimize for the provided SEO keywords naturally
7. Include internal links to our gift finder tool
8. Structure with proper H2 and H3 headings
9. End with actionable takeaways for readers

FORMAT THE RESPONSE AS JSON:
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

Make the content informative, engaging, and valuable for readers interested in gift-giving trends.`;
};

// Problem-Solving Prompts
export const problemSolvingPrompt = (params: PromptParams): string => {
  const { topic, audience, tone, contentLength, keywords } = params;
  
  return `Create a helpful problem-solving blog post about "${topic}" with the following specifications:

TARGET AUDIENCE: ${audience}
TONE: ${tone}
LENGTH: ${contentLength} words
SEO KEYWORDS: ${keywords.join(', ')}

CONTENT REQUIREMENTS:
1. Address common gift-giving challenges related to this topic
2. Provide step-by-step solutions and strategies
3. Include multiple alternatives and options for different situations
4. Add personal anecdotes and relatable examples
5. Offer practical tips that readers can implement immediately
6. Optimize for the provided SEO keywords naturally
7. Include internal links to our gift finder tool
8. Structure with proper H2 and H3 headings
9. End with encouraging words and next steps

FORMAT THE RESPONSE AS JSON:
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

Make the content empathetic, practical, and solution-focused to help readers overcome gift-giving challenges.`;
};

// Holiday & Seasonal Prompts
export const holidaySeasonalPrompt = (params: PromptParams): string => {
  const { topic, audience, tone, contentLength, keywords } = params;
  
  return `Create a comprehensive holiday/seasonal gift guide about "${topic}" with the following specifications:

TARGET AUDIENCE: ${audience}
TONE: ${tone}
LENGTH: ${contentLength} words
SEO KEYWORDS: ${keywords.join(', ')}

CONTENT REQUIREMENTS:
1. Focus on the specific holiday or season mentioned in the topic
2. Include timely gift recommendations that are perfect for this occasion
3. Add planning tips and timeline suggestions
4. Include budget-friendly and luxury options
5. Provide personalization ideas for the holiday/season
6. Optimize for the provided SEO keywords naturally
7. Include internal links to our gift finder tool
8. Structure with proper H2 and H3 headings
9. Add urgency and excitement appropriate for the occasion

FORMAT THE RESPONSE AS JSON:
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

Make the content festive, timely, and helpful for readers planning gifts for this specific occasion.`;
};

// Demographic-Specific Prompts
export const demographicSpecificPrompt = (params: PromptParams): string => {
  const { topic, audience, tone, contentLength, keywords } = params;
  
  return `Create a targeted gift guide for "${topic}" specifically designed for ${audience} with the following specifications:

TARGET AUDIENCE: ${audience}
TONE: ${tone}
LENGTH: ${contentLength} words
SEO KEYWORDS: ${keywords.join(', ')}

CONTENT REQUIREMENTS:
1. Tailor all recommendations specifically for the ${audience} demographic
2. Address unique needs, preferences, and challenges of this audience
3. Include age-appropriate and lifestyle-relevant gift suggestions
4. Consider budget constraints and value expectations of this group
5. Add personalization tips that resonate with this audience
6. Optimize for the provided SEO keywords naturally
7. Include internal links to our gift finder tool
8. Structure with proper H2 and H3 headings
9. Use language and examples that connect with this demographic

FORMAT THE RESPONSE AS JSON:
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

Make the content highly relevant and valuable for the specific ${audience} demographic.`;
};

// Budget-Focused Prompts
export const budgetFocusedPrompt = (params: PromptParams): string => {
  const { topic, audience, tone, contentLength, keywords } = params;
  
  return `Create a budget-conscious gift guide about "${topic}" with the following specifications:

TARGET AUDIENCE: ${audience}
TONE: ${tone}
LENGTH: ${contentLength} words
SEO KEYWORDS: ${keywords.join(', ')}

CONTENT REQUIREMENTS:
1. Focus on affordable yet thoughtful gift options
2. Include DIY and handmade gift ideas
3. Provide money-saving tips and strategies
4. Show how to make inexpensive gifts look expensive
5. Include price ranges and budget categories
6. Optimize for the provided SEO keywords naturally
7. Include internal links to our gift finder tool
8. Structure with proper H2 and H3 headings
9. Emphasize thoughtfulness over price tags

FORMAT THE RESPONSE AS JSON:
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

Make the content encouraging and helpful for readers who want to give meaningful gifts without breaking the bank.`;
};

// Luxury & Premium Prompts
export const luxuryPremiumPrompt = (params: PromptParams): string => {
  const { topic, audience, tone, contentLength, keywords } = params;
  
  return `Create a luxury and premium gift guide about "${topic}" with the following specifications:

TARGET AUDIENCE: ${audience}
TONE: ${tone}
LENGTH: ${contentLength} words
SEO KEYWORDS: ${keywords.join(', ')}

CONTENT REQUIREMENTS:
1. Focus on high-end, premium gift options
2. Include luxury brands and exclusive items
3. Emphasize quality, craftsmanship, and exclusivity
4. Provide gifting etiquette for luxury items
5. Include personalization and customization options
6. Optimize for the provided SEO keywords naturally
7. Include internal links to our gift finder tool
8. Structure with proper H2 and H3 headings
9. Create an aspirational yet accessible tone

FORMAT THE RESPONSE AS JSON:
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

Make the content sophisticated and inspiring while maintaining accessibility for readers interested in premium gift options.`;
};

// Prompt selector based on content type
export const getPromptByType = (type: string, params: PromptParams): string => {
  switch (type.toLowerCase()) {
    case 'gift-guide':
      return giftGuidePrompt(params);
    case 'trending':
      return trendingTopicPrompt(params);
    case 'problem-solving':
      return problemSolvingPrompt(params);
    case 'holiday-seasonal':
      return holidaySeasonalPrompt(params);
    case 'demographic-specific':
      return demographicSpecificPrompt(params);
    case 'budget-focused':
      return budgetFocusedPrompt(params);
    case 'luxury-premium':
      return luxuryPremiumPrompt(params);
    default:
      return giftGuidePrompt(params);
  }
};

// Pre-built topic templates for quick generation
export const topicTemplates = {
  holiday: [
    'Ultimate Christmas Gift Guide for {audience} 2025',
    'Valentine\'s Day Gifts That Show You Really Care',
    'Mother\'s Day Gifts Beyond Flowers and Chocolates',
    'Back-to-School Gifts for Students and Teachers',
    'Halloween Costume and Party Gift Ideas'
  ],
  demographic: [
    'Tech Gifts That Will Impress Any Geek',
    'Luxury Gifts for the Person Who Has Everything',
    'Budget-Friendly Gifts That Look Expensive',
    'Eco-Friendly and Sustainable Gift Ideas',
    'Personalized Gifts That Create Lasting Memories'
  ],
  problemSolving: [
    'Last-Minute Gift Ideas That Don\'t Look Last-Minute',
    'Gifts for Impossible-to-Buy-For People',
    'Long-Distance Relationship Gift Ideas',
    'Corporate Gifts That Actually Make an Impact',
    'Gifts for New Parents (Beyond Baby Stuff)'
  ]
};

// Generate topic suggestions based on audience and type
export const generateTopicSuggestions = (audience: string, type: string): string[] => {
  const templates = topicTemplates[type as keyof typeof topicTemplates] || topicTemplates.holiday;
  return templates.map(template => template.replace('{audience}', audience));
};
