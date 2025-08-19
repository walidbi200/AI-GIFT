import { verifyToken, extractTokenFromHeader, AuthResult, User } from '../lib/auth';

/**
 * Authentication middleware for API routes
 * Extracts JWT from Authorization header, verifies token, and attaches user info
 */
export async function verifyAuth(request: Request): Promise<AuthResult> {
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
    
    // Create user object from token payload (admin only)
    const user: User = {
      id: decoded.userId,
      email: decoded.email,
      role: 'admin',
      createdAt: new Date(decoded.iat * 1000), // Convert timestamp to Date
    };
    
    return {
      authenticated: true,
      user
    };
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return {
      authenticated: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Require admin role middleware
 * Returns 403 if user is not authenticated as admin
 */
export async function requireAdmin(request: Request): Promise<AuthResult> {
  const authResult = await verifyAuth(request);
  
  if (!authResult.authenticated) {
    return authResult;
  }
  
  // Since we only support admin users, any authenticated user is an admin
  return authResult;
}

/**
 * Optional authentication middleware
 * Doesn't fail if no token provided, but validates if present
 */
export async function optionalAuth(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return { authenticated: false };
  }
  
  return verifyAuth(request);
}

/**
 * Create a response for authentication errors
 * @param error - The error message
 * @param status - HTTP status code (default: 401)
 * @returns Response object
 */
export function createAuthErrorResponse(error: string, status: number = 401): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: error,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer'
      }
    }
  );
}

/**
 * Create a response for authorization errors
 * @param error - The error message
 * @param status - HTTP status code (default: 403)
 * @returns Response object
 */
export function createAuthzErrorResponse(error: string, status: number = 403): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: error,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}
