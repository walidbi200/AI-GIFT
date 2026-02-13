import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jwtVerify } from 'jose';
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify admin authentication
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.substring(7);
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);

        // Gather metrics
        // Use proper error handling for Redis calls
        let cacheKeys: string[] = [];
        let rateLimitKeys: string[] = [];
        try {
            cacheKeys = await redis.keys('gifts:v1:*');
            rateLimitKeys = await redis.keys('ratelimit:*');
        } catch (e) {
            console.error("Failed to fetch keys from Redis:", e);
            // Continue with empty lists or handle gracefully
        }

        const metrics = {
            cache: {
                totalCachedQueries: cacheKeys.length,
                estimatedMonthlySavings: `$${(cacheKeys.length * 0.002 * 30).toFixed(2)}`,
            },
            rateLimit: {
                totalRateLimitEntries: rateLimitKeys.length,
                note: 'Entries expire after window period',
            },
            timestamp: new Date().toISOString(),
        };

        return res.status(200).json(metrics);

    } catch (error) {
        console.error('Metrics error:', error);
        return res.status(500).json({ error: 'Failed to fetch metrics' });
    }
}
