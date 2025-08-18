import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createBlogPostSchema, createRateLimitResponse } from '../../../lib/validation/schemas';
import { verifyAuth } from '../../../middleware/auth';
import { rateLimit } from '../../../middleware/rate-limit';

// Mock the database
vi.mock('@vercel/postgres', () => ({
  sql: vi.fn()
}));

// Mock authentication
vi.mock('../../../middleware/auth', () => ({
  verifyAuth: vi.fn()
}));

// Mock rate limiting
vi.mock('../../../middleware/rate-limit', () => ({
  rateLimit: vi.fn()
}));

describe('Blog API Integration Tests', () => {
  let mockRequest: Request;
  let mockResponse: Response;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful authentication
    (verifyAuth as any).mockResolvedValue({
      authenticated: true,
      user: {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      }
    });

    // Mock successful rate limiting
    (rateLimit as any).mockResolvedValue({
      allowed: true,
      headers: {
        'X-RateLimit-Remaining': '95',
        'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
      }
    });
  });

  describe('Blog Post Creation', () => {
    it('should create a blog post with valid data', async () => {
      const validBlogData = {
        title: 'Test Blog Post',
        description: 'This is a test blog post description',
        content: 'This is the content of the blog post with enough characters to meet the minimum requirement.',
        tags: ['test', 'blog'],
        primaryKeyword: 'test blog',
        secondaryKeywords: ['testing', 'blogging'],
        targetAudience: 'Developers',
        toneOfVoice: 'Professional',
        featuredImage: 'https://example.com/image.jpg',
        status: 'draft' as const
      };

      // Test validation
      const validationResult = createBlogPostSchema.safeParse(validBlogData);
      expect(validationResult.success).toBe(true);

      if (validationResult.success) {
        expect(validationResult.data.title).toBe(validBlogData.title);
        expect(validationResult.data.content).toBe(validBlogData.content);
        expect(validationResult.data.tags).toEqual(validBlogData.tags);
      }
    });

    it('should reject blog post with invalid data', async () => {
      const invalidBlogData = {
        title: '', // Empty title
        content: 'Short' // Too short content
      };

      const validationResult = createBlogPostSchema.safeParse(invalidBlogData);
      expect(validationResult.success).toBe(false);

      if (!validationResult.success) {
        expect(validationResult.error.issues).toHaveLength(2);
        expect(validationResult.error.issues[0].message).toBe('Title is required');
        expect(validationResult.error.issues[1].message).toBe('Content must be at least 10 characters');
      }
    });

    it('should handle authentication failure', async () => {
      (verifyAuth as any).mockResolvedValue({
        authenticated: false,
        error: 'Invalid token'
      });

      const authResult = await verifyAuth(mockRequest);
      expect(authResult.authenticated).toBe(false);
      expect(authResult.error).toBe('Invalid token');
    });

    it('should handle rate limiting', async () => {
      (rateLimit as any).mockResolvedValue({
        allowed: false,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
        },
        retryAfter: 60
      });

      const rateLimitResult = await rateLimit(mockRequest, 'blog-write');
      expect(rateLimitResult.allowed).toBe(false);
      expect(rateLimitResult.retryAfter).toBe(60);
    });
  });

  describe('Blog Post Validation', () => {
    it('should validate required fields', () => {
      const missingFields = {
        content: 'Valid content'
      };

      const result = createBlogPostSchema.safeParse(missingFields);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errorMessages = result.error.issues.map(issue => issue.message);
        expect(errorMessages).toContain('Title is required');
      }
    });

    it('should validate field lengths', () => {
      const tooLongTitle = {
        title: 'a'.repeat(201),
        content: 'Valid content'
      };

      const result = createBlogPostSchema.safeParse(tooLongTitle);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title must be less than 200 characters');
      }
    });

    it('should validate URL format', () => {
      const invalidUrl = {
        title: 'Valid Title',
        content: 'Valid content',
        featuredImage: 'not-a-url'
      };

      const result = createBlogPostSchema.safeParse(invalidUrl);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid image URL');
      }
    });

    it('should validate array limits', () => {
      const tooManyTags = {
        title: 'Valid Title',
        content: 'Valid content',
        tags: Array.from({ length: 11 }, (_, i) => `tag${i}`)
      };

      const result = createBlogPostSchema.safeParse(tooManyTags);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Maximum 10 tags allowed');
      }
    });
  });

  describe('Authentication Integration', () => {
    it('should authenticate admin user', async () => {
      (verifyAuth as any).mockResolvedValue({
        authenticated: true,
        user: {
          id: 'admin123',
          email: 'admin@example.com',
          role: 'admin'
        }
      });

      const authResult = await verifyAuth(mockRequest);
      expect(authResult.authenticated).toBe(true);
      expect(authResult.user?.role).toBe('admin');
    });

    it('should authenticate regular user', async () => {
      (verifyAuth as any).mockResolvedValue({
        authenticated: true,
        user: {
          id: 'user123',
          email: 'user@example.com',
          role: 'user'
        }
      });

      const authResult = await verifyAuth(mockRequest);
      expect(authResult.authenticated).toBe(true);
      expect(authResult.user?.role).toBe('user');
    });

    it('should reject unauthenticated request', async () => {
      (verifyAuth as any).mockResolvedValue({
        authenticated: false,
        error: 'No authorization token provided'
      });

      const authResult = await verifyAuth(mockRequest);
      expect(authResult.authenticated).toBe(false);
      expect(authResult.error).toBe('No authorization token provided');
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should allow requests within limit', async () => {
      (rateLimit as any).mockResolvedValue({
        allowed: true,
        headers: {
          'X-RateLimit-Remaining': '95',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
        }
      });

      const rateLimitResult = await rateLimit(mockRequest, 'blog-write');
      expect(rateLimitResult.allowed).toBe(true);
      expect(rateLimitResult.headers['X-RateLimit-Remaining']).toBe('95');
    });

    it('should block requests when limit exceeded', async () => {
      (rateLimit as any).mockResolvedValue({
        allowed: false,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
        },
        retryAfter: 60
      });

      const rateLimitResult = await rateLimit(mockRequest, 'blog-write');
      expect(rateLimitResult.allowed).toBe(false);
      expect(rateLimitResult.retryAfter).toBe(60);
    });

    it('should handle different endpoint types', async () => {
      // Test AI generation endpoint
      (rateLimit as any).mockResolvedValue({
        allowed: true,
        headers: {
          'X-RateLimit-Remaining': '9',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
        }
      });

      const aiResult = await rateLimit(mockRequest, 'ai-generation');
      expect(aiResult.allowed).toBe(true);
      expect(aiResult.headers['X-RateLimit-Remaining']).toBe('9');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', () => {
      const invalidData = {
        title: '',
        content: 'Short'
      };

      try {
        const result = createBlogPostSchema.parse(invalidData);
        expect(result).toBeUndefined(); // Should not reach here
      } catch (error: any) {
        expect(error.issues).toHaveLength(2);
        expect(error.issues[0].message).toBe('Title is required');
        expect(error.issues[1].message).toBe('Content must be at least 10 characters');
      }
    });

    it('should handle authentication errors', async () => {
      (verifyAuth as any).mockRejectedValue(new Error('Database connection failed'));

      try {
        await verifyAuth(mockRequest);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toBe('Database connection failed');
      }
    });

    it('should handle rate limiting errors', async () => {
      (rateLimit as any).mockRejectedValue(new Error('Rate limit service unavailable'));

      try {
        await rateLimit(mockRequest, 'blog-write');
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toBe('Rate limit service unavailable');
      }
    });
  });

  describe('Response Headers', () => {
    it('should include rate limit headers', async () => {
      (rateLimit as any).mockResolvedValue({
        allowed: true,
        headers: {
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': '19',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
        }
      });

      const rateLimitResult = await rateLimit(mockRequest, 'blog-write');
      expect(rateLimitResult.headers).toHaveProperty('X-RateLimit-Limit');
      expect(rateLimitResult.headers).toHaveProperty('X-RateLimit-Remaining');
      expect(rateLimitResult.headers).toHaveProperty('X-RateLimit-Reset');
    });

    it('should include retry-after header when rate limited', async () => {
      (rateLimit as any).mockResolvedValue({
        allowed: false,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
          'Retry-After': '60'
        },
        retryAfter: 60
      });

      const rateLimitResult = await rateLimit(mockRequest, 'blog-write');
      expect(rateLimitResult.headers).toHaveProperty('Retry-After');
      expect(rateLimitResult.headers['Retry-After']).toBe('60');
    });
  });
});
