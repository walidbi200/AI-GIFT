import { checkRateLimit, getRateLimitInfo } from '../lib/rate-limit';
import { verifyAuth } from './auth';

/**
 * Get client identifier from request
 * @param request - The incoming request
 * @returns Client identifier string
 */
function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  let ip = 'unknown';
  if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  } else if (realIp) {
    ip = realIp;
  } else if (cfConnectingIp) {
    ip = cfConnectingIp;
  }
  
  return `ip:${ip}`;
}

/**
 * Get user identifier from authentication
 * @param request - The incoming request
 * @returns User identifier or null if not authenticated
 */
async function getUserIdentifier(request: Request): Promise<string | null> {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.authenticated && authResult.user) {
      return `user:${authResult.user.id}`;
    }
  } catch (error) {
    console.error('Error getting user identifier:', error);
  }
  
  return null;
}

/**
 * Rate limiting middleware
 * @param request - The incoming request
 * @param endpointType - Type of endpoint for rate limiting
 * @returns Rate limit result with headers
 */
export async function rateLimit(
  request: Request,
  endpointType: string = 'default'
): Promise<{
  allowed: boolean;
  headers: Record<string, string>;
  retryAfter?: number;
}> {
  try {
    // Get user identifier if authenticated, otherwise use IP
    const userIdentifier = await getUserIdentifier(request);
    const identifier = userIdentifier || getClientIdentifier(request);
    
    // Check rate limit
    const result = checkRateLimit(identifier, endpointType);
    
    // Prepare headers
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': result.remaining.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    };
    
    if (!result.allowed) {
      headers['Retry-After'] = result.retryAfter.toString();
    }
    
    return {
      allowed: result.allowed,
      headers,
      retryAfter: result.allowed ? undefined : result.retryAfter,
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If rate limiting fails, allow the request (fail open)
    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': '999',
        'X-RateLimit-Remaining': '999',
        'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
      },
    };
  }
}

/**
 * Create rate limit error response
 * @param retryAfter - Seconds to wait before retrying
 * @param headers - Rate limit headers
 * @returns Response object
 */
export function createRateLimitResponse(
  retryAfter: number,
  headers: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${retryAfter} seconds.`,
      retryAfter,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  );
}

/**
 * Rate limit middleware for specific endpoint types
 */
export const rateLimitMiddleware = {
  // AI generation endpoints
  aiGeneration: (request: Request) => rateLimit(request, 'ai-generation'),
  
  // Blog generation endpoints
  blogGeneration: (request: Request) => rateLimit(request, 'blog-generation'),
  
  // Authentication endpoints
  login: (request: Request) => rateLimit(request, 'login'),
  register: (request: Request) => rateLimit(request, 'register'),
  
  // Blog write operations
  blogWrite: (request: Request) => rateLimit(request, 'blog-write'),
  
  // General API endpoints
  api: (request: Request) => rateLimit(request, 'api'),
  
  // Default rate limiting
  default: (request: Request) => rateLimit(request, 'default'),
};

/**
 * Apply rate limiting to API handler
 * @param request - The incoming request
 * @param endpointType - Type of endpoint
 * @param handler - The actual API handler
 * @returns Response from handler or rate limit error
 */
export async function withRateLimit<T>(
  request: Request,
  endpointType: string,
  handler: (request: Request) => Promise<Response>
): Promise<Response> {
  const rateLimitResult = await rateLimit(request, endpointType);
  
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult.retryAfter!,
      rateLimitResult.headers
    );
  }
  
  // Call the actual handler
  const response = await handler(request);
  
  // Add rate limit headers to the response
  const responseHeaders = new Headers(response.headers);
  Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
    responseHeaders.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
