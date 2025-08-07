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
  res: VercelResponse<LoginResponse>
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

    if (username === adminUser && password === adminPass) {
      // Generate a simple session token (in production, use JWT)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
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
