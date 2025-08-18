import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  generateToken, 
  verifyToken, 
  extractTokenFromHeader, 
  authenticateRequest,
  hasRole,
  generateSecureToken
} from '../../../lib/auth';

// Mock environment variables
vi.mock('process.env', () => ({
  JWT_SECRET: 'test-jwt-secret',
  JWT_EXPIRES_IN: '1h'
}));

describe('Authentication Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = 'user123';
      const email = 'test@example.com';
      const role = 'user';

      const token = generateToken(userId, email, role);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate token with minimal data', () => {
      const userId = 'user123';
      const token = generateToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should generate different tokens for different users', () => {
      const token1 = generateToken('user1');
      const token2 = generateToken('user2');

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const userId = 'user123';
      const email = 'test@example.com';
      const role = 'user';

      const token = generateToken(userId, email, role);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(userId);
      expect(decoded?.email).toBe(email);
      expect(decoded?.role).toBe(role);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it('should return null for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';
      const decoded = verifyToken(malformedToken);

      expect(decoded).toBeNull();
    });

    it('should return null for empty token', () => {
      const decoded = verifyToken('');

      expect(decoded).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Authorization header', () => {
      const authHeader = 'Bearer valid.jwt.token';
      const token = extractTokenFromHeader(authHeader);

      expect(token).toBe('valid.jwt.token');
    });

    it('should return null for missing Authorization header', () => {
      const token = extractTokenFromHeader(null);

      expect(token).toBeNull();
    });

    it('should return null for invalid Authorization header format', () => {
      const authHeader = 'InvalidFormat valid.jwt.token';
      const token = extractTokenFromHeader(authHeader);

      expect(token).toBeNull();
    });

    it('should return null for Authorization header without token', () => {
      const authHeader = 'Bearer';
      const token = extractTokenFromHeader(authHeader);

      expect(token).toBeNull();
    });

    it('should return null for empty Authorization header', () => {
      const authHeader = '';
      const token = extractTokenFromHeader(authHeader);

      expect(token).toBeNull();
    });
  });

  describe('authenticateRequest', () => {
    it('should authenticate request with valid token', async () => {
      const userId = 'user123';
      const token = generateToken(userId);
      const request = new Request('http://localhost/api/test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await authenticateRequest(request);

      expect(result.authenticated).toBe(true);
      expect(result.user?.userId).toBe(userId);
      expect(result.error).toBeUndefined();
    });

    it('should reject request without Authorization header', async () => {
      const request = new Request('http://localhost/api/test');

      const result = await authenticateRequest(request);

      expect(result.authenticated).toBe(false);
      expect(result.error).toBe('No authorization token provided');
      expect(result.user).toBeUndefined();
    });

    it('should reject request with invalid token', async () => {
      const request = new Request('http://localhost/api/test', {
        headers: {
          'Authorization': 'Bearer invalid.token.here'
        }
      });

      const result = await authenticateRequest(request);

      expect(result.authenticated).toBe(false);
      expect(result.error).toBe('Invalid or expired token');
      expect(result.user).toBeUndefined();
    });

    it('should reject request with malformed Authorization header', async () => {
      const request = new Request('http://localhost/api/test', {
        headers: {
          'Authorization': 'InvalidFormat token'
        }
      });

      const result = await authenticateRequest(request);

      expect(result.authenticated).toBe(false);
      expect(result.error).toBe('No authorization token provided');
      expect(result.user).toBeUndefined();
    });
  });

  describe('hasRole', () => {
    it('should return true for user with required role', () => {
      const user = { userId: 'user123', role: 'admin' };
      const hasAdminRole = hasRole(user, 'admin');

      expect(hasAdminRole).toBe(true);
    });

    it('should return true for admin user regardless of required role', () => {
      const user = { userId: 'user123', role: 'admin' };
      const hasUserRole = hasRole(user, 'user');

      expect(hasUserRole).toBe(true);
    });

    it('should return false for user without required role', () => {
      const user = { userId: 'user123', role: 'user' };
      const hasAdminRole = hasRole(user, 'admin');

      expect(hasAdminRole).toBe(false);
    });

    it('should return false for user without role', () => {
      const user = { userId: 'user123' };
      const hasAdminRole = hasRole(user, 'admin');

      expect(hasAdminRole).toBe(false);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate a secure token with default length', () => {
      const token = generateSecureToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(32);
    });

    it('should generate a secure token with custom length', () => {
      const length = 16;
      const token = generateSecureToken(length);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(length);
    });

    it('should generate different tokens on each call', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();

      expect(token1).not.toBe(token2);
    });

    it('should generate tokens with valid characters', () => {
      const token = generateSecureToken();
      const validChars = /^[A-Za-z0-9]+$/;

      expect(validChars.test(token)).toBe(true);
    });
  });
});
