import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simplified blog generation service for development
class SimpleBlogService {
  constructor() {
    this.postsPath = path.join(process.cwd(), 'content', 'posts');
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  generateMetaDescription(content, primaryKeyword) {
    const firstParagraph = content.split('\n\n')[0]?.replace(/[#*`]/g, '') || '';
    let description = firstParagraph.substring(0, 150);
    
    if (description.length === 150) {
      description = description.substring(0, description.lastIndexOf(' ')) + '...';
    }

    if (!description.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      description = `${primaryKeyword}: ${description}`;
    }

    return description;
  }

  async saveBlogPost(post) {
    try {
      // Ensure posts directory exists
      if (!fs.existsSync(this.postsPath)) {
        fs.mkdirSync(this.postsPath, { recursive: true });
        console.log(`📁 Created posts directory: ${this.postsPath}`);
      }

      const frontmatter = `---
title: "${post.title}"
slug: "${post.slug}"
date: "${post.date}"
description: "${post.description}"
tags: [${post.tags.map(tag => `"${tag}"`).join(', ')}]
${post.featuredImage ? `featured_image: "${post.featuredImage}"` : ''}
---

`;

      const fullContent = frontmatter + post.content;
      const filePath = path.join(this.postsPath, `${post.slug}.md`);
      
      fs.writeFileSync(filePath, fullContent, 'utf-8');
      console.log(`✅ Blog post saved: ${filePath}`);
      
      return filePath;
    } catch (error) {
      console.error('❌ Error saving blog post:', error);
      throw new Error(`Failed to save blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateAndSaveBlog(brief) {
    try {
      console.log('🚀 Starting simplified blog generation process...');

      // Create a simple blog post content
      const content = `# ${brief.title}

## Introduction

This is a sample blog post about ${brief.primaryKeyword}. The content is generated for testing purposes.

## Main Content

This blog post targets ${brief.targetAudience} and aims to ${brief.goal}. 

### Key Points

- Point 1 about ${brief.primaryKeyword}
- Point 2 about ${brief.primaryKeyword}
- Point 3 about ${brief.primaryKeyword}

## Conclusion

This concludes our discussion about ${brief.primaryKeyword}. We hope this information was helpful for ${brief.targetAudience}.

---

*This post was generated using the Smart Gift Finder blog generation system.*`;

      // Prepare blog post data
      const post = {
        title: brief.title,
        slug: this.generateSlug(brief.title),
        date: new Date().toISOString(),
        description: this.generateMetaDescription(content, brief.primaryKeyword),
        tags: [brief.primaryKeyword, ...brief.secondaryKeywords],
        content: content
      };

      // Save to file
      console.log('💾 Saving blog post...');
      const filePath = await this.saveBlogPost(post);

      return {
        success: true,
        filePath,
        warnings: [],
        wordpressPublished: false
      };

    } catch (error) {
      console.error('❌ Blog generation failed:', error);
      return {
        success: false,
        warnings: [error instanceof Error ? error.message : 'Unknown error'],
        wordpressPublished: false
      };
    }
  }
}

// API endpoint
app.post('/api/save-to-blog', async (req, res) => {
  try {
    console.log('🚀 Save to Blog API called');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));

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
    } = req.body;

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
    const blogService = new SimpleBlogService();

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
    const response = {
      success: result.success,
      filePath: result.filePath,
      warnings: result.warnings,
      wordpressPublished: result.wordpressPublished,
      message: result.success 
        ? 'Blog post generated and saved successfully!' 
        : 'Blog generation failed. Check warnings for details.'
    };

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
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Development API Server running on http://localhost:${PORT}`);
  console.log(`📝 Available endpoints:`);
  console.log(`   POST /api/save-to-blog`);
  console.log(`   GET  /api/health`);
});
