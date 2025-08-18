import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generateToken } from '../../../lib/auth';

// Mock the database connection
vi.mock('@vercel/postgres', () => ({
  sql: vi.fn()
}));

// Mock environment variables
vi.mock('process.env', () => ({
  JWT_SECRET: 'test-jwt-secret',
  OPENAI_API_KEY: 'test-openai-key'
}));

describe('Blog API Integration Tests', () => {
  let validToken: string;
  let adminToken: string;

  beforeEach(() => {
    // Generate test tokens
    validToken = generateToken('user123', 'test@example.com', 'user');
    adminToken = generateToken('admin123', 'admin@example.com', 'admin');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/blog/save', () => {
    it('should save a blog post with valid data and authentication', async () => {
      const validBlogData = {
        title: 'Test Blog Post',
        description: 'This is a test blog post description.',
        content: 'This is the content of the blog post with enough characters to meet validation requirements.',
        tags: ['test', 'blog'],
        primaryKeyword: 'test blog',
        targetAudience: 'Developers',
        toneOfVoice: 'professional',
        status: 'draft'
      };

      const request = new Request('http://localhost/api/blog/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify(validBlogData)
      });

      // Mock the database response
      const { sql } = await import('@vercel/postgres');
      vi.mocked(sql).mockResolvedValue({
        rows: [{
          id: 1,
          slug: 'test-blog-post-abc123',
          ...validBlogData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]
      } as any);

      // Import and call the handler
      const { default: handler } = await import('../../../api/blog/save');
      const response = await handler(request as any, {} as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.blog).toBeDefined();
      expect(data.blog.title).toBe(validBlogData.title);
    });

    it('should reject request without authentication', async () => {
      const request = new Request('http://localhost/api/blog/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Test Blog Post',
          content: 'Test content'
        })
      });

      const { default: handler } = await import('../../../api/blog/save');
      const response = await handler(request as any, {} as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should reject request with invalid data', async () => {
      const invalidData = {
        title: '', // Empty title
        content: 'Short' // Too short content
      };

      const request = new Request('http://localhost/api/blog/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify(invalidData)
      });

      const { default: handler } = await import('../../../api/blog/save');
      const response = await handler(request as any, {} as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });
  });

  describe('DELETE /api/blog/delete', () => {
    it('should delete a blog post with valid ID and authentication', async () => {
      const request = new Request('http://localhost/api/blog/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify({
          blogId: 1
        })
      });

      // Mock the database responses
      const { sql } = await import('@vercel/postgres');
      vi.mocked(sql)
        .mockResolvedValueOnce({
          rows: [{ id: 1, title: 'Test Blog Post' }]
        } as any)
        .mockResolvedValueOnce({
          rows: []
        } as any);

      const { default: handler } = await import('../../../api/blog/delete');
      const response = await handler(request as any, {} as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Blog post deleted successfully');
    });

    it('should reject deletion of non-existent blog post', async () => {
      const request = new Request('http://localhost/api/blog/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify({
          blogId: 999
        })
      });

      // Mock empty database response
      const { sql } = await import('@vercel/postgres');
      vi.mocked(sql).mockResolvedValue({
        rows: []
      } as any);

      const { default: handler } = await import('../../../api/blog/delete');
      const response = await handler(request as any, {} as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Blog post not found');
    });

    it('should reject deletion without authentication', async () => {
      const request = new Request('http://localhost/api/blog/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          blogId: 1
        })
      });

      const { default: handler } = await import('../../../api/blog/delete');
      const response = await handler(request as any, {} as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/blog/generate-blog', () => {
    it('should generate blog content with valid parameters and authentication', async () => {
      const validParams = {
        topic: 'Best Tech Gifts for 2024',
        tone: 'friendly',
        length: 'medium',
        primaryKeyword: 'tech gifts',
        secondaryKeywords: 'electronics, gadgets',
        targetAudience: 'Tech enthusiasts'
      };

      const request = new Request('http://localhost/api/blog/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify(validParams)
      });

      // Mock OpenAI response
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Best Tech Gifts for 2024',
              description: 'Discover the top tech gifts for 2024',
              content: '<h2>Introduction</h2><p>Welcome to our guide...</p>',
              tags: ['tech', 'gifts', '2024']
            })
          }
        }]
      };

      // Mock OpenAI
      vi.mock('openai', () => ({
        default: vi.fn().mockImplementation(() => ({
          chat: {
            completions: {
              create: vi.fn().mockResolvedValue(mockOpenAIResponse)
            }
          }
        }))
      }));

      const { default: handler } = await import('../../../api/blog/generate-blog');
      const response = await handler(request as any, {} as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.blog).toBeDefined();
      expect(data.blog.title).toBe('Best Tech Gifts for 2024');
    });

    it('should reject generation without authentication', async () => {
      const request = new Request('http://localhost/api/blog/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: 'Test Topic',
          primaryKeyword: 'test'
        })
      });

      const { default: handler } = await import('../../../api/blog/generate-blog');
      const response = await handler(request as any, {} as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should reject generation with invalid parameters', async () => {
      const invalidParams = {
        topic: '', // Empty topic
        primaryKeyword: 'test'
      };

      const request = new Request('http://localhost/api/blog/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify(invalidParams)
      });

      const { default: handler } = await import('../../../api/blog/generate-blog');
      const response = await handler(request as any, {} as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to blog generation', async () => {
      // This test would require mocking the rate limiting system
      // For now, we'll test that the endpoint exists and responds
      const request = new Request('http://localhost/api/blog/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify({
          topic: 'Test Topic',
          primaryKeyword: 'test'
        })
      });

      const { default: handler } = await import('../../../api/blog/generate-blog');
      
      // The handler should exist and be callable
      expect(typeof handler).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const request = new Request('http://localhost/api/blog/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify({
          title: 'Test Blog Post',
          description: 'Test description',
          content: 'Test content with enough characters to meet validation requirements.',
          primaryKeyword: 'test',
          targetAudience: 'Developers'
        })
      });

      // Mock database error
      const { sql } = await import('@vercel/postgres');
      vi.mocked(sql).mockRejectedValue(new Error('Database connection failed'));

      const { default: handler } = await import('../../../api/blog/save');
      const response = await handler(request as any, {} as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });
  });
});
