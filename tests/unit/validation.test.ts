import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  giftSearchSchema,
  loginSchema,
  registerSchema,
  deleteBlogPostSchema,
  paginationSchema,
  searchSchema,
  contactFormSchema,
  newsletterSchema,
  rateLimitSchema,
  errorResponseSchema,
  successResponseSchema,
  apiResponseSchema
} from '../../lib/validation/schemas';

describe('Validation Schemas', () => {
  describe('createBlogPostSchema', () => {
    it('should validate valid blog post data', () => {
      const validData = {
        title: 'Test Blog Post',
        description: 'A test blog post description',
        content: 'This is the content of the blog post.',
        tags: ['test', 'blog'],
        primaryKeyword: 'test blog',
        targetAudience: 'developers',
        toneOfVoice: 'professional',
        featuredImage: 'https://example.com/image.jpg',
        status: 'draft'
      };

      const result = createBlogPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        title: 'Test Blog Post',
        // Missing content
        tags: ['test']
      };

      const result = createBlogPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].path).toContain('content');
      }
    });

    it('should reject invalid status values', () => {
      const invalidData = {
        title: 'Test Blog Post',
        content: 'Test content',
        status: 'invalid-status'
      };

      const result = createBlogPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const minimalData = {
        title: 'Test Blog Post',
        content: 'Test content'
      };

      const result = createBlogPostSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });
  });

  describe('updateBlogPostSchema', () => {
    it('should validate valid update data', () => {
      const validData = {
        id: 1,
        title: 'Updated Blog Post',
        content: 'Updated content'
      };

      const result = updateBlogPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require id field', () => {
      const invalidData = {
        title: 'Updated Blog Post'
      };

      const result = updateBlogPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('giftSearchSchema', () => {
    it('should validate valid gift search data', () => {
      const validData = {
        recipient: 'mom',
        occasion: 'birthday',
        budget: 100,
        interests: ['tech', 'cooking'],
        age: 35
      };

      const result = giftSearchSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept minimal data', () => {
      const minimalData = {
        recipient: 'friend'
      };

      const result = giftSearchSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should validate budget range', () => {
      const invalidData = {
        recipient: 'friend',
        budget: -10
      };

      const result = giftSearchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require password', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        name: 'John Doe'
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
        name: 'John Doe'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate password strength', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
        confirmPassword: '123',
        name: 'John Doe'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('deleteBlogPostSchema', () => {
    it('should validate valid delete data', () => {
      const validData = {
        id: 1
      };

      const result = deleteBlogPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require id field', () => {
      const invalidData = {};

      const result = deleteBlogPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('paginationSchema', () => {
    it('should validate valid pagination data', () => {
      const validData = {
        page: 1,
        limit: 10
      };

      const result = paginationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should set default values', () => {
      const data = {};
      const result = paginationSchema.parse(data);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should validate page and limit ranges', () => {
      const invalidData = {
        page: 0,
        limit: 1000
      };

      const result = paginationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('searchSchema', () => {
    it('should validate valid search data', () => {
      const validData = {
        query: 'test search',
        filters: { category: 'tech' },
        sortBy: 'date',
        sortOrder: 'desc'
      };

      const result = searchSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept minimal search query', () => {
      const minimalData = {
        query: 'test'
      };

      const result = searchSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });
  });

  describe('contactFormSchema', () => {
    it('should validate valid contact form data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message.'
      };

      const result = contactFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        subject: 'Test Subject',
        message: 'Test message'
      };

      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('newsletterSchema', () => {
    it('should validate valid newsletter subscription', () => {
      const validData = {
        email: 'test@example.com',
        preferences: ['tech', 'lifestyle']
      };

      const result = newsletterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept email only', () => {
      const minimalData = {
        email: 'test@example.com'
      };

      const result = newsletterSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });
  });

  describe('rateLimitSchema', () => {
    it('should validate valid rate limit data', () => {
      const validData = {
        identifier: '127.0.0.1',
        endpointType: 'api',
        requests: 5,
        windowMs: 60000
      };

      const result = rateLimitSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('errorResponseSchema', () => {
    it('should validate error response structure', () => {
      const validData = {
        success: false,
        error: 'Validation failed',
        message: 'Invalid input data',
        timestamp: new Date().toISOString()
      };

      const result = errorResponseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require success to be false', () => {
      const invalidData = {
        success: true,
        error: 'Test error'
      };

      const result = errorResponseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('successResponseSchema', () => {
    it('should validate success response structure', () => {
      const validData = {
        success: true,
        data: { id: 1, name: 'test' },
        message: 'Operation successful'
      };

      const result = successResponseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require success to be true', () => {
      const invalidData = {
        success: false,
        data: { id: 1 }
      };

      const result = successResponseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('apiResponseSchema', () => {
    it('should validate error responses', () => {
      const errorData = {
        success: false,
        error: 'Test error'
      };

      const result = apiResponseSchema.safeParse(errorData);
      expect(result.success).toBe(true);
    });

    it('should validate success responses', () => {
      const successData = {
        success: true,
        data: { id: 1 }
      };

      const result = apiResponseSchema.safeParse(successData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid responses', () => {
      const invalidData = {
        success: 'maybe',
        data: { id: 1 }
      };

      const result = apiResponseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
