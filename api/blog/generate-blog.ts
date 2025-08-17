import type { VercelRequest, VercelResponse } from '@vercel/node';

interface BlogGenerationRequest {
  topic: string;
  tone: 'professional' | 'casual' | 'friendly' | 'expert';
  length: 'short' | 'medium' | 'long';
  primaryKeyword: string;
  secondaryKeywords?: string;
  targetAudience?: string;
}

interface GeneratedBlog {
  title: string;
  description: string;
  content: string;
  tags: string[];
  primaryKeyword: string;
  wordCount: number;
  seoAnalysis: {
    titleLength: number;
    descriptionLength: number;
    hasKeywordInTitle: boolean;
    estimatedReadTime: string;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🤖 Generating blog post...');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      topic,
      tone = 'friendly',
      length = 'medium',
      primaryKeyword,
      secondaryKeywords,
      targetAudience
    }: BlogGenerationRequest = req.body;

    // Validate required fields
    if (!topic || !primaryKeyword) {
      return res.status(400).json({
        success: false,
        error: 'Topic and primary keyword are required'
      });
    }

    // Mock AI blog generation (replace with actual OpenAI integration)
    const generateBlogContent = (topic: string, tone: string, length: string): string => {
      const baseContent = `
        <h2>Introduction</h2>
        <p>Welcome to our comprehensive guide about ${topic}. This article is designed to provide valuable insights and practical advice for ${targetAudience || 'readers'}.</p>
        
        <h2>Key Points</h2>
        <p>Here are the main aspects we'll cover:</p>
        <ul>
          <li>Understanding the basics</li>
          <li>Best practices and tips</li>
          <li>Common mistakes to avoid</li>
          <li>Advanced techniques</li>
        </ul>
        
        <h2>Understanding the Basics</h2>
        <p>Before diving deep into ${topic}, it's important to understand the fundamental concepts.</p>
        
        <h2>Best Practices</h2>
        <p>Follow these proven strategies to achieve the best results.</p>
        
        <h2>Common Mistakes</h2>
        <p>Avoid these pitfalls that many people encounter.</p>
        
        <h2>Advanced Techniques</h2>
        <p>Once you've mastered the basics, explore these advanced approaches.</p>
        
        <h2>Conclusion</h2>
        <p>${topic} is an important topic that requires careful consideration and proper implementation.</p>
      `;

      // Adjust content based on length
      if (length === 'short') {
        return baseContent.replace(/<h2>Advanced Techniques<\/h2>[\s\S]*?<h2>Conclusion<\/h2>/g, '<h2>Conclusion</h2>');
      } else if (length === 'long') {
        return baseContent + `
          <h2>Additional Resources</h2>
          <p>For more information about ${topic}, consider exploring these additional resources.</p>
          
          <h2>FAQ Section</h2>
          <h3>What is the most important thing to remember?</h3>
          <p>The most important thing is to start with the basics and build from there.</p>
          
          <h3>How long does it take to master this?</h3>
          <p>Mastery depends on your dedication and practice, but most people see significant improvement within a few weeks.</p>
        `;
      }

      return baseContent;
    };

    const content = generateBlogContent(topic, tone, length);
    const wordCount = content.trim().split(/\s+/).length;
    const estimatedReadTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

    const generatedBlog: GeneratedBlog = {
      title: topic,
      description: `A comprehensive guide about ${topic} for ${tone} readers.`,
      content: content,
      tags: [primaryKeyword, 'guide', 'tips', 'best practices'],
      primaryKeyword: primaryKeyword,
      wordCount: wordCount,
      seoAnalysis: {
        titleLength: topic.length,
        descriptionLength: 120,
        hasKeywordInTitle: topic.toLowerCase().includes(primaryKeyword.toLowerCase()),
        estimatedReadTime: `${estimatedReadTime} min read`
      }
    };

    console.log('✅ Blog post generated successfully');
    
    return res.status(200).json({
      success: true,
      blog: generatedBlog
    });

  } catch (error) {
    console.error('🔥 Blog Generation API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
