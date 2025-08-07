# Complete Blog Implementation & AI Blog Generator - Cursor Prompt

## Context
I have a Smart Gift Finder website (smartgiftfinder.xyz) built with React, TypeScript, and Contentlayer. The blog feature is 25% complete with basic Contentlayer setup but missing critical components. I need to complete the blog and add AI-powered blog generation.

## Task 1: Complete Blog Implementation

### Missing Components to Create:

1. **Create `src/types/post.ts`** with interfaces for:
   - Post interface with slug, title, description, date, author, tags, readingTime, featured, image, content
   - SEO object with metaTitle, metaDescription, keywords, canonicalUrl
   - BlogPageProps interface

2. **Create `src/components/blog/BlogList.tsx`**:
   - Display grid of blog posts (responsive: 1 col mobile, 2 tablet, 3 desktop)
   - Show post image, title, description, date, reading time, tags
   - Link to individual posts
   - Support featured posts filtering
   - Add hover effects and loading states

3. **Create `src/components/blog/BlogPost.tsx`**:
   - Display individual blog post with full content
   - SEO meta tags updates (title, description, keywords)
   - JSON-LD structured data for articles
   - Social sharing buttons
   - Related posts section
   - Breadcrumb navigation

4. **Create `src/pages/BlogIndex.tsx`**:
   - Blog listing page with pagination
   - Search and filter by tags
   - Featured posts section
   - SEO optimization with proper meta tags

5. **Update `src/App.tsx`** routing:
   - Add `/blog` route for BlogIndex
   - Add `/blog/:slug` route for individual posts
   - Add proper route guards and 404 handling

### SEO Enhancements:
- Add proper meta tags for each blog page
- Implement JSON-LD structured data
- Add Open Graph and Twitter Card meta tags
- Create XML sitemap generation for blog posts
- Add canonical URLs and proper internal linking

## Task 2: AI-Powered Blog Generation System

### Create AI Blog Generator Component:

1. **Create `src/components/admin/BlogGenerator.tsx`**:
   - Form with inputs for:
     - Topic/keyword
     - Target audience
     - Content length (short/medium/long)
     - SEO keywords
     - Tone (professional/casual/fun)
   - Integration with OpenAI API or similar
   - Generate markdown content with proper frontmatter
   - Preview generated content before saving

2. **Create API endpoint `api/generate-blog.ts`**:
   - Accept blog generation parameters
   - Use AI service (OpenAI/Claude/Gemini) to generate:
     - SEO-optimized title and meta description
     - Structured blog content with headings
     - Relevant tags and keywords
     - Featured image suggestions
   - Return formatted markdown with frontmatter

3. **Create `src/utils/blogAI.ts`** utility:
   - Functions for content optimization
   - Keyword density analysis
   - Reading time calculation
   - SEO score calculation
   - Content quality checks

### AI Prompts for Blog Generation:
Create prompts that generate gift-related content like:
- "Best [Category] Gifts for [Occasion] in 2025"
- "Unique Gift Ideas for [Demographic]"
- "Last-Minute Gift Solutions"
- "Gift Trends and Predictions"

## Task 3: Content Management Features

1. **Create `src/components/admin/BlogEditor.tsx`**:
   - Rich text editor for manual blog editing
   - Live preview functionality
   - SEO optimization suggestions
   - Image upload and optimization
   - Tag management system

2. **Create bulk content generation**:
   - Generate multiple blog posts from keyword lists
   - Template-based content creation
   - Automated publishing schedule
   - Content calendar integration

## Task 4: Advanced SEO Features

1. **Implement advanced SEO**:
   - Auto-generate meta descriptions from content
   - Internal linking suggestions
   - Keyword optimization recommendations
   - Content gap analysis
   - Competitor content analysis

2. **Create SEO dashboard**:
   - Track blog performance metrics
   - Monitor keyword rankings
   - Content performance analytics
   - SEO health scores

## Implementation Requirements:

### Technical Specs:
- Use existing Contentlayer setup
- Maintain TypeScript throughout
- Follow existing Tailwind CSS patterns
- Ensure mobile-first responsive design
- Add proper error handling and loading states
- Include accessibility features (ARIA labels, semantic HTML)

### AI Integration:
- Use environment variables for API keys
- Implement rate limiting for AI requests
- Add caching for generated content
- Include human review workflow
- Cost tracking for AI usage

### Performance:
- Lazy load blog images
- Implement pagination for blog list
- Add search functionality with debouncing
- Cache frequently accessed posts
- Optimize bundle size

### SEO Best Practices:
- Generate XML sitemaps automatically
- Add robots.txt optimizations
- Implement proper URL structure (/blog/category/post-slug)
- Add breadcrumb navigation
- Internal linking automation
- Social media meta tags

## Expected File Structure:
```
src/
├── types/
│   └── post.ts
├── components/
│   ├── blog/
│   │   ├── BlogList.tsx
│   │   ├── BlogPost.tsx
│   │   └── BlogSEO.tsx
│   └── admin/
│       ├── BlogGenerator.tsx
│       ├── BlogEditor.tsx
│       └── SEODashboard.tsx
├── pages/
│   ├── BlogIndex.tsx
│   └── AdminDashboard.tsx
├── utils/
│   ├── blogAI.ts
│   ├── seoUtils.ts
│   └── contentOptimizer.ts
└── api/
    ├── generate-blog.ts
    └── blog-seo.ts
```

## Success Criteria:
1. Blog listing and individual post pages work perfectly
2. SEO meta tags and structured data implemented
3. AI can generate high-quality, SEO-optimized blog posts
4. All components are responsive and accessible
5. Performance optimized (lighthouse score >90)
6. Proper error handling and user feedback

Please implement this step by step, testing each component before moving to the next. Focus on code quality, TypeScript safety, and following React best practices.