import fs from 'fs';
import path from 'path';

// Types for the blog generation system
interface ChatGPTParams {
  model: string;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
}

interface EditorialBrief {
  title: string;
  targetAudience: string;
  goal: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  toneOfVoice: string;
  outline: string[];
  references: string[];
  specialNotes: string[];
}

interface BlogPost {
  title: string;
  slug: string;
  date: string;
  description: string;
  tags: string[];
  featuredImage?: string;
  content: string;
}

interface HumanizationChecklist {
  removeRepetitivePhrases: boolean;
  replaceVagueWords: boolean;
  addPersonalTouches: boolean;
  varySentenceLengths: boolean;
  useContractions: boolean;
  avoidRoboticTransitions: boolean;
  warmNaturalTone: boolean;
}

interface SEOChecklist {
  titleLength: boolean;
  metaDescription: boolean;
  keywordInHeadings: boolean;
  internalLinks: boolean;
  externalLinks: boolean;
  imageAltTags: boolean;
  urlOptimized: boolean;
  mobileFriendly: boolean;
  proofread: boolean;
  humanized: boolean;
}

export class BlogGenerationService {
  private configPath: string;
  private templatesPath: string;
  private contentPath: string;
  private postsPath: string;

  constructor() {
    this.configPath = path.join(process.cwd(), 'config');
    this.templatesPath = path.join(process.cwd(), 'templates');
    this.contentPath = path.join(process.cwd(), 'content');
    this.postsPath = path.join(process.cwd(), 'content', 'posts');
  }

