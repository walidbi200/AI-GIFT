import jwt from 'jsonwebtoken';

// JWT secret should be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JWTPayload {
  userId: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  authenticated: boolean;
  user?: JWTPayload;
  error?: string;
}

/**
 * Generate a JWT token for a user
 * @param userId - The user's unique identifier
 * @param email - The user's email address
 * @param role - The user's role (optional)
 * @returns JWT token string
 */
export function generateToken(userId: string, email?: string, role?: string): string {
  const payload: JWTPayload = {
    userId,
    email,
    role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'smartgiftfinder.xyz',
    audience: 'smartgiftfinder-users',
  });
}

/**
 * Verify and decode a JWT token
 * @param token - The JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'smartgiftfinder.xyz',
      audience: 'smartgiftfinder-users',
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader - The Authorization header value
 * @returns Token string or null if not found
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Authenticate a request using JWT token
 * @param request - The incoming request
 * @returns Authentication result with user info if successful
 */
export async function authenticateRequest(request: Request): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return {
        authenticated: false,
        error: 'No authorization token provided'
      };
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return {
        authenticated: false,
        error: 'Invalid or expired token'
      };
    }
    
    return {
      authenticated: true,
      user: decoded
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      authenticated: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Check if user has required role
 * @param user - The authenticated user
 * @param requiredRole - The role required for access
 * @returns True if user has required role
 */
export function hasRole(user: JWTPayload, requiredRole: string): boolean {
  return user.role === requiredRole || user.role === 'admin';
}

/**
 * Generate a secure random token for password reset or email verification
 * @param length - Length of the token (default: 32)
 * @returns Secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomArray[i] % chars.length);
  }
  
  return result;
}
