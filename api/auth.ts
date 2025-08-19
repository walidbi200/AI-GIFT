import type { VercelRequest, VercelResponse } from '@vercel/node';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
}

interface ValidateRequest {
  token: string;
}

interface ValidateResponse {
  valid: boolean;
  message: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        return await handlePost(req, res);
      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
        return;
    }
  } catch (error) {
    console.error('Auth API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  // Handle login
  if (action === 'login') {
    return await handleLogin(req, res);
  }

  // Handle validation
  if (action === 'validate') {
    return await handleValidate(req, res);
  }

  // Default: assume login
  return await handleLogin(req, res);
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  try {
    const { username, password }: LoginRequest = req.body;

    // Debug logging (remove in production)
    console.log('Login attempt:', { 
      username, 
      hasPassword: !!password,
      adminUserConfigured: !!process.env.ADMIN_USER,
      adminPassConfigured: !!process.env.ADMIN_PASS
    });

    // Validate input
    if (!username || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
      return;
    }

    // Check credentials against environment variables
    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASS;

    if (!adminUser || !adminPass) {
      console.error('Admin credentials not configured in environment variables');
      res.status(500).json({ 
        success: false, 
        message: 'Server configuration error - please check environment variables' 
      });
      return;
    }

    // Compare credentials (case-sensitive)
    const usernameMatch = username === adminUser;
    const passwordMatch = password === adminPass;

    console.log('Credential check:', { 
      usernameMatch, 
      passwordMatch,
      providedUsername: username,
      expectedUsername: adminUser
    });

    if (usernameMatch && passwordMatch) {
      // Generate a simple session token (in production, use JWT)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      console.log('Login successful for user:', username);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token
      });
    } else {
      console.log('Login failed - invalid credentials');
      res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

async function handleValidate(req: VercelRequest, res: VercelResponse) {
  try {
    const { token }: ValidateRequest = req.body;

    if (!token) {
      res.status(400).json({ valid: false, message: 'Token is required' });
      return;
    }

    // Decode the token to check if it's valid
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [username, timestamp] = decoded.split(':');
      
      if (!username || !timestamp) {
        res.status(401).json({ valid: false, message: 'Invalid token format' });
        return;
      }

      // Check if token is not too old (24 hours)
      const tokenAge = Date.now() - parseInt(timestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (tokenAge > maxAge) {
        res.status(401).json({ valid: false, message: 'Token expired' });
        return;
      }

      // Verify username matches admin user
      const adminUser = process.env.ADMIN_USER;
      if (username !== adminUser) {
        res.status(401).json({ valid: false, message: 'Invalid token' });
        return;
      }

      res.status(200).json({ valid: true, message: 'Token is valid' });
    } catch (decodeError) {
      res.status(401).json({ valid: false, message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ valid: false, message: 'Internal server error' });
  }
}
