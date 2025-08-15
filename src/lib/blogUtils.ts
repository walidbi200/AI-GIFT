import fs from 'fs';
import path from 'path';

export interface RecentSearch {
  age: number;
  relationship?: string;
  occasion: string;
  interests: string;
  budget: string;
  timestamp: number;
}

export interface BlogPost {
  id: number;
  slug: string;
  filename: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  primaryKeyword: string;
  secondaryKeywords?: string[];
  targetAudience?: string;
  toneOfVoice?: string;
  featuredImage?: string;
  galleryImages?: string[];
  seo: SEOMetadata;
  readingTime: number;
  wordCount: number;
}

export interface SEOMetadata {
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  keywords: string[];
  openGraph: {
    title: string;
    description: string;
    image: string;
    type: string;
    url: string;
  };
  schema: any;
}

export interface BlogIndex {
  blogs: Array<{
    id: number;
    title: string;
    slug: string;
    filename: string;
    createdAt: string;
    primaryKeyword: string;
    targetAudience?: string;
    featuredImage?: string;
    excerpt: string;
    readingTime: number;
    wordCount: number;
  }>;
  categories: string[];
  tags: string[];
  lastUpdated: string;
  totalCount: number;
}

export class BlogManager {
  private blogsDir: string;
  private indexPath: string;

  constructor() {
    this.blogsDir = path.join(process.cwd(), 'public', 'blogs', 'data');
    this.indexPath = path.join(this.blogsDir, 'blogs-index.json');
  }

  // Generate SEO-friendly slug
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Save blog to file system
  async saveBlog(blogData: any): Promise<{ success: boolean; blog?: BlogPost; error?: string }> {
    try {
      const timestamp = Date.now();
      const slug = this.generateSlug(blogData.title);
      const filename = `${slug}-${timestamp}.json`;
      
      const blogPost: BlogPost = {
        id: timestamp,
        slug: slug,
        filename: filename,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'published',
        title: blogData.title,
        description: blogData.description || '',
        content: blogData.content || '',
        tags: blogData.tags || [],
        primaryKeyword: blogData.primaryKeyword || '',
        secondaryKeywords: blogData.secondaryKeywords || [],
        targetAudience: blogData.targetAudience,
        toneOfVoice: blogData.toneOfVoice,
        featuredImage: blogData.featuredImage,
        galleryImages: blogData.galleryImages || [],
        seo: this.generateSEO(blogData),
        readingTime: this.calculateReadingTime(blogData.content || ''),
        wordCount: this.calculateWordCount(blogData.content || '')
      };

      // Save individual blog file
      const blogPath = path.join(this.blogsDir, filename);
      fs.writeFileSync(blogPath, JSON.stringify(blogPost, null, 2));

      // Update index
      await this.updateBlogIndex(blogPost);

      return { success: true, blog: blogPost };
    } catch (error) {
      console.error('Error saving blog:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Update blogs index
  async updateBlogIndex(newBlog: BlogPost): Promise<void> {
    const indexData = this.loadBlogIndex();
    
    // Add to beginning of array (newest first)
    indexData.blogs.unshift({
      id: newBlog.id,
      title: newBlog.title,
      slug: newBlog.slug,
      filename: newBlog.filename,
      createdAt: newBlog.createdAt,
      primaryKeyword: newBlog.primaryKeyword,
      targetAudience: newBlog.targetAudience,
      featuredImage: newBlog.featuredImage,
      excerpt: newBlog.content ? newBlog.content.substring(0, 200) + '...' : '',
      readingTime: newBlog.readingTime,
      wordCount: newBlog.wordCount
    });

    // Update metadata
    indexData.totalCount = indexData.blogs.length;
    indexData.lastUpdated = new Date().toISOString();
    
    // Extract and update tags
    if (newBlog.secondaryKeywords) {
      const newTags = newBlog.secondaryKeywords.filter(tag => !indexData.tags.includes(tag));
      indexData.tags.push(...newTags);
    }

    fs.writeFileSync(this.indexPath, JSON.stringify(indexData, null, 2));
  }

  // Load blog index
  loadBlogIndex(): BlogIndex {
    try {
      return JSON.parse(fs.readFileSync(this.indexPath, 'utf8'));
    } catch (error) {
      return { 
        blogs: [], 
        categories: [], 
        tags: [], 
        lastUpdated: new Date().toISOString(), 
        totalCount: 0 
      };
    }
  }

  // Load individual blog
  loadBlog(filename: string): BlogPost | null {
    try {
      const blogPath = path.join(this.blogsDir, filename);
      return JSON.parse(fs.readFileSync(blogPath, 'utf8'));
    } catch (error) {
      console.error('Error loading blog:', error);
      return null;
    }
  }

  // Generate SEO metadata
  generateSEO(blogData: any): SEOMetadata {
    const title = `${blogData.title} | Smart Gift Finder`;
    const description = blogData.description || `Learn about ${blogData.primaryKeyword}. ${blogData.title}`;
    const slug = this.generateSlug(blogData.title);
    
    return {
      title: title,
      metaDescription: description.substring(0, 160),
      canonicalUrl: `/blog/${slug}`,
      keywords: [blogData.primaryKeyword, ...(blogData.secondaryKeywords || [])],
      openGraph: {
        title: blogData.title,
        description: description,
        image: blogData.featuredImage || '/default-blog-image.jpg',
        type: 'article',
        url: `/blog/${slug}`
      },
      schema: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": blogData.title,
        "description": description,
        "author": {
          "@type": "Person",
          "name": "Smart Gift Finder"
        },
        "datePublished": new Date().toISOString(),
        "dateModified": new Date().toISOString(),
        "image": blogData.featuredImage || '/default-blog-image.jpg',
        "url": `/blog/${slug}`,
        "keywords": [blogData.primaryKeyword, ...(blogData.secondaryKeywords || [])]
      }
    };
  }

  // Calculate reading time
  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = this.calculateWordCount(content);
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Calculate word count
  calculateWordCount(content: string): number {
    return content.trim().split(/\s+/).length;
  }

  // Delete blog
  async deleteBlog(blogId: number, filename: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete blog file
      const blogPath = path.join(this.blogsDir, filename);
      if (fs.existsSync(blogPath)) {
        fs.unlinkSync(blogPath);
      }
      
      // Update index
      const indexData = this.loadBlogIndex();
      indexData.blogs = indexData.blogs.filter(blog => blog.id !== blogId);
      indexData.totalCount = indexData.blogs.length;
      indexData.lastUpdated = new Date().toISOString();
      
      fs.writeFileSync(this.indexPath, JSON.stringify(indexData, null, 2));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting blog:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
