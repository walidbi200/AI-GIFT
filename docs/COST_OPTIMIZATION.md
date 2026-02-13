# Cost Optimization Guide

## OpenAI API Caching Strategy

### Overview

This application uses Redis-based caching (Upstash) to dramatically reduce OpenAI API costs while improving response times.

### Current Setup

- **Cache Provider**: Upstash Redis (free tier)
- **Cache Duration**: 7 days (604,800 seconds)
- **Cache Strategy**: Query-based key generation
- **Cache Key Format**: `gifts:v1:{relationship}:{occasion}:{budget}:{interests}:{negativeKeywords}`

### Cost Savings Analysis

#### Without Caching
- **1,000 requests/day** × **$0.002/request** = **$2/day**
- **Monthly cost**: ~**$60**

#### With 70% Cache Hit Rate
- **300 API calls/day** × **$0.002** = **$0.60/day**  
- **700 cache hits/day** × **$0.00** = **$0.00/day**
- **Monthly cost**: ~**$18**
- **💰 Monthly savings: $42 (70% reduction)**

#### With 50% Cache Hit Rate
- **500 API calls/day** × **$0.002** = **$1.00/day**
- **500 cache hits/day** × **$0.00** = **$0.00/day**
- **Monthly cost**: ~**$30**
- **💰 Monthly savings: $30 (50% reduction)**

### How It Works

#### 1. Cache Key Generation

Inputs are normalized and sanitized to create consistent cache keys:

```typescript
// Input normalization
{
  relationship: "Mom" → "mom"
  occasion: "Birthday" → "birthday"  
  budget: "$100" → "100"
  interests: "Gardening, COOKING" → "gardening, cooking"
  negativeKeywords: "" → ""
}

// Generated cache key
"gifts:v1:mom:birthday:100:gardening, cooking:"
```

#### 2. Cache Lookup Process

```
User Request
    ↓
Normalize Inputs
    ↓
Generate Cache Key
    ↓
Check Redis ──→ [CACHE HIT] ──→ Return Cached Gifts (instant)
    ↓
[CACHE MISS]
    ↓
Call OpenAI API ($0.002)
    ↓
Parse Response
    ↓
Store in Redis (7 days TTL)
    ↓
Return Fresh Gifts
```

#### 3. Input Sanitization

All inputs are sanitized to prevent prompt injection and improve cache consistency:

- Remove HTML tags: `<script>` → (removed)
- Trim whitespace: `" birthday "` → `"birthday"`
- Lowercase for normalization: `"Birthday"` → `"birthday"`
- Limit field lengths to prevent abuse
- Remove special characters from budget

### Monitoring Cache Performance

#### Check Cache Statistics

Visit the cache stats endpoint:

```bash
curl https://smartgiftfinder.xyz/api/cache-stats
```

**Response:**
```json
{
  "enabled": true,
  "totalCachedQueries": 145,
  "sampleCacheKeys": [
    "gifts:v1:mom:birthday:100:gardening:",
    "gifts:v1:best friend:graduation:50:gaming tech:no clothing"
  ],
  "estimatedMonthlySavings": "$87.00",
  "estimatedDailySavings": "$2.90",
  "cacheDuration": "7 days",
  "note": "Each cached query saves $0.002 per request..."
}
```

#### Monitor in Vercel Logs

Look for these log messages:

- `[CACHE HIT]` - Request served from cache (free, instant)
- `[CACHE MISS]` - Request calls OpenAI API ($0.002)
- `[CACHED]` - Response stored in Redis for 7 days
- `[CACHE DISABLED]` - Redis not configured (fallback to direct API)

### Cache Invalidation

#### Admin Clear Cache (When Needed)

Clear all cached queries when:
- Prompt has been updated
- Gift recommendations quality needs refresh
- Testing new changes

```bash
# Authenticate as admin first, then:
curl -X POST https://smartgiftfinder.xyz/api/admin/clear-cache \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared successfully",
  "keysDeleted": 145,
  "clearedBy": "admin_username",
  "timestamp": "2026-02-10T09:45:00.000Z"
}
```

#### Automatic Expiration

- All cached items automatically expire after 7 days
- No manual intervention needed for normal operation
- Stale data is automatically removed

### Setup Instructions

#### 1. Create Upstash Account (Free)