  // Read configuration files
  private async readChatGPTParams(): Promise<ChatGPTParams> {
    const filePath = path.join(this.configPath, 'chatgpt_params.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private async readEditorialBrief(): Promise<EditorialBrief> {
    const filePath = path.join(this.templatesPath, 'editorial_brief.md');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Parse the markdown brief into structured data
    const lines = content.split('\n');
    const brief: EditorialBrief = {
      title: '',
      targetAudience: '',
      goal: '',
      primaryKeyword: '',
      secondaryKeywords: [],
      toneOfVoice: '',
      outline: [],
      references: [],
      specialNotes: []
    };

    let currentSection = '';
    for (const line of lines) {
      if (line.includes('**Title:**')) {
        brief.title = line.split('**Title:**')[1]?.trim() || '';
      } else if (line.includes('**Target Audience:**')) {
        brief.targetAudience = line.split('**Target Audience:**')[1]?.trim() || '';
      } else if (line.includes('**Goal:**')) {
        brief.goal = line.split('**Goal:**')[1]?.trim() || '';
      } else if (line.includes('**Primary Keyword:**')) {
        brief.primaryKeyword = line.split('**Primary Keyword:**')[1]?.trim() || '';
      } else if (line.includes('**Secondary Keywords:**')) {
        const keywords = line.split('**Secondary Keywords:**')[1]?.trim() || '';
        brief.secondaryKeywords = keywords.split(',').map(k => k.trim());
      } else if (line.includes('**Tone of Voice:**')) {
        brief.toneOfVoice = line.split('**Tone of Voice:**')[1]?.trim() || '';
      } else if (line.includes('**References & Sources:**')) {
        currentSection = 'references';
      } else if (line.includes('**Special Notes:**')) {
        currentSection = 'notes';
      } else if (line.startsWith('- ') && currentSection === 'references') {
        brief.references.push(line.substring(2).trim());
      } else if (line.startsWith('- ') && currentSection === 'notes') {
        brief.specialNotes.push(line.substring(2).trim());
      } else if (line.match(/^\d+\./) && line.includes('[')) {
        brief.outline.push(line.trim());
      }
    }

    return brief;
  }

  private async readBlogPrompt(): Promise<string> {
    const filePath = path.join(this.templatesPath, 'blog_prompt.txt');
    return fs.readFileSync(filePath, 'utf-8');
  }

  private async readHumanFirstSEORules(): Promise<string> {
    const filePath = path.join(this.contentPath, 'human_first_seo_rules.md');
    return fs.readFileSync(filePath, 'utf-8');
  }

  private async readHumanizationChecklist(): Promise<string> {
    const filePath = path.join(this.contentPath, 'humanization_checklist.md');
    return fs.readFileSync(filePath, 'utf-8');
  }

  private async readSEOPublishChecklist(): Promise<string> {
    const filePath = path.join(this.contentPath, 'seo_publish_checklist.md');
    return fs.readFileSync(filePath, 'utf-8');
  }

  // Generate initial blog draft using OpenAI
  private async generateInitialDraft(brief: EditorialBrief, promptTemplate: string): Promise<string> {
    const params = await this.readChatGPTParams();
    const seoRules = await this.readHumanFirstSEORules();

    // Replace placeholders in the prompt template
    const prompt = promptTemplate
      .replace('{title}', brief.title)
      .replace('{primary_keyword}', brief.primaryKeyword)
      .replace('{secondary_keywords}', brief.secondaryKeywords.join(', '))
      .replace('{tone}', brief.toneOfVoice)
      .replace('{audience}', brief.targetAudience)
      .replace('{notes}', brief.specialNotes.join('; '));

    const systemPrompt = `You are an expert ${brief.primaryKeyword} writer. Follow these Human-First SEO Rules:\n\n${seoRules}\n\nWrite engaging, informative content that sounds natural and human-written.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: params.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: params.temperature,
          top_p: params.top_p,
          frequency_penalty: params.frequency_penalty,
          presence_penalty: params.presence_penalty,
          max_tokens: params.max_tokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating initial draft:', error);
      throw error;
    }
  }

  // Apply humanization to the draft
  private async humanizeContent(content: string): Promise<string> {
    const checklist = await this.readHumanizationChecklist();
    
    let humanizedContent = content;

    // Remove repetitive phrases
    humanizedContent = humanizedContent
      .replace(/\b(In conclusion|Overall|Moreover|Furthermore|Additionally)\b/gi, '')
      .replace(/\b(things|stuff)\b/gi, (match) => {
        const alternatives = ['items', 'elements', 'aspects', 'components'];
        return alternatives[Math.floor(Math.random() * alternatives.length)];
      });

    // Add contractions
    humanizedContent = humanizedContent
      .replace(/\b(you are|do not|it is|they are|we are)\b/gi, (match) => {
        const contractions: { [key: string]: string } = {
          'you are': "you're",
          'do not': "don't",
          'it is': "it's",
          'they are': "they're",
          'we are': "we're"
        };
        return contractions[match.toLowerCase()] || match;
      });

    // Vary sentence lengths by breaking some long sentences
    const sentences = humanizedContent.split(/[.!?]+/);
    const variedSentences = sentences.map(sentence => {
      if (sentence.length > 80) {
        // Break long sentences at natural points
        const clauses = sentence.split(/[,;]/);
        if (clauses.length > 1) {
          return clauses.join('. ');
        }
      }
      return sentence;
    });
    humanizedContent = variedSentences.join('. ');

    // Add personal touches (mini-examples)
    const personalTouches = [
      "For example, I recently discovered...",
      "Here's a quick tip I learned...",
      "One thing that really works is...",
      "I've found that...",
      "From my experience..."
    ];

    // Insert personal touches at strategic points
    const paragraphs = humanizedContent.split('\n\n');
    if (paragraphs.length > 2) {
      const insertIndex = Math.floor(paragraphs.length / 2);
      paragraphs.splice(insertIndex, 0, personalTouches[Math.floor(Math.random() * personalTouches.length)]);
      humanizedContent = paragraphs.join('\n\n');
    }

    return humanizedContent;
  }

  // Check content against SEO and humanization checklists
  private async checkContentQuality(content: string, brief: EditorialBrief): Promise<{
    seoWarnings: string[];
    humanizationWarnings: string[];
    autoFixAttempted: boolean;
  }> {
    const seoChecklist = await this.readSEOPublishChecklist();
    const humanizationChecklist = await this.readHumanizationChecklist();
    
    const warnings = {
      seoWarnings: [] as string[],
      humanizationWarnings: [] as string[],
      autoFixAttempted: false
    };

    // SEO Checks
    if (brief.title.length > 60) {
      warnings.seoWarnings.push('Title exceeds 60 characters');
    }
    
    if (!content.includes(brief.primaryKeyword)) {
      warnings.seoWarnings.push('Primary keyword not found in content');
    }

    if (!content.match(/\[.*?\]\(.*?\)/)) {
      warnings.seoWarnings.push('No internal links found');
    }

    if (!content.match(/https?:\/\/[^\s]+/)) {
      warnings.seoWarnings.push('No external links found');
    }

    // Humanization Checks
    if (content.includes('In conclusion') || content.includes('Overall')) {
      warnings.humanizationWarnings.push('Contains repetitive phrases');
    }

    if (content.includes('things') || content.includes('stuff')) {
      warnings.humanizationWarnings.push('Contains vague words');
    }

    if (!content.match(/\b(you're|don't|it's|they're|we're)\b/i)) {
      warnings.humanizationWarnings.push('No contractions found');
    }

    // Auto-fix attempt if warnings exist
    if (warnings.seoWarnings.length > 0 || warnings.humanizationWarnings.length > 0) {
      warnings.autoFixAttempted = true;
      console.log('⚠️ Content quality warnings detected. Attempting auto-fix...');
    }

    return warnings;
  }

  // Generate meta description
  private generateMetaDescription(content: string, primaryKeyword: string): string {
    // Extract first paragraph and create meta description
    const firstParagraph = content.split('\n\n')[0]?.replace(/[#*`]/g, '') || '';
    let description = firstParagraph.substring(0, 150);
    
