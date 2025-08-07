# Task 2: AI-Powered Blog Generation System - Cursor Prompt

## Context
The basic blog feature is now complete and functional. We need to implement an AI-powered blog generation system that can automatically create high-quality, SEO-optimized blog posts about gifts and gift-giving.

## Implementation Tasks

### 1. Create AI Blog Generator API Endpoint

**File: `api/generate-blog.ts`**

Create a Vercel serverless function that:
- Accepts parameters: topic, audience, contentLength, tone, keywords
- Uses OpenAI GPT-4 or Claude API for content generation
- Generates structured blog posts with proper frontmatter
- Includes SEO optimization (meta titles, descriptions, keywords)
- Returns markdown content with proper formatting

**Required Environment Variables:**
- Add `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` to `.env.local`
- Add rate limiting and error handling
- Include cost tracking for API usage

**API Response Format:**
```typescript
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
```

### 2. Create Blog Generator Component

**File: `src/components/admin/BlogGenerator.tsx`**

Build an admin interface with:
- **Topic Input**: Text field for blog topic/keyword
- **Audience Selector**: Dropdown (parents, young adults, professionals, seniors)
- **Content Length**: Radio buttons (800-1200, 1200-1800, 1800+ words)
- **Tone Selector**: Dropdown (professional, casual, friendly, expert)
- **Keywords Input**: Multi-tag input for SEO keywords
- **Generate Button**: Triggers API call with loading state
- **Preview Section**: Shows generated content before saving
- **Edit Capability**: Allow manual editing of generated content
- **Save to Blog**: Creates new markdown file in content directory

**Features to Include:**
- Real-time preview with markdown rendering
- SEO score calculator showing keyword density, readability
- Duplicate content checker
- Image suggestion integration
- Social media preview (title, description, image)

### 3. Create Blog AI Utilities

**File: `src/utils/blogAI.ts`**

Implement utility functions:

```typescript
// SEO analysis functions
export const analyzeSEO = (content: string, keywords: string[]) => {
  // Keyword density analysis
  // Readability score calculation
  // Content length optimization
  // Heading structure analysis
  // Internal linking opportunities
};

// Content optimization
export const optimizeContent = (content: string) => {
  // Add internal links to gift finder
  // Optimize heading structure
  // Add call-to-action sections
  // Format for better readability
};

// Reading time calculator
export const calculateReadingTime = (content: string) => {
  // Calculate based on average reading speed
  // Account for images and lists
};

// Content quality checker
export const assessContentQuality = (content: string) => {
  // Grammar and spelling suggestions
  // Content structure analysis
  // Engagement score prediction
};
```

### 4. AI Prompt Templates

**File: `src/utils/aiPrompts.ts`**

Create specialized prompts for different content types:

```typescript
export const giftGuidePrompt = `
Create a comprehensive gift guide blog post about {topic} with the following requirements:
- Target audience: {audience}
- Tone: {tone}
- Length: {contentLength} words
- Include 8-12 specific gift recommendations
- Add price ranges and where to buy
- Include a mix of budget and premium options
- End with a call-to-action to use our AI gift finder
- Optimize for SEO keywords: {keywords}
- Structure with H2 and H3 headings
- Include engaging introduction and conclusion
`;

export const trendingTopicPrompt = `
Write an authoritative blog post about {topic} in gift-giving with:
- Current trends and statistics
- Expert insights and predictions  
- Practical advice for gift-givers
- Real-world examples and case studies
- Target audience: {audience}
- Tone: {tone}
- Optimize for keywords: {keywords}
- Include internal links to gift finder tool
`;

export const problemSolvingPrompt = `
Create a helpful problem-solving blog post about {topic}:
- Address common gift-giving challenges
- Provide step-by-step solutions
- Include multiple alternatives and options
- Add personal anecdotes and examples
- Target readers who are {audience}
- Use {tone} tone throughout
- Optimize for search terms: {keywords}
`;
```

### 5. Admin Dashboard Integration

**File: `src/components/admin/AdminDashboard.tsx`**

Create admin panel with:
- **Content Management**: List all blog posts with edit/delete options
- **AI Generator Access**: Quick access to blog generator
- **Analytics Dashboard**: Blog performance metrics
- **Content Calendar**: Schedule AI-generated content
- **Bulk Generation**: Generate multiple posts from keyword lists
- **SEO Monitor**: Track keyword rankings and performance

**Dashboard Sections:**
- Recent posts with performance metrics
- AI generation history and costs
- Content ideas and topic suggestions
- SEO optimization recommendations

### 6. Automated Content Pipeline

**File: `src/utils/contentPipeline.ts`**

Implement automated features:

```typescript
// Scheduled content generation
export const scheduleContentGeneration = async () => {
  // Generate content for upcoming holidays/seasons
  // Create evergreen gift guides
  // Update trending topic posts
};

// Content gap analysis
export const analyzeContentGaps = () => {
  // Identify missing gift categories
  // Find low-competition keywords
  // Suggest content opportunities
};

// Performance-based generation
export const generateBasedOnPerformance = () => {
  // Create variations of high-performing posts
  // Update outdated content automatically
  // Generate seasonal variations
};
```

### 7. Content Topics to Generate

Pre-built topic templates for immediate use:

**Holiday & Seasonal:**
- "Ultimate Christmas Gift Guide for [Audience] 2025"
- "Valentine's Day Gifts That Show You Really Care"
- "Mother's Day Gifts Beyond Flowers and Chocolates"
- "Back-to-School Gifts for Students and Teachers"
- "Halloween Costume and Party Gift Ideas"

**Demographic-Specific:**
- "Tech Gifts That Will Impress Any Geek"
- "Luxury Gifts for the Person Who Has Everything"
- "Budget-Friendly Gifts That Look Expensive"
- "Eco-Friendly and Sustainable Gift Ideas"
- "Personalized Gifts That Create Lasting Memories"

**Problem-Solving:**
- "Last-Minute Gift Ideas That Don't Look Last-Minute"
- "Gifts for Impossible-to-Buy-For People"
- "Long-Distance Relationship Gift Ideas"
- "Corporate Gifts That Actually Make an Impact"
- "Gifts for New Parents (Beyond Baby Stuff)"

### 8. Advanced Features

**Content Optimization:**
- A/B testing for blog titles
- Automatic internal linking suggestions
- Image SEO optimization
- Social media snippet generation
- Email newsletter content creation

**AI Enhancements:**
- Style consistency checking
- Brand voice alignment
- Fact-checking integration
- Plagiarism detection
- Content freshness monitoring

## Implementation Steps

1. **Start with API endpoint** - Test AI content generation
2. **Build generator component** - Create user interface
3. **Add utilities and prompts** - Enhance content quality
4. **Integrate admin dashboard** - Provide management interface
5. **Test and refine** - Optimize prompts and output quality
6. **Add automation** - Implement scheduled generation

## Success Criteria

- Generate high-quality, SEO-optimized blog posts in under 2 minutes
- Achieve 80%+ content quality score on first generation
- Maintain consistent brand voice across all generated content
- Reduce manual blog writing time by 90%
- Improve organic traffic by 200% within 3 months

## Security & Performance

- Implement rate limiting for AI API calls
- Add input validation and sanitization
- Cache frequently used prompts and responses
- Monitor AI costs and usage patterns
- Include human review workflow for quality control

Please implement these components step by step, testing each one thoroughly before proceeding to the next.