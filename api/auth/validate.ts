import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  if (req.method !== 'POST') {
    res.status(405).json({ valid: false, message: 'Method not allowed' });
    return;
  }

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