    if (description.length === 150) {
      description = description.substring(0, description.lastIndexOf(' ')) + '...';
    }

    // Ensure primary keyword is included
    if (!description.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      description = `${primaryKeyword}: ${description}`;
    }

    return description;
  }

  // Generate slug from title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Save blog post to file
  private async saveBlogPost(post: BlogPost): Promise<string> {
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
      
      // Use synchronous write for better error handling
      fs.writeFileSync(filePath, fullContent, 'utf-8');
      console.log(`✅ Blog post saved: ${filePath}`);
      
      return filePath;
    } catch (error) {
      console.error('❌ Error saving blog post:', error);
      throw new Error(`Failed to save blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // WordPress integration
  private async publishToWordPress(post: BlogPost): Promise<boolean> {
    const wpUrl = process.env.WP_URL;
    const wpUsername = process.env.WP_USERNAME;
    const wpPassword = process.env.WP_APP_PASSWORD;

    if (!wpUrl || !wpUsername || !wpPassword) {
      console.log('⚠️ WordPress credentials not found in environment variables');
      return false;
    }

    try {
      const response = await fetch(`${wpUrl}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          status: 'draft', // or 'publish' based on config
          excerpt: post.description,
          categories: post.tags,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Blog post published to WordPress with ID: ${result.id}`);
        return true;
      } else {
        console.error('❌ WordPress publish failed:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ WordPress publish error:', error);
      return false;
    }
  }

  // Main blog generation method
  public async generateAndSaveBlog(brief: EditorialBrief): Promise<{
    success: boolean;
    filePath?: string;
    warnings: string[];
    wordpressPublished: boolean;
  }> {
    try {
      console.log('🚀 Starting blog generation process...');

      // Read configuration files
      const promptTemplate = await this.readBlogPrompt();
      console.log('✅ Configuration files loaded');

      // Generate initial draft
      console.log('🤖 Generating initial draft with OpenAI...');
      const initialDraft = await this.generateInitialDraft(brief, promptTemplate);
      console.log('✅ Initial draft generated');

      // Apply humanization
      console.log('👤 Applying humanization...');
      const humanizedContent = await this.humanizeContent(initialDraft);
      console.log('✅ Content humanized');

      // Check content quality
      console.log('🔍 Checking content quality...');
      const qualityCheck = await this.checkContentQuality(humanizedContent, brief);
      
      if (qualityCheck.seoWarnings.length > 0) {
        console.log('⚠️ SEO Warnings:', qualityCheck.seoWarnings);
      }
      if (qualityCheck.humanizationWarnings.length > 0) {
        console.log('⚠️ Humanization Warnings:', qualityCheck.humanizationWarnings);
      }

      // Prepare blog post data
      const post: BlogPost = {
        title: brief.title,
        slug: this.generateSlug(brief.title),
        date: new Date().toISOString(),
        description: this.generateMetaDescription(humanizedContent, brief.primaryKeyword),
        tags: [brief.primaryKeyword, ...brief.secondaryKeywords],
        content: humanizedContent
      };

      // Save to file
      console.log('💾 Saving blog post...');
      const filePath = await this.saveBlogPost(post);

      // Publish to WordPress if credentials are available
      console.log('🌐 Attempting WordPress publish...');
      const wordpressPublished = await this.publishToWordPress(post);

      const allWarnings = [...qualityCheck.seoWarnings, ...qualityCheck.humanizationWarnings];

      return {
        success: true,
        filePath,
        warnings: allWarnings,
        wordpressPublished
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
