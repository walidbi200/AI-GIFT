# Monitoring & Analytics Guide

## Rate Limiting

### Current Limits
- **Gift Generation**: 10 requests per minute per IP
- **Authentication**: 5 attempts per minute per IP
- **General API**: 30 requests per minute per IP

### Rate Limit Headers
Every API response includes:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: When the limit resets (ISO timestamp)

### When Rate Limited
- HTTP Status: 429 Too Many Requests
- Response includes `retryAfter` timestamp
- Frontend should display user-friendly message

## Analytics Events

### Tracked Events
1. **gift_search_started**: User begins gift search
2. **gift_search_completed**: Search returns results
3. **gift_search_failed**: Search encounters error
4. **affiliate_link_clicked**: User clicks gift link
5. **email_signup_started**: User begins signup
6. **email_signup_completed**: Signup successful
7. **page_view**: Page navigation
8. **error_occurred**: Any error in application

### Viewing Analytics
- Google Analytics 4 Dashboard
- Vercel Analytics (if enabled)
- Custom admin dashboard (future)

## Monitoring Endpoints

### `/api/cache-stats` (Public)
Returns cache performance metrics

### `/api/admin/metrics` (Admin Only)
Requires JWT authentication
Returns comprehensive system metrics

## Cost Monitoring

### OpenAI Usage
1. Visit https://platform.openai.com/usage
2. Set billing alert at $50/month
3. Monitor daily spend
4. Expected: $18-30/month with caching

### Upstash Usage
1. Visit Upstash dashboard
2. Monitor Redis operations
3. Free tier: 10,000 commands/day
4. Expected: Well within free tier
