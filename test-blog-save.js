import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simplified blog generation service for testing
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

// Test function
async function testBlogSave() {
  console.log('🧪 Testing Blog Save Functionality...\n');

  const testBrief = {
    title: "Test Blog Post - AI Gift Finder",
    targetAudience: "Test Audience", 
    goal: "inform",
    primaryKeyword: "test",
    secondaryKeywords: ["testing", "demo"],
    toneOfVoice: "friendly",
    outline: [],
    references: [],
    specialNotes: [],
    featuredImage: ""
  };

  console.log('📝 Test brief:', JSON.stringify(testBrief, null, 2));
  console.log('');

  try {
    // Initialize blog generation service
    const blogService = new SimpleBlogService();

    // Generate and save blog
    console.log('🔄 Starting blog generation process...');
    const result = await blogService.generateAndSaveBlog(testBrief);

    console.log('');
    console.log('✅ Blog generation completed:', {
      success: result.success,
      filePath: result.filePath,
      warningsCount: result.warnings.length,
      wordpressPublished: result.wordpressPublished
    });

    if (result.success) {
      console.log('🎉 Blog post saved successfully!');
      console.log('📁 File location:', result.filePath);
      
      // Verify file exists
      if (fs.existsSync(result.filePath)) {
        console.log('✅ File verification: File exists on disk');
        
        // Read and display file content
        const fileContent = fs.readFileSync(result.filePath, 'utf-8');
        console.log('📄 File content preview:');
        console.log('---');
        console.log(fileContent.substring(0, 500) + '...');
        console.log('---');
      } else {
        console.log('❌ File verification: File does not exist on disk');
      }
    } else {
      console.log('❌ Blog generation failed!');
      console.log('💬 Error:', result.warnings.join(', '));
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testBlogSave();
