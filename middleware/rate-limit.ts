import { rateLimit, createRateLimitResponse, RateLimitResult } from '../lib/rate-limit';
import { verifyAuth } from './auth';

export interface RateLimitOptions {
  endpointType: 'aiGeneration' | 'auth' | 'blog' | 'general' | 'upload';
  skipAuth?: boolean;
}

/**
 * Rate limiting middleware for API routes
 * @param request - The incoming request
 * @param options - Rate limiting options
 * @returns Rate limit result or null if passed
 */
export async function applyRateLimit(
  request: Request,
  options: RateLimitOptions
): Promise<RateLimitResult | null> {
  try {
    let userId: string | undefined;
    
    // Get user ID if authentication is required
    if (!options.skipAuth) {
      const authResult = await verifyAuth(request);
      if (authResult.authenticated && authResult.user) {
        userId = authResult.user.userId;
      }
    }
    
    // Apply rate limiting
    const result = await rateLimit(request, options.endpointType, userId);
    
    if (!result.success) {
      return result;
    }
    
    return null; // Rate limit passed
  } catch (error) {
    console.error('Rate limiting middleware error:', error);
    // If rate limiting fails, allow the request (fail open)
    return null;
  }
}

/**
 * Create a middleware function for specific endpoint types
 * @param endpointType - The type of endpoint to rate limit
 * @param skipAuth - Whether to skip authentication check
 * @returns Middleware function
 */
export function createRateLimitMiddleware(
  endpointType: RateLimitOptions['endpointType'],
  skipAuth: boolean = false
) {
  return async (request: Request): Promise<Response | null> => {
    const result = await applyRateLimit(request, { endpointType, skipAuth });
    
    if (result) {
      return createRateLimitResponse(result);
    }
    
    return null; // Continue with request
  };
}

/**
 * Rate limit middleware for AI generation endpoints
 */
export const aiGenerationRateLimit = createRateLimitMiddleware('aiGeneration');

/**
 * Rate limit middleware for authentication endpoints
 */
export const authRateLimit = createRateLimitMiddleware('auth', true);

/**
 * Rate limit middleware for blog endpoints
 */
export const blogRateLimit = createRateLimitMiddleware('blog');

/**
 * Rate limit middleware for general API endpoints
 */
export const generalRateLimit = createRateLimitMiddleware('general');

/**
 * Rate limit middleware for file upload endpoints
 */
export const uploadRateLimit = createRateLimitMiddleware('upload');

/**
 * Combined authentication and rate limiting middleware
 * @param request - The incoming request
 * @param endpointType - The type of endpoint
 * @returns Response if blocked, null if allowed
 */
export async function authAndRateLimit(
  request: Request,
  endpointType: RateLimitOptions['endpointType']
): Promise<Response | null> {
  // First check rate limiting
  const rateLimitResult = await applyRateLimit(request, { endpointType });
  if (rateLimitResult) {
    return createRateLimitResponse(rateLimitResult);
  }
  
  // Then check authentication
  const authResult = await verifyAuth(request);
  if (!authResult.authenticated) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Authentication required',
        message: authResult.error || 'Please provide valid authentication credentials',
        timestamp: new Date().toISOString()
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer'
        }
      }
    );
  }
  
  return null; // Both checks passed
}

/**
 * Get rate limit information for a client
 * @param request - The incoming request
 * @param endpointType - The type of endpoint
 * @param userId - Optional user ID
 * @returns Rate limit information
 */
export async function getRateLimitInfo(
  request: Request,
  endpointType: RateLimitOptions['endpointType'],
  userId?: string
): Promise<{
  remaining: number;
  resetTime: number;
  limit: number;
}> {
  const { rateLimitConfigs } = await import('../lib/rate-limit');
  const config = rateLimitConfigs[endpointType];
  
  const result = await rateLimit(request, endpointType, userId);
  
  return {
    remaining: result.remaining,
    resetTime: result.resetTime,
    limit: config.maxRequests
  };
}
