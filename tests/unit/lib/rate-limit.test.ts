import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkRateLimit,
  getRateLimitInfo,
  resetRateLimit,
  getRateLimitConfigs,
  updateRateLimitConfig,
  rateLimiter,
  type RateLimitConfig
} from '../../../lib/rate-limit';

describe('Rate Limiting', () => {
  const testIdentifier = 'test-user-123';
  const testEndpoint = 'api';

  beforeEach(() => {
    // Reset rate limiter before each test
    rateLimiter.destroy();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      // Make 5 requests (within the 100 limit for 'api' endpoint)
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(testIdentifier, testEndpoint);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBeGreaterThan(0);
      }
    });

    it('should block requests when limit exceeded', () => {
      // Make 101 requests to exceed the 100 limit for 'api' endpoint
      for (let i = 0; i < 100; i++) {
        checkRateLimit(testIdentifier, testEndpoint);
      }
      
      const result = checkRateLimit(testIdentifier, testEndpoint);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should reset after window expires', () => {
      // Make some requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit(testIdentifier, testEndpoint);
      }

      // Mock time to advance past the window
      const originalDateNow = Date.now;
      const mockTime = Date.now() + 70000; // 70 seconds later
      vi.spyOn(Date, 'now').mockImplementation(() => mockTime);

      // Should be allowed again
      const result = checkRateLimit(testIdentifier, testEndpoint);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99); // 100 - 1

      // Restore original Date.now
      vi.restoreAllMocks();
    });

    it('should handle different endpoint types', () => {
      // Test AI generation endpoint (10 requests per minute)
      for (let i = 0; i < 10; i++) {
        const result = checkRateLimit(testIdentifier, 'ai-generation');
        expect(result.allowed).toBe(true);
      }

      // 11th request should be blocked
      const result = checkRateLimit(testIdentifier, 'ai-generation');
      expect(result.allowed).toBe(false);
    });

    it('should handle login endpoint restrictions', () => {
      // Test login endpoint (5 requests per 15 minutes)
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(testIdentifier, 'login');
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked
      const result = checkRateLimit(testIdentifier, 'login');
      expect(result.allowed).toBe(false);
    });
  });

  describe('getRateLimitInfo', () => {
    it('should return correct limit information', () => {
      const info = getRateLimitInfo(testIdentifier, testEndpoint);
      
      expect(info.remaining).toBe(100);
      expect(info.limit).toBe(100);
      expect(info.resetTime).toBeGreaterThan(Date.now());
    });

    it('should not increment counter when getting info', () => {
      const info1 = getRateLimitInfo(testIdentifier, testEndpoint);
      const info2 = getRateLimitInfo(testIdentifier, testEndpoint);
      
      expect(info1.remaining).toBe(info2.remaining);
    });

    it('should reflect remaining requests after usage', () => {
      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        checkRateLimit(testIdentifier, testEndpoint);
      }

      const info = getRateLimitInfo(testIdentifier, testEndpoint);
      expect(info.remaining).toBe(97); // 100 - 3
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for identifier', () => {
      // Make some requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit(testIdentifier, testEndpoint);
      }

      // Reset the limit
      resetRateLimit(testIdentifier, testEndpoint);

      // Should be back to full limit
      const info = getRateLimitInfo(testIdentifier, testEndpoint);
      expect(info.remaining).toBe(100);
    });

    it('should only reset specific endpoint', () => {
      // Make requests to two different endpoints
      for (let i = 0; i < 5; i++) {
        checkRateLimit(testIdentifier, 'api');
        checkRateLimit(testIdentifier, 'ai-generation');
      }

      // Reset only the 'api' endpoint
      resetRateLimit(testIdentifier, 'api');

      // 'api' should be reset
      const apiInfo = getRateLimitInfo(testIdentifier, 'api');
      expect(apiInfo.remaining).toBe(100);

      // 'ai-generation' should still be reduced
      const aiInfo = getRateLimitInfo(testIdentifier, 'ai-generation');
      expect(aiInfo.remaining).toBe(5); // 10 - 5
    });
  });

  describe('getRateLimitConfigs', () => {
    it('should return all rate limit configurations', () => {
      const configs = getRateLimitConfigs();
      
      expect(configs).toHaveProperty('ai-generation');
      expect(configs).toHaveProperty('blog-generation');
      expect(configs).toHaveProperty('login');
      expect(configs).toHaveProperty('register');
      expect(configs).toHaveProperty('api');
      expect(configs).toHaveProperty('blog-write');
      expect(configs).toHaveProperty('default');
    });

    it('should return correct configuration values', () => {
      const configs = getRateLimitConfigs();
      
      expect(configs['ai-generation'].maxRequests).toBe(10);
      expect(configs['ai-generation'].windowMs).toBe(60000);
      
      expect(configs['login'].maxRequests).toBe(5);
      expect(configs['login'].windowMs).toBe(900000); // 15 minutes
      
      expect(configs['api'].maxRequests).toBe(100);
      expect(configs['api'].windowMs).toBe(60000);
    });
  });

  describe('updateRateLimitConfig', () => {
    it('should update existing configuration', () => {
      const newConfig: RateLimitConfig = {
        maxRequests: 50,
        windowMs: 30000
      };

      updateRateLimitConfig('api', newConfig);
      
      const configs = getRateLimitConfigs();
      expect(configs['api'].maxRequests).toBe(50);
      expect(configs['api'].windowMs).toBe(30000);
    });

    it('should add new configuration', () => {
      const newConfig: RateLimitConfig = {
        maxRequests: 25,
        windowMs: 45000
      };

      updateRateLimitConfig('custom-endpoint', newConfig);
      
      const configs = getRateLimitConfigs();
      expect(configs['custom-endpoint'].maxRequests).toBe(25);
      expect(configs['custom-endpoint'].windowMs).toBe(45000);
    });
  });

  describe('Rate Limiter Instance', () => {
    it('should handle multiple identifiers independently', () => {
      const user1 = 'user-1';
      const user2 = 'user-2';

      // User 1 makes 5 requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit(user1, testEndpoint);
      }

      // User 2 should still have full limit
      const user2Info = getRateLimitInfo(user2, testEndpoint);
      expect(user2Info.remaining).toBe(100);

      // User 1 should have reduced limit
      const user1Info = getRateLimitInfo(user1, testEndpoint);
      expect(user1Info.remaining).toBe(95);
    });

    it('should handle cleanup of expired entries', () => {
      // Make some requests
      checkRateLimit(testIdentifier, testEndpoint);

      // Mock time to advance past the window
      const originalDateNow = Date.now;
      const mockTime = Date.now() + 70000; // 70 seconds later
      vi.spyOn(Date, 'now').mockImplementation(() => mockTime);

      // Trigger cleanup
      rateLimiter['cleanup']();

      // Should be back to full limit
      const info = getRateLimitInfo(testIdentifier, testEndpoint);
      expect(info.remaining).toBe(100);

      // Restore original Date.now
      vi.restoreAllMocks();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty identifier', () => {
      const result = checkRateLimit('', testEndpoint);
      expect(result.allowed).toBe(true);
    });

    it('should handle non-existent endpoint type', () => {
      const result = checkRateLimit(testIdentifier, 'non-existent-endpoint');
      expect(result.allowed).toBe(true); // Should use default config
    });

    it('should handle concurrent requests', () => {
      const promises = Array.from({ length: 10 }, () => 
        Promise.resolve(checkRateLimit(testIdentifier, testEndpoint))
      );

      return Promise.all(promises).then(results => {
        // All should be allowed
        results.forEach(result => {
          expect(result.allowed).toBe(true);
        });
      });
    });
  });
});
