import { authenticateRequest, AuthResult, JWTPayload } from '../lib/auth';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

/**
 * Authentication middleware for API routes
 * @param request - The incoming request
 * @returns Authentication result with user info if successful
 */
export async function verifyAuth(request: Request): Promise<AuthResult> {
  return await authenticateRequest(request);
}

/**
 * Middleware that requires authentication
 * @param request - The incoming request
 * @returns Request with user info attached, or throws error if not authenticated
 */
export async function requireAuth(request: Request): Promise<AuthenticatedRequest> {
  const authResult = await verifyAuth(request);
  
  if (!authResult.authenticated) {
    throw new Error(authResult.error || 'Authentication required');
  }
  
  // Attach user info to request
  (request as AuthenticatedRequest).user = authResult.user;
  return request as AuthenticatedRequest;
}

/**
 * Middleware that requires specific role
 * @param request - The incoming request
 * @param requiredRole - The role required for access
 * @returns Request with user info attached, or throws error if not authorized
 */
export async function requireRole(
  request: Request, 
  requiredRole: string
): Promise<AuthenticatedRequest> {
  const authResult = await verifyAuth(request);
  
  if (!authResult.authenticated) {
    throw new Error(authResult.error || 'Authentication required');
  }
  
  if (!authResult.user) {
    throw new Error('User information not available');
  }
  
  // Check if user has required role
  const hasRequiredRole = authResult.user.role === requiredRole || authResult.user.role === 'admin';
  
  if (!hasRequiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }
  
  // Attach user info to request
  (request as AuthenticatedRequest).user = authResult.user;
  return request as AuthenticatedRequest;
}

/**
 * Optional authentication middleware
 * @param request - The incoming request
 * @returns Request with user info attached if authenticated, otherwise original request
 */
export async function optionalAuth(request: Request): Promise<AuthenticatedRequest> {
  const authResult = await verifyAuth(request);
  
  if (authResult.authenticated && authResult.user) {
    (request as AuthenticatedRequest).user = authResult.user;
  }
  
  return request as AuthenticatedRequest;
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
