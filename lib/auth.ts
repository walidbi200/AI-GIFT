import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Types
export interface User {
  id: string;
  email: string;
  role: 'admin';
  createdAt: Date;
}

export interface AuthResult {
  authenticated: boolean;
  user?: User;
  error?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'admin';
  iat: number;
  exp: number;
}

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const SALT_ROUNDS = 12;

// Token generation
export function generateToken(user: User): string {
  const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'smartgiftfinder.xyz',
    audience: 'smartgiftfinder-users',
  });
}

// Token verification
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'smartgiftfinder.xyz',
      audience: 'smartgiftfinder-users',
    }) as TokenPayload;
    
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Password verification
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

// Generate secure random string for nonces
export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Validate user permissions (admin only)
export function hasPermission(user: User, requiredRole: 'admin'): boolean {
  return user.role === 'admin';
}

