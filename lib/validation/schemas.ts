import { z } from 'zod';

// Common validation patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlPattern = /^https?:\/\/.+/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Blog post creation schema
export const createBlogPostSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .trim(),
  content: z.string()
    .min(50, 'Content must be at least 50 characters')
    .max(50000, 'Content must be less than 50,000 characters'),
  tags: z.array(z.string().min(1).max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
  primaryKeyword: z.string()
    .min(1, 'Primary keyword is required')
    .max(100, 'Primary keyword must be less than 100 characters')
    .trim(),
  secondaryKeywords: z.array(z.string().min(1).max(100))
    .max(5, 'Maximum 5 secondary keywords allowed')
    .optional()
    .default([]),
  targetAudience: z.string()
    .min(1, 'Target audience is required')
    .max(200, 'Target audience must be less than 200 characters')
    .trim(),
  toneOfVoice: z.enum(['professional', 'casual', 'friendly', 'expert', 'conversational'])
    .default('friendly'),
  featuredImage: z.string()
    .url('Featured image must be a valid URL')
    .optional(),
  status: z.enum(['draft', 'published', 'archived'])
    .default('draft'),
});

// Blog post update schema
export const updateBlogPostSchema = createBlogPostSchema.partial().extend({
  id: z.number().positive('Invalid blog post ID'),
});

// Blog post deletion schema
export const deleteBlogPostSchema = z.object({
  blogId: z.number().positive('Invalid blog post ID'),
});

// Gift search schema
export const giftSearchSchema = z.object({
  recipient: z.string()
    .min(1, 'Recipient is required')
    .max(100, 'Recipient name must be less than 100 characters')
    .trim(),
  occasion: z.enum([
    'birthday', 'christmas', 'anniversary', 'wedding', 'graduation',
    'mothers-day', 'fathers-day', 'valentines-day', 'housewarming',
    'baby-shower', 'engagement', 'retirement', 'holiday', 'other'
  ], {
    errorMap: () => ({ message: 'Invalid occasion selected' })
  }),
  budget: z.number()
    .min(0, 'Budget cannot be negative')
    .max(10000, 'Budget cannot exceed $10,000'),
  interests: z.array(z.string().min(1).max(50))
    .max(10, 'Maximum 10 interests allowed')
    .optional()
    .default([]),
  age: z.number()
    .min(0, 'Age cannot be negative')
    .max(120, 'Invalid age')
    .optional(),
  relationship: z.enum([
    'spouse', 'parent', 'child', 'sibling', 'friend', 'colleague',
    'boss', 'employee', 'teacher', 'student', 'neighbor', 'other'
  ])
    .optional(),
  preferences: z.object({
    tech: z.boolean().default(false),
    fashion: z.boolean().default(false),
    sports: z.boolean().default(false),
    books: z.boolean().default(false),
    food: z.boolean().default(false),
    travel: z.boolean().default(false),
    art: z.boolean().default(false),
    music: z.boolean().default(false),
  }).optional(),
});

// Blog generation schema
export const blogGenerationSchema = z.object({
  topic: z.string()
    .min(1, 'Topic is required')
    .max(200, 'Topic must be less than 200 characters')
    .trim(),
  tone: z.enum(['professional', 'casual', 'friendly', 'expert'])
    .default('friendly'),
  length: z.enum(['short', 'medium', 'long'])
    .default('medium'),
  primaryKeyword: z.string()
    .min(1, 'Primary keyword is required')
    .max(100, 'Primary keyword must be less than 100 characters')
    .trim(),
  secondaryKeywords: z.string()
    .max(500, 'Secondary keywords must be less than 500 characters')
    .optional(),
  targetAudience: z.string()
    .max(200, 'Target audience must be less than 200 characters')
    .optional(),
});

// User authentication schema
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
});

export const registerSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Password reset schema
export const passwordResetSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string()
    .min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number()
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
});

// Blog list query schema
export const blogListQuerySchema = paginationSchema.extend({
  status: z.enum(['draft', 'published', 'archived'])
    .optional(),
  tag: z.string()
    .min(1)
    .max(50)
    .optional(),
  search: z.string()
    .min(1)
    .max(100)
    .optional(),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters'),
  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters')
    .trim(),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters')
    .trim(),
});

// Newsletter subscription schema
export const newsletterSubscriptionSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters'),
  preferences: z.object({
    giftGuides: z.boolean().default(true),
    blogPosts: z.boolean().default(true),
    specialOffers: z.boolean().default(false),
  }).optional(),
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
      'Only image files are allowed'
    ),
});

// Admin user management schema
export const createUserSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  role: z.enum(['user', 'admin', 'editor'])
    .default('user'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
});

export const updateUserSchema = createUserSchema.partial().extend({
  id: z.number().positive('Invalid user ID'),
  password: z.string().optional(),
});

// Analytics query schema
export const analyticsQuerySchema = z.object({
  startDate: z.string()
    .datetime('Invalid start date')
    .optional(),
  endDate: z.string()
    .datetime('Invalid end date')
    .optional(),
  metric: z.enum(['pageViews', 'uniqueVisitors', 'conversions', 'revenue'])
    .default('pageViews'),
  groupBy: z.enum(['day', 'week', 'month'])
    .default('day'),
});

// Export all schemas
export const schemas = {
  createBlogPost: createBlogPostSchema,
  updateBlogPost: updateBlogPostSchema,
  deleteBlogPost: deleteBlogPostSchema,
  giftSearch: giftSearchSchema,
  blogGeneration: blogGenerationSchema,
  login: loginSchema,
  register: registerSchema,
  passwordReset: passwordResetSchema,
  passwordResetConfirm: passwordResetConfirmSchema,
  pagination: paginationSchema,
  blogListQuery: blogListQuerySchema,
  contactForm: contactFormSchema,
  newsletterSubscription: newsletterSubscriptionSchema,
  fileUpload: fileUploadSchema,
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  analyticsQuery: analyticsQuerySchema,
};
