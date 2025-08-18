import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Rate limit configurations for different endpoint types
export const rateLimitConfigs = {
  // AI generation endpoints (expensive operations)
  aiGeneration: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'ai_gen'
  },
  
  // Authentication endpoints (security sensitive)
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'auth'
  },
  
  // Blog operations (moderate usage)
  blog: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'blog'
  },
  
  // General API endpoints
  general: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'api'
  },
  
  // File uploads (resource intensive)
  upload: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'upload'
  }
};

/**
 * Get client identifier (IP address or user ID)
 * @param request - The incoming request
 * @param userId - Optional user ID from authentication
 * @returns Client identifier string
 */
function getClientIdentifier(request: Request, userId?: string): string {
  // If user is authenticated, use their ID
  if (userId) {
    return `user:${userId}`;
  }
  
  // Otherwise, use IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

/**
 * Check rate limit for a specific endpoint type
 * @param request - The incoming request
 * @param config - Rate limit configuration
 * @param userId - Optional user ID from authentication
 * @returns Rate limit result
 */
export async function checkRateLimit(
  request: Request,
  config: RateLimitConfig,
  userId?: string
): Promise<RateLimitResult> {
  try {
    const clientId = getClientIdentifier(request, userId);
    const key = `${config.keyPrefix}:${clientId}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Get current requests in the window
    const requests = await redis.zrangebyscore(key, windowStart, '+inf');
    const currentRequests = requests.length;
    
    if (currentRequests >= config.maxRequests) {
      // Rate limit exceeded
      const oldestRequest = requests[0];
      const resetTime = parseInt(oldestRequest) + config.windowMs;
      const retryAfter = Math.ceil((resetTime - now) / 1000);
      
      return {
        success: false,
        remaining: 0,
        resetTime,
        retryAfter
      };
    }
    
    // Add current request to the window
    await redis.zadd(key, now, now.toString());
    await redis.expire(key, Math.ceil(config.windowMs / 1000));
    
    return {
      success: true,
      remaining: config.maxRequests - currentRequests - 1,
      resetTime: now + config.windowMs
    };
    
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If rate limiting fails, allow the request (fail open)
    return {
      success: true,
      remaining: 999,
      resetTime: Date.now() + 60000
    };
  }
}

/**
 * Get rate limit headers for response
 * @param result - Rate limit result
 * @returns Headers object
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  };
  
  if (!result.success && result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }
  
  return headers;
}

/**
 * Create rate limit error response
 * @param result - Rate limit result
 * @returns Response object
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const headers = getRateLimitHeaders(result);
  
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
      timestamp: new Date().toISOString()
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }
  );
}

/**
 * Rate limit middleware for specific endpoint types
 * @param request - The incoming request
 * @param endpointType - Type of endpoint (aiGeneration, auth, blog, etc.)
 * @param userId - Optional user ID from authentication
 * @returns Rate limit result
 */
export async function rateLimit(
  request: Request,
  endpointType: keyof typeof rateLimitConfigs,
  userId?: string
): Promise<RateLimitResult> {
  const config = rateLimitConfigs[endpointType];
  return await checkRateLimit(request, config, userId);
}

/**
 * Clean up old rate limit entries (can be called periodically)
 */
export async function cleanupRateLimits(): Promise<void> {
  try {
    const now = Date.now();
    
    for (const [endpointType, config] of Object.entries(rateLimitConfigs)) {
      const pattern = `${config.keyPrefix}:*`;
      const keys = await redis.keys(pattern);
      
      for (const key of keys) {
        const windowStart = now - config.windowMs;
        await redis.zremrangebyscore(key, '-inf', windowStart);
      }
    }
  } catch (error) {
    console.error('Rate limit cleanup error:', error);
  }
}
