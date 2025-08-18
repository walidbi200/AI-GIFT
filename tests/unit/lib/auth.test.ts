import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateToken,
  verifyToken,
  hashPassword,
  verifyPassword,
  extractTokenFromHeader,
  generateNonce,
  hasPermission,
  type User,
  type TokenPayload
} from '../../../lib/auth';

describe('Authentication Functions', () => {
  let testUser: User;

  beforeEach(() => {
    testUser = {
      id: 'user123',
      email: 'test@example.com',
      role: 'user',
      createdAt: new Date('2024-01-01T00:00:00Z')
    };
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different users', () => {
      const user1 = { ...testUser, id: 'user1' };
      const user2 = { ...testUser, id: 'user2' };
      
      const token1 = generateToken(user1);
      const token2 = generateToken(user2);
      
      expect(token1).not.toBe(token2);
    });

    it('should include user information in token', () => {
      const token = generateToken(testUser);
      const decoded = verifyToken(token);
      
      expect(decoded).not.toBeNull();
      if (decoded) {
        expect(decoded.userId).toBe(testUser.id);
        expect(decoded.email).toBe(testUser.email);
        expect(decoded.role).toBe(testUser.role);
      }
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(testUser);
      const decoded = verifyToken(token);
      
      expect(decoded).not.toBeNull();
      if (decoded) {
        expect(decoded.userId).toBe(testUser.id);
        expect(decoded.email).toBe(testUser.email);
        expect(decoded.role).toBe(testUser.role);
        expect(decoded.iat).toBeDefined();
        expect(decoded.exp).toBeDefined();
      }
    });

    it('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);
      
      expect(decoded).toBeNull();
    });

    it('should reject malformed token', () => {
      const malformedToken = 'not-a-jwt-token';
      const decoded = verifyToken(malformedToken);
      
      expect(decoded).toBeNull();
    });

    it('should reject empty token', () => {
      const decoded = verifyToken('');
      
      expect(decoded).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(password.length);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const hashedPassword = await hashPassword('');
      
      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword123';
      const hashedPassword = await hashPassword(password);
      
      const isValid = await verifyPassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should handle empty password', async () => {
      const hashedPassword = await hashPassword('');
      
      const isValid = await verifyPassword('', hashedPassword);
      expect(isValid).toBe(true);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Authorization header', () => {
      const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      const token = extractTokenFromHeader(authHeader);
      
      expect(token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature');
    });

    it('should return null for missing Authorization header', () => {
      const token = extractTokenFromHeader(null);
      
      expect(token).toBeNull();
    });

    it('should return null for empty Authorization header', () => {
      const token = extractTokenFromHeader('');
      
      expect(token).toBeNull();
    });

    it('should return null for malformed Authorization header', () => {
      const token = extractTokenFromHeader('InvalidHeader');
      
      expect(token).toBeNull();
    });

    it('should return null for Authorization header without Bearer', () => {
      const token = extractTokenFromHeader('Basic dXNlcjpwYXNz');
      
      expect(token).toBeNull();
    });
  });

  describe('generateNonce', () => {
    it('should generate a nonce', () => {
      const nonce = generateNonce();
      
      expect(nonce).toBeDefined();
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
    });

    it('should generate different nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      
      expect(nonce1).not.toBe(nonce2);
    });

    it('should generate alphanumeric nonces', () => {
      const nonce = generateNonce();
      
      expect(nonce).toMatch(/^[a-zA-Z0-9]+$/);
    });
  });

  describe('hasPermission', () => {
    it('should allow admin to access user resources', () => {
      const adminUser: User = {
        ...testUser,
        role: 'admin'
      };
      
      const hasAccess = hasPermission(adminUser, 'user');
      expect(hasAccess).toBe(true);
    });

    it('should allow admin to access admin resources', () => {
      const adminUser: User = {
        ...testUser,
        role: 'admin'
      };
      
      const hasAccess = hasPermission(adminUser, 'admin');
      expect(hasAccess).toBe(true);
    });

    it('should allow user to access user resources', () => {
      const hasAccess = hasPermission(testUser, 'user');
      expect(hasAccess).toBe(true);
    });

    it('should deny user access to admin resources', () => {
      const hasAccess = hasPermission(testUser, 'admin');
      expect(hasAccess).toBe(false);
    });
  });

  describe('Token Payload Interface', () => {
    it('should have correct structure', () => {
      const token = generateToken(testUser);
      const decoded = verifyToken(token);
      
      expect(decoded).toMatchObject({
        userId: expect.any(String),
        email: expect.any(String),
        role: expect.any(String),
        iat: expect.any(Number),
        exp: expect.any(Number)
      });
    });
  });

  describe('User Interface', () => {
    it('should have correct structure', () => {
      expect(testUser).toMatchObject({
        id: expect.any(String),
        email: expect.any(String),
        role: expect.stringMatching(/^(user|admin)$/),
        createdAt: expect.any(Date)
      });
    });
  });
});
