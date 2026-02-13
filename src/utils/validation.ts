import { z } from 'zod';

// Gift Request Validation Schema
export const GiftRequestSchema = z.object({
    recipient: z.string()
        .min(1, 'Recipient is required')
        .max(50, 'Recipient name is too long')
        .regex(/^[a-zA-Z\s'-]+$/, 'Recipient contains invalid characters')
        .transform(val => val.trim()),

    occasion: z.string()
        .min(1, 'Occasion is required')
        .max(50, 'Occasion name is too long')
        .regex(/^[a-zA-Z\s'-]+$/, 'Occasion contains invalid characters')
        .transform(val => val.trim()),

    budget: z.string()
        .regex(/^(under-\d+|\d+-\d+|over-\d+)$/, 'Invalid budget format')
        .refine(
            (val) => {
                const match = val.match(/\d+/g);
                if (match) {
                    const numbers = match.map(Number);
                    return numbers.every(n => n >= 1 && n <= 10000);
                }
                return false;
            },
            'Budget values must be between $1 and $10,000'
        ),

    interests: z.string()
        .max(200, 'Interests description is too long')
        .optional()
        .transform(val => val?.trim() || ''),

    negativeKeywords: z.string()
        .max(200, 'Negative keywords list is too long')
        .optional()
        .transform(val => val?.trim() || ''),
});

export type GiftRequest = z.infer<typeof GiftRequestSchema>;

// Email Validation Schema
export const EmailSchema = z.object({
    email: z.string()
        .email('Invalid email address')
        .max(100, 'Email address is too long')
        .toLowerCase()
        .transform(val => val.trim()),

    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name is too long')
        .optional()
        .transform(val => val?.trim()),
});

export type EmailSubscription = z.infer<typeof EmailSchema>;

// Contact Form Validation Schema
export const ContactFormSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name is too long')
        .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
        .transform(val => val.trim()),

    email: z.string()
        .email('Invalid email address')
        .max(100, 'Email is too long')
        .toLowerCase()
        .transform(val => val.trim()),

    message: z.string()
        .min(10, 'Message must be at least 10 characters')
        .max(1000, 'Message is too long')
        .transform(val => val.trim()),

    subject: z.string()
        .min(1, 'Subject is required')
        .max(200, 'Subject is too long')
        .optional()
        .transform(val => val?.trim()),
});

export type ContactForm = z.infer<typeof ContactFormSchema>;

// Blog Post Validation Schema (for admin)
export const BlogPostSchema = z.object({
    title: z.string()
        .min(1, 'Title is required')
        .max(200, 'Title is too long')
        .transform(val => val.trim()),

    content: z.string()
        .min(100, 'Content must be at least 100 characters')
        .max(50000, 'Content is too long'),

    excerpt: z.string()
        .max(500, 'Excerpt is too long')
        .optional()
        .transform(val => val?.trim() || ''),

    slug: z.string()
        .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
        .max(200, 'Slug is too long')
        .transform(val => val.toLowerCase().trim()),

    published: z.boolean()
        .default(false),

    tags: z.array(z.string())
        .max(10, 'Too many tags')
        .optional()
        .default([]),
});

export type BlogPost = z.infer<typeof BlogPostSchema>;

// Validation Helper Functions

/**
 * Sanitize string to prevent XSS and injection attacks
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/[<>{}]/g, '') // Remove potential injection characters
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
}

/**
 * Sanitize HTML content (for blog posts)
 */
export function sanitizeHtml(html: string): string {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
        .replace(/on\w+="[^"]*"/gi, '') // Remove inline event handlers
        .replace(/on\w+='[^']*'/gi, '');
}

/**
 * Validate and sanitize data with a Zod schema
 */
export function validateAndSanitize<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, errors: error };
        }
        throw error;
    }
}

/**
 * Format Zod errors for user-friendly display
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
    const formatted: Record<string, string> = {};

    error.errors.forEach((err) => {
        const path = err.path.join('.');
        formatted[path] = err.message;
    });

    return formatted;
}
