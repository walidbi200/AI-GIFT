import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
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
} from '../../lib/auth';

// Mock environment variables
vi.mock('process', () => ({
  env: {
    JWT_SECRET: 'test-jwt-secret'
  }
}));

describe('Authentication Utilities', () => {
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    role: 'admin',
    createdAt: new Date('2024-01-01')
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user data in token payload', () => {
      const token = generateToken(mockUser);
      const decoded = jwt.verify(token, 'test-jwt-secret') as TokenPayload;
      
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should handle different user roles', () => {
      const userUser: User = { ...mockUser, role: 'user' };
      const token = generateToken(userUser);
      const decoded = jwt.verify(token, 'test-jwt-secret') as TokenPayload;
      
      expect(decoded.role).toBe('user');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(mockUser);
      const result = verifyToken(token);
      
      expect(result).toBeDefined();
      expect(result?.userId).toBe(mockUser.id);
      expect(result?.email).toBe(mockUser.email);
    });

    it('should return null for invalid token', () => {
      const result = verifyToken('invalid-token');
      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      // Create a token that expires immediately
      const expiredToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        'test-jwt-secret',
        { expiresIn: '0s' }
      );
      
      const result = verifyToken(expiredToken);
      expect(result).toBeNull();
    });

    it('should return null for token with wrong secret', () => {
      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        'wrong-secret',
        { expiresIn: '1h' }
      );
      
      const result = verifyToken(token);
      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/); // bcrypt format
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testpassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const hashedPassword = await hashPassword('');
      expect(hashedPassword).toBeDefined();
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);
      
      const result = await verifyPassword(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);
      
      const result = await verifyPassword('wrongpassword', hashedPassword);
      expect(result).toBe(false);
    });

    it('should handle empty password', async () => {
      const hashedPassword = await hashPassword('');
      
      const result = await verifyPassword('', hashedPassword);
      expect(result).toBe(true);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const token = 'test-token-123';
      const header = `Bearer ${token}`;
      
      const result = extractTokenFromHeader(header);
      expect(result).toBe(token);
    });

    it('should return null for invalid header format', () => {
      const result = extractTokenFromHeader('InvalidFormat token');
      expect(result).toBeNull();
    });

    it('should return null for empty header', () => {
      const result = extractTokenFromHeader('');
      expect(result).toBeNull();
    });

    it('should return null for null header', () => {
      const result = extractTokenFromHeader(null);
      expect(result).toBeNull();
    });

    it('should handle header without Bearer prefix', () => {
      const result = extractTokenFromHeader('just-a-token');
      expect(result).toBeNull();
    });
  });

  describe('generateNonce', () => {
    it('should generate a nonce string', () => {
      const nonce = generateNonce();
      
      expect(nonce).toBeDefined();
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
    });

    it('should generate unique nonces', () => {
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
    it('should allow admin access to admin resources', () => {
      const adminUser: User = { ...mockUser, role: 'admin' };
      const result = hasPermission(adminUser, 'admin');
      expect(result).toBe(true);
    });

    it('should allow admin access to user resources', () => {
      const adminUser: User = { ...mockUser, role: 'admin' };
      const result = hasPermission(adminUser, 'user');
      expect(result).toBe(true);
    });

    it('should allow user access to user resources', () => {
      const userUser: User = { ...mockUser, role: 'user' };
      const result = hasPermission(userUser, 'user');
      expect(result).toBe(true);
    });

    it('should deny user access to admin resources', () => {
      const userUser: User = { ...mockUser, role: 'user' };
      const result = hasPermission(userUser, 'admin');
      expect(result).toBe(false);
    });

    it('should handle unknown roles', () => {
      const unknownUser: User = { ...mockUser, role: 'unknown' as any };
      const result = hasPermission(unknownUser, 'admin');
      expect(result).toBe(false);
    });
  });
});
