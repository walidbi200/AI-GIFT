import type { VercelRequest, VercelResponse } from '@vercel/node';

interface LoginRequest {
  username: string;
  password: string;
}

interface ValidateRequest {
  token: string;
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
        message: 'Server configuration error' 
      });
      return;
    }

    // Verify credentials
    if (username === adminUser && password === adminPass) {
      console.log('✅ Admin login successful');
      
      // Generate JWT token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { 
          id: 'admin',
          email: username,
          role: 'admin',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { algorithm: 'HS256' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: 'admin',
          email: username,
          role: 'admin'
        }
      });
    } else {
      console.log('❌ Admin login failed - invalid credentials');
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
      res.status(400).json({
        success: false,
        message: 'Token is required'
      });
      return;
    }

    // Verify JWT token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

    if (decoded && decoded.role === 'admin') {
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
}
