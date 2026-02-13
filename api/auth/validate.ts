import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jwtVerify } from 'jose';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle OPTIONS first (before POST check)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Now check for POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify JWT token with signature validation
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Verify admin role
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    return res.status(200).json({
      valid: true,
      username: payload.username
    });

  } catch (error: any) {
    console.error('Token validation error:', error);

    // Distinguish between expired and invalid tokens
    if (error.code === 'ERR_JWT_EXPIRED' || error.message?.includes('exp')) {
      return res.status(401).json({ error: 'Token expired' });
    }

    return res.status(401).json({ error: 'Invalid token' });
  }
}
