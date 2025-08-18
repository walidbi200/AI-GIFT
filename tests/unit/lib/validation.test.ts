import { describe, it, expect } from 'vitest';
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
  newsletterSchema
} from '../../../lib/validation/schemas';

describe('Blog Post Validation', () => {
  describe('createBlogPostSchema', () => {
    it('should accept valid blog post data', () => {
      const validData = {
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

      const result = createBlogPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        content: 'Valid content'
      };

      const result = createBlogPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required');
      }
    });

    it('should reject title that is too long', () => {
      const invalidData = {
        title: 'a'.repeat(201),
        content: 'Valid content'
      };

      const result = createBlogPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title must be less than 200 characters');
      }
    });

    it('should reject content that is too short', () => {
      const invalidData = {
        title: 'Valid Title',
        content: 'Short'
      };

      const result = createBlogPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Content must be at least 10 characters');
      }
    });

    it('should reject too many tags', () => {
      const invalidData = {
        title: 'Valid Title',
        content: 'Valid content with enough characters',
        tags: Array.from({ length: 11 }, (_, i) => `tag${i}`)
      };

      const result = createBlogPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Maximum 10 tags allowed');
      }
    });

    it('should reject invalid image URL', () => {
      const invalidData = {
        title: 'Valid Title',
        content: 'Valid content',
        featuredImage: 'not-a-url'
      };

      const result = createBlogPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid image URL');
      }
    });
  });

  describe('updateBlogPostSchema', () => {
    it('should accept partial updates', () => {
      const validData = {
        id: 1,
        title: 'Updated Title'
      };

      const result = updateBlogPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require valid ID', () => {
      const invalidData = {
        id: -1,
        title: 'Valid Title'
      };

      const result = updateBlogPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid blog post ID');
      }
    });
  });
});

describe('Gift Search Validation', () => {
  describe('giftSearchSchema', () => {
    it('should accept valid gift search data', () => {
      const validData = {
        recipient: 'John Doe',
        occasion: 'birthday' as const,
        budget: 100,
        interests: ['tech', 'gaming'],
        age: 25,
        relationship: 'friend' as const
      };

      const result = giftSearchSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty recipient', () => {
      const invalidData = {
        recipient: '',
        occasion: 'birthday' as const,
        budget: 100
      };

      const result = giftSearchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Recipient is required');
      }
    });

    it('should reject invalid occasion', () => {
      const invalidData = {
        recipient: 'John Doe',
        occasion: 'invalid-occasion',
        budget: 100
      };

      const result = giftSearchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid occasion selected');
      }
    });

    it('should reject negative budget', () => {
      const invalidData = {
        recipient: 'John Doe',
        occasion: 'birthday' as const,
        budget: -50
      };

      const result = giftSearchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Budget cannot be negative');
      }
    });

    it('should reject budget that is too high', () => {
      const invalidData = {
        recipient: 'John Doe',
        occasion: 'birthday' as const,
        budget: 15000
      };

      const result = giftSearchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Budget cannot exceed $10,000');
      }
    });
  });
});

describe('Authentication Validation', () => {
  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'SecurePass123'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'short'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
      }
    });
  });

  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
        name: 'John Doe'
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        confirmPassword: 'DifferentPass123',
        name: 'John Doe'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords don't match");
      }
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        name: 'John Doe'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must contain at least one lowercase letter, one uppercase letter, and one number');
      }
    });
  });
});

describe('API Validation', () => {
  describe('deleteBlogPostSchema', () => {
    it('should accept valid delete request', () => {
      const validData = {
        blogId: 1
      };

      const result = deleteBlogPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid blog ID', () => {
      const invalidData = {
        blogId: 0
      };

      const result = deleteBlogPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid blog post ID');
      }
    });
  });

  describe('paginationSchema', () => {
    it('should accept valid pagination data', () => {
      const validData = {
        page: 1,
        limit: 10
      };

      const result = paginationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should use default values when not provided', () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it('should reject invalid page number', () => {
      const invalidData = {
        page: 0,
        limit: 10
      };

      const result = paginationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Page must be at least 1');
      }
    });

    it('should reject limit that is too high', () => {
      const invalidData = {
        page: 1,
        limit: 150
      };

      const result = paginationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Limit cannot exceed 100');
      }
    });
  });

  describe('searchSchema', () => {
    it('should accept valid search data', () => {
      const validData = {
        query: 'gift ideas',
        filters: {
          tags: ['tech', 'gaming'],
          dateRange: {
            start: '2024-01-01T00:00:00Z',
            end: '2024-12-31T23:59:59Z'
          }
        }
      };

      const result = searchSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty query', () => {
      const invalidData = {
        query: ''
      };

      const result = searchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Search query is required');
      }
    });

    it('should reject query that is too long', () => {
      const invalidData = {
        query: 'a'.repeat(201)
      };

      const result = searchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Search query must be less than 200 characters');
      }
    });
  });
});

describe('Form Validation', () => {
  describe('contactFormSchema', () => {
    it('should accept valid contact form data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'General Inquiry',
        message: 'This is a detailed message with enough characters to meet the minimum requirement.'
      };

      const result = contactFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short message', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'General Inquiry',
        message: 'Short'
      };

      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Message must be at least 10 characters');
      }
    });
  });

  describe('newsletterSchema', () => {
    it('should accept valid newsletter subscription', () => {
      const validData = {
        email: 'test@example.com',
        preferences: {
          giftGuides: true,
          blogPosts: true,
          promotions: false
        }
      };

      const result = newsletterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should use default preferences when not provided', () => {
      const validData = {
        email: 'test@example.com'
      };

      const result = newsletterSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.preferences?.giftGuides).toBe(true);
        expect(result.data.preferences?.blogPosts).toBe(true);
        expect(result.data.preferences?.promotions).toBe(false);
      }
    });
  });
});

