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

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

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
