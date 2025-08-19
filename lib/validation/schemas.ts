import { z } from 'zod';

// Common validation patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlRegex = /^https?:\/\/.+/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Blog post creation schema
export const createBlogPostSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(50000, 'Content must be less than 50,000 characters'),
  tags: z.array(z.string().min(1).max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  primaryKeyword: z.string()
    .min(1, 'Primary keyword is required')
    .max(100, 'Primary keyword must be less than 100 characters')
    .optional(),
  secondaryKeywords: z.array(z.string().min(1).max(100))
    .max(20, 'Maximum 20 secondary keywords allowed')
    .optional(),
  targetAudience: z.string()
    .min(1, 'Target audience is required')
    .max(200, 'Target audience must be less than 200 characters')
    .optional(),
  toneOfVoice: z.string()
    .min(1, 'Tone of voice is required')
    .max(100, 'Tone of voice must be less than 100 characters')
    .optional(),
  featuredImage: z.string()
    .url('Invalid image URL')
    .optional(),
  status: z.enum(['draft', 'published', 'archived'])
    .default('draft'),
});

// Blog post update schema
export const updateBlogPostSchema = createBlogPostSchema.partial().extend({
  id: z.number().positive('Invalid blog post ID'),
});

// Gift search schema
export const giftSearchSchema = z.object({
  recipient: z.string()
    .min(1, 'Recipient is required')
    .max(100, 'Recipient must be less than 100 characters'),
  occasion: z.enum([
    'birthday', 'christmas', 'anniversary', 'wedding', 'graduation',
    'mothers-day', 'fathers-day', 'valentines-day', 'easter', 'halloween',
    'thanksgiving', 'new-year', 'housewarming', 'baby-shower', 'other'
  ], {
    errorMap: () => ({ message: 'Invalid occasion selected' })
  }),
  budget: z.number()
    .min(0, 'Budget cannot be negative')
    .max(10000, 'Budget cannot exceed $10,000'),
  interests: z.array(z.string().min(1).max(50))
    .max(10, 'Maximum 10 interests allowed')
    .optional(),
  age: z.number()
    .min(0, 'Age cannot be negative')
    .max(120, 'Invalid age')
    .optional(),
  relationship: z.enum([
    'spouse', 'parent', 'child', 'sibling', 'friend', 'colleague',
    'teacher', 'neighbor', 'other'
  ]).optional(),
});

// User authentication schema
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
});



// Blog post deletion schema
export const deleteBlogPostSchema = z.object({
  blogId: z.number().positive('Invalid blog post ID'),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
});

// Search schema
export const searchSchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(200, 'Search query must be less than 200 characters')
    .trim(),
  filters: z.object({
    tags: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.string().datetime().optional(),
      end: z.string().datetime().optional(),
    }).optional(),
  }).optional(),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

// Newsletter subscription schema
export const newsletterSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  preferences: z.object({
    giftGuides: z.boolean().default(true),
    blogPosts: z.boolean().default(true),
    promotions: z.boolean().default(false),
  }).optional(),
});

// Rate limiting schema
export const rateLimitSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  endpoint: z.string().min(1, 'Endpoint is required'),
  timestamp: z.number().positive('Invalid timestamp'),
});

// Error response schema
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string().min(1, 'Error message is required'),
  code: z.string().optional(),
  details: z.record(z.any()).optional(),
});

// Success response schema
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
});

// API response schema
export const apiResponseSchema = z.union([errorResponseSchema, successResponseSchema]);

// Export all schemas
export const schemas = {
  createBlogPost: createBlogPostSchema,
  updateBlogPost: updateBlogPostSchema,
  giftSearch: giftSearchSchema,
  login: loginSchema,
  deleteBlogPost: deleteBlogPostSchema,
  pagination: paginationSchema,
  search: searchSchema,
  contactForm: contactFormSchema,
  newsletter: newsletterSchema,
  rateLimit: rateLimitSchema,
  errorResponse: errorResponseSchema,
  successResponse: successResponseSchema,
  apiResponse: apiResponseSchema,
};
