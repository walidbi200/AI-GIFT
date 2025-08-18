// In-memory rate limiting store
// In production, use Redis or similar for distributed environments

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  // Rate limit configurations for different endpoints
  private readonly configs: Record<string, RateLimitConfig> = {
    // AI generation endpoints - more restrictive
    'ai-generation': {
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
    },
    'blog-generation': {
      maxRequests: 5,
      windowMs: 60 * 1000, // 1 minute
    },
    // Authentication endpoints - very restrictive
    'login': {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
    'register': {
      maxRequests: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
    },
    // General API endpoints
    'api': {
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minute
    },
    // Blog operations
    'blog-write': {
      maxRequests: 20,
      windowMs: 60 * 1000, // 1 minute
    },
    // Default fallback
    'default': {
      maxRequests: 50,
      windowMs: 60 * 1000, // 1 minute
    },
  };

  /**
   * Check if request is within rate limit
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @param endpointType - Type of endpoint for rate limiting
   * @returns Rate limit result with remaining requests and reset time
   */
  checkLimit(identifier: string, endpointType: string = 'default'): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter: number;
  } {
    const config = this.configs[endpointType] || this.configs.default;
    const key = `${identifier}:${endpointType}`;
    const now = Date.now();

    // Get or create entry
    let entry = this.store.get(key);
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      };
    }

    // Check if limit exceeded
    const allowed = entry.count < config.maxRequests;
    
    if (allowed) {
      entry.count++;
      this.store.set(key, entry);
    }

    const remaining = Math.max(0, config.maxRequests - entry.count);
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  /**
   * Get rate limit info without incrementing counter
   * @param identifier - Unique identifier
   * @param endpointType - Type of endpoint
   * @returns Rate limit information
   */
  getLimitInfo(identifier: string, endpointType: string = 'default'): {
    remaining: number;
    resetTime: number;
    limit: number;
  } {
    const config = this.configs[endpointType] || this.configs.default;
    const key = `${identifier}:${endpointType}`;
    const now = Date.now();

    const entry = this.store.get(key);
    if (!entry || now > entry.resetTime) {
      return {
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        limit: config.maxRequests,
      };
    }

    return {
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      limit: config.maxRequests,
    };
  }

  /**
   * Reset rate limit for an identifier
   * @param identifier - Unique identifier
   * @param endpointType - Type of endpoint
   */
  reset(identifier: string, endpointType: string = 'default'): void {
    const key = `${identifier}:${endpointType}`;
    this.store.delete(key);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get all rate limit configurations
   */
  getConfigs(): Record<string, RateLimitConfig> {
    return { ...this.configs };
  }

  /**
   * Update rate limit configuration
   * @param endpointType - Type of endpoint
   * @param config - New configuration
   */
  updateConfig(endpointType: string, config: RateLimitConfig): void {
    this.configs[endpointType] = config;
  }

  /**
   * Destroy the rate limiter and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// Export functions for easy use
export function checkRateLimit(identifier: string, endpointType: string = 'default') {
  return rateLimiter.checkLimit(identifier, endpointType);
}

export function getRateLimitInfo(identifier: string, endpointType: string = 'default') {
  return rateLimiter.getLimitInfo(identifier, endpointType);
}

export function resetRateLimit(identifier: string, endpointType: string = 'default') {
  return rateLimiter.reset(identifier, endpointType);
}

export function getRateLimitConfigs() {
  return rateLimiter.getConfigs();
}

export function updateRateLimitConfig(endpointType: string, config: RateLimitConfig) {
  return rateLimiter.updateConfig(endpointType, config);
}

// Export the rate limiter instance for advanced usage
export { rateLimiter };

// Export types
export type { RateLimitConfig, RateLimitEntry };
