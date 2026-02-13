import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

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
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!redis) {
            return res.status(200).json({
                enabled: false,
                message: 'Redis caching not configured',
            });
        }

        // Get all cache keys matching the gift pattern
        const keys = await redis.keys('gifts:v1:*');

        // Calculate estimated savings
        // Each cached query saves $0.002 per request
        // Assume average 30 days per month
        const estimatedDailySavings = keys.length * 0.002;
        const estimatedMonthlySavings = estimatedDailySavings * 30;

        return res.status(200).json({
            enabled: true,
            totalCachedQueries: keys.length,
            sampleCacheKeys: keys.slice(0, 10), // Show first 10 keys as examples
            estimatedMonthlySavings: `$${estimatedMonthlySavings.toFixed(2)}`,
            estimatedDailySavings: `$${estimatedDailySavings.toFixed(2)}`,
            cacheDuration: '7 days',
            note: 'Each cached query saves $0.002 per request. Actual savings depend on cache hit rate.',
        });
    } catch (error) {
        console.error('[CACHE STATS ERROR]', error);
        return res.status(500).json({
            error: 'Failed to fetch cache statistics',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
