import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

import { checkRateLimit, authRateLimit } from '../middleware/rateLimit';

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

  // Check rate limit
  const rateLimitPassed = await checkRateLimit(req, res, authRateLimit);
  if (!rateLimitPassed) {
    return;
  }

  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    // Check environment variables are configured
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH || !process.env.JWT_SECRET) {
      console.error('Missing required environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Check username
    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password using bcrypt - secure hash comparison
    const isPasswordValid = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token with 24h expiration
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      username,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000)
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .setIssuedAt()
      .sign(secret);

    console.log('Login successful for user:', username);

    return res.status(200).json({
      success: true,
      token,
      expiresIn: 86400 // 24 hours in seconds
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
