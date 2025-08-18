import { describe, it, expect } from 'vitest';
import { 
  createBlogPostSchema,
  updateBlogPostSchema,
  deleteBlogPostSchema,
  giftSearchSchema,
  blogGenerationSchema,
  loginSchema,
  registerSchema,
  contactFormSchema,
  newsletterSubscriptionSchema
} from '../../../lib/validation/schemas';

describe('Blog Post Validation', () => {
  describe('createBlogPostSchema', () => {
    it('should accept valid blog post data', () => {
      const validData = {
        title: 'Test Blog Post',
        description: 'This is a test blog post description that meets the minimum length requirement.',
        content: 'This is the content of the blog post. It should be at least 50 characters long to pass validation.',
        tags: ['test', 'blog', 'validation'],
        primaryKeyword: 'test blog',
        targetAudience: 'Developers',
        toneOfVoice: 'professional',
        status: 'draft'
      };

      const result = createBlogPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject blog post with missing required fields', () => {
      const invalidData = {
        description: 'This is a test description.',
        content: 'This is the content.'
      };

      const result = createBlogPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2); // title and primaryKeyword missing
      }
    });

    it('should reject blog post with title too long', () => {
      const invalidData = {
        title: 'A'.repeat(201), // 201 characters
        description: 'Valid description',
        content: 'Valid content with enough characters to meet the minimum requirement.',
        primaryKeyword: 'test',
        targetAudience: 'Developers'
      };

      const result = createBlogPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject blog post with too many tags', () => {
      const invalidData = {
        title: 'Test Blog Post',
        description: 'Valid description',
        content: 'Valid content with enough characters.',
        tags: Array.from({ length: 11 }, (_, i) => `tag${i}`), // 11 tags
        primaryKeyword: 'test',
        targetAudience: 'Developers'
      };

      const result = createBlogPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateBlogPostSchema', () => {
    it('should accept partial blog post data', () => {
      const validData = {
        id: 1,
        title: 'Updated Blog Post'
      };

      const result = updateBlogPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject update without ID', () => {
      const invalidData = {
        title: 'Updated Blog Post'
      };

      const result = updateBlogPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('deleteBlogPostSchema', () => {
    it('should accept valid blog ID', () => {
      const validData = {
        blogId: 123
      };

      const result = deleteBlogPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid blog ID', () => {
      const invalidData = {
        blogId: -1
      };

      const result = deleteBlogPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Gift Search Validation', () => {
  describe('giftSearchSchema', () => {
    it('should accept valid gift search data', () => {
      const validData = {
        recipient: 'John Doe',
        occasion: 'birthday',
        budget: 100,
        interests: ['tech', 'gaming'],
        age: 25,
        relationship: 'friend',
        preferences: {
          tech: true,
          fashion: false,
          sports: true
        }
      };

      const result = giftSearchSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject search with invalid occasion', () => {
      const invalidData = {
        recipient: 'John Doe',
        occasion: 'invalid-occasion',
        budget: 100
      };

      const result = giftSearchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject search with negative budget', () => {
      const invalidData = {
        recipient: 'John Doe',
        occasion: 'birthday',
        budget: -50
      };

      const result = giftSearchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject search with budget too high', () => {
      const invalidData = {
        recipient: 'John Doe',
        occasion: 'birthday',
        budget: 15000
      };

      const result = giftSearchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Blog Generation Validation', () => {
  describe('blogGenerationSchema', () => {
    it('should accept valid blog generation data', () => {
      const validData = {
        topic: 'Best Tech Gifts for 2024',
        tone: 'friendly',
        length: 'medium',
        primaryKeyword: 'tech gifts',
        secondaryKeywords: 'electronics, gadgets, presents',
        targetAudience: 'Tech enthusiasts'
      };

      const result = blogGenerationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject generation with missing topic', () => {
      const invalidData = {
        tone: 'friendly',
        length: 'medium',
        primaryKeyword: 'tech gifts'
      };

      const result = blogGenerationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject generation with invalid tone', () => {
      const invalidData = {
        topic: 'Test Topic',
        tone: 'invalid-tone',
        length: 'medium',
        primaryKeyword: 'test'
      };

      const result = blogGenerationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Authentication Validation', () => {
  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePassword123'
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject login with invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'SecurePassword123'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject login with short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'short'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePassword123',
        confirmPassword: 'SecurePassword123',
        name: 'John Doe'
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject registration with mismatched passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePassword123',
        confirmPassword: 'DifferentPassword123',
        name: 'John Doe'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject registration with weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        name: 'John Doe'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Contact Form Validation', () => {
  describe('contactFormSchema', () => {
    it('should accept valid contact form data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'General Inquiry',
        message: 'This is a test message that meets the minimum length requirement for validation.'
      };

      const result = contactFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject contact form with short message', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Short'
      };

      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject contact form with invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        subject: 'Test Subject',
        message: 'This is a valid message that meets the minimum length requirement.'
      };

      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Newsletter Subscription Validation', () => {
  describe('newsletterSubscriptionSchema', () => {
    it('should accept valid subscription data', () => {
      const validData = {
        email: 'test@example.com',
        preferences: {
          giftGuides: true,
          blogPosts: false,
          specialOffers: true
        }
      };

      const result = newsletterSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept subscription with just email', () => {
      const validData = {
        email: 'test@example.com'
      };

      const result = newsletterSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject subscription with invalid email', () => {
      const invalidData = {
        email: 'invalid-email'
      };

      const result = newsletterSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
