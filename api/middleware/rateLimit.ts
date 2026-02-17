import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limits for different endpoints
export const giftRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 gift requests per minute
  analytics: true,
  prefix: 'ratelimit:gifts',
});

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 login attempts per minute
  analytics: true,
  prefix: 'ratelimit:auth',
});

export const generalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '60 s'), // 30 general requests per minute
  analytics: true,
  prefix: 'ratelimit:general',
});

export async function checkRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  limiter: Ratelimit
): Promise<boolean> {
  // Get identifier (IP address)
  const identifier =
    req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'anonymous';

  const { success, limit, reset, remaining } = await limiter.limit(
    identifier as string
  );

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', limit.toString());
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Reset', new Date(reset).toISOString());

  if (!success) {
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: new Date(reset).toISOString(),
    });
    return false;
  }

  return true;
}
