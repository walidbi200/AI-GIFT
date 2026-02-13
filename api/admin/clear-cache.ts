import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { jwtVerify } from 'jose';

// Initialize Redis
let redis: Redis | null = null;
try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }
} catch (error) {
    console.error('[REDIS INIT ERROR]', error);
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify admin authentication
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized - Bearer token required' });
        }

        const token = authHeader.substring(7);

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden - Admin access required' });
        }

        // Check if Redis is configured
        if (!redis) {
            return res.status(503).json({
                error: 'Redis not configured',
                message: 'Caching is not enabled on this instance'
            });
        }

        // Clear all gift caches
        const keys = await redis.keys('gifts:v1:*');

        let keysDeleted = 0;
        if (keys.length > 0) {
            await redis.del(...keys);
            keysDeleted = keys.length;
        }

        console.log(`[CACHE CLEARED] Admin ${payload.username} deleted ${keysDeleted} cache keys`);

        return res.status(200).json({
            success: true,
            message: 'Cache cleared successfully',
            keysDeleted,
            clearedBy: payload.username,
            timestamp: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('[CLEAR CACHE ERROR]', error);

        if (error.code === 'ERR_JWT_EXPIRED' || error.message?.includes('exp')) {
            return res.status(401).json({ error: 'Token expired' });
        }

        return res.status(500).json({
            error: 'Failed to clear cache',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