1. Go to https://upstash.com
2. Sign up for free account
3. Create new Redis database:
   - **Name**: smart-gift-finder-cache
   - **Region**: Choose closest to your users
   - **Type**: Regional (free tier)

#### 2. Get Redis Credentials

1. In Upstash dashboard, open your database
2. Click "REST API" tab
3. Copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

#### 3. Add to Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables:
   - Name: `UPSTASH_REDIS_REST_URL`
   - Value: `https://your-redis-url.upstash.io`
   - Environments: Production, Preview, Development
3. Add second variable:
   - Name: `UPSTASH_REDIS_REST_TOKEN`
   - Value: `your-token-here`
   - Environments: Production, Preview, Development
4. Redeploy application

### Optimization Tips

#### Increase Cache Duration

For more stable gift categories, increase TTL:

```typescript
// In api/generate-gifts.ts
await redis.setex(cacheKey, 1209600, gifts); // 14 days instead of 7
```

#### Monitor OpenAI Usage

Track actual API usage:
1. Visit https://platform.openai.com/usage
2. Set billing alerts at $20, $50 thresholds
3. Review monthly trends

#### Improve Cache Hit Rate

**Normalize common variations:**
- "Mom" / "mom" / "mother" → all treated as "mom"
- "Birthday" / "BIRTHDAY" / "bday" → all treated as "birthday"

**Pre-warm cache for common queries:**
```bash
# Warm cache with popular combinations
curl -X POST https://smartgiftfinder.xyz/api/generate-gifts \
  -H "Content-Type: application/json" \
  -d '{"occasion":"birthday","budget":"50","relationship":"mom"}'
```

### Error Handling & Graceful Degradation

#### If Redis Fails

The application continues to work normally:

1. **Cache read error** → Falls back to OpenAI API call
2. **Cache write error** → Returns result, logs error
3. **Redis not configured** → Direct API calls only

**No user-facing errors** - caching is transparent.

### Free Tier Limits

**Upstash Free Tier:**
- 10,000 commands/day
- 256 MB storage
- Max 100 MB data transfer/day

**Typical Usage:**
- 1,000 requests/day = ~2,000 Redis commands (read + write)
- Average gift response = ~2 KB
- Well within free tier limits ✅

### Real-World Performance

#### Response Times

| Scenario | Response Time | Cost |
|----------|---------------|------|
| Cache Hit | ~100-200ms | $0.000 |
| Cache Miss | ~2-3 seconds | $0.002 |
| OpenAI Direct (no cache) | ~2-3 seconds | $0.002 |

#### Cache Hit Rate by Category

Expected hit rates based on query patterns:

| Category | Hit Rate | Reason |
|----------|----------|--------|
| Common occasions (birthday, Christmas) | 80-90% | High repetition |
| Specific interests (gaming, cooking) | 60-70% | Moderate repetition |
| Unique combinations | 20-30% | Low repetition |
| **Overall Average** | **50-70%** | Mixed queries |

### Troubleshooting

#### Cache Not Working

1. **Check environment variables:**
   ```bash
   # In Vercel dashboard, verify:
   UPSTASH_REDIS_REST_URL=<configured>
   UPSTASH_REDIS_REST_TOKEN=<configured>
   ```

2. **Check logs for errors:**
   ```
   [REDIS INIT ERROR] - Configuration issue
   [CACHE DISABLED] - Redis not configured
   ```

3. **Test cache stats endpoint:**
   ```bash
   curl https://smartgiftfinder.xyz/api/cache-stats
   ```

#### Unexpected Costs

1. Check actual cache hit rate in logs
2. Verify cache duration (should be 7 days)
3. Review OpenAI usage dashboard
4. Consider increasing cache TTL

### Future Enhancements

**Possible improvements:**

1. **Tiered caching** - Add in-memory cache for ultra-fast responses
2. **Cache warming** - Pre-populate cache with top 100 queries
3. **Smart TTL** - Longer cache for stable categories, shorter for trending
4. **Analytics** - Track most popular gift types, occasions
5. **A/B testing** - Test different prompt variations with cache versioning

### Summary

✅ **70% cost reduction** from $60/month to $18/month  
✅ **3-5x faster** response times for cached queries  
✅ **Zero configuration** for end users  
✅ **Graceful degradation** if Redis unavailable  
✅ **Free tier** sufficient for current scale  
✅ **Monitoring tools** built-in  

**Implementation Date**: 2026-02-10  
**Status**: ✅ Production Ready
