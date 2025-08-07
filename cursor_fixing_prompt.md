# Website Bug Fixes - Step-by-Step Implementation Plan for Cursor

## 🎯 CONTEXT
You are fixing a React/TypeScript/Vite website with OpenAI integration. The main issues are:
1. Gift generator images don't show + need better UI without images
2. AI blog generation appears to work but produces no output
3. OpenAI API shows "never used" despite apparent activity
4. Various production blockers from the audit

## 🚨 CRITICAL BUG FIXES - IMPLEMENT IN THIS ORDER

### STEP 1: Fix Gift Generator API Data Mismatch
**Problem**: Runtime error in gift suggestions due to API/client data structure mismatch
**Location**: `src/services/GiftService.js` or similar
**Action**: 
```typescript
// FIND this code pattern:
const data: ApiResponse = await response.json();
return data.suggestions;

// REPLACE with:
const suggestions = await response.json();
return suggestions;
```
**Verification**: Test gift generator end-to-end, check browser console for errors

### STEP 2: Fix Google Analytics Environment Variable
**Problem**: Using Node.js syntax in Vite app
**Location**: `src/hooks/useGoogleAnalytics.ts`
**Action**:
```typescript
// FIND all instances of:
process.env.VITE_GA_TRACKING_ID

// REPLACE with:
import.meta.env.VITE_GA_TRACKING_ID || 'G-XXXXXXXXXX'
```
**Verification**: Check GA Real-time reports for events

### STEP 3: Remove Gift Images & Redesign Gift Display
**Problem**: Images don't load + CSP blocks external images
**Location**: Gift result components (likely in components folder)
**Action**:
1. **Find gift display component** (search for image rendering in gift results)
2. **Remove all image-related code**:
   - Remove `<img>` tags
   - Remove image URLs from API responses
   - Remove image-related CSS/styling
3. **Replace with better visual design**:
```tsx
// REPLACE image-based gift cards with:
<div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        <span className="text-sm font-medium text-gray-500">GIFT IDEA</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{gift.name}</h3>
      <p className="text-gray-600 mb-4">{gift.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-green-600">{gift.priceRange}</span>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Find on Amazon
        </button>
      </div>
    </div>
  </div>
</div>
```

### STEP 4: Debug AI Blog Generation API
**Problem**: Blog generation shows loading but produces no output, API shows "never used"
**Location**: Look for `api/generate-blog.ts` or similar blog generation API endpoint
**Action**:
1. **Find the blog generation API endpoint** (search for "blog" in api folder)
2. **Add comprehensive debugging**:
```typescript
export default async function handler(req, res) {
  console.log('🔥 Blog API called with method:', req.method);
  console.log('🔥 Request body:', JSON.stringify(req.body, null, 2));
  console.log('🔥 OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);
  
  try {
    if (req.method !== 'POST') {
      console.log('❌ Wrong method');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ No API key');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const { topic, tone, length } = req.body;
    console.log('🔥 Extracted params:', { topic, tone, length });

    // Add the actual OpenAI call with logging
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional blog writer. Generate a complete blog post with title, content, and meta description.'
          },
          {
            role: 'user',
            content: `Write a ${length} blog post about "${topic}" in a ${tone} tone. Return JSON with: title, content (HTML), metaDescription, tags (array).`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    console.log('🔥 OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.log('❌ OpenAI error:', errorData);
      return res.status(500).json({ error: 'OpenAI API error', details: errorData });
    }

    const data = await response.json();
    console.log('🔥 OpenAI response:', JSON.stringify(data, null, 2));

    const blogContent = JSON.parse(data.choices[0].message.content);
    console.log('🔥 Parsed blog content:', blogContent);

    res.status(200).json(blogContent);
  } catch (error) {
    console.error('💥 Blog generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate blog post',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
```

### STEP 5: Debug Blog Generation Frontend
**Problem**: Frontend shows loading but doesn't display results
**Location**: Find blog generation component/page
**Action**:
1. **Find blog generation component** (search for "generate blog" or "blog generation")
2. **Add debugging to the frontend**:
```typescript
const generateBlog = async (formData) => {
  console.log('🔥 Frontend: Starting blog generation with:', formData);
  setIsLoading(true);
  setError(null);
  
  try {
    const response = await fetch('/api/generate-blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    console.log('🔥 Frontend: API response status:', response.status);
    console.log('🔥 Frontend: API response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Frontend: API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('🔥 Frontend: Received blog data:', result);
    
    setBlogPost(result);
    setActiveTab('preview'); // Make sure this switches to preview tab
  } catch (error) {
    console.error('💥 Frontend: Blog generation failed:', error);
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};
```

### STEP 6: Fix Content Security Policy
**Problem**: CSP blocking external resources and API calls
**Location**: `vercel.json` or similar config
**Action**:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; connect-src 'self' https://api.openai.com https://region1.google-analytics.com https://www.google-analytics.com https://analytics.google.com; img-src 'self' data: https:;"
        }
      ]
    }
  ]
}
```

## 🧪 TESTING & VERIFICATION STEPS

### After Each Fix:
1. **Check browser console** for errors (F12 → Console)
2. **Check Network tab** for failed requests
3. **Check Vercel function logs** (if deployed) or terminal output (if local)
4. **Test the actual functionality** end-to-end

### Specific Tests:
- **Gift Generator**: Generate gifts and verify results display without images
- **Blog Generator**: Create a blog post and verify it appears in preview
- **OpenAI Usage**: Check OpenAI dashboard for API usage after tests

## 🔍 DEBUGGING CHECKLIST

### Environment Variables:
```bash
# Verify these exist in your .env file:
OPENAI_API_KEY=sk-...
VITE_GA_TRACKING_ID=G-...

# In Vercel dashboard, verify these are set in Environment Variables
```

### API Endpoints:
- [ ] `/api/generate-gifts` exists and works
- [ ] `/api/generate-blog` exists and works  
- [ ] Both APIs have proper error handling
- [ ] Both APIs use correct OpenAI model names

### Frontend State Management:
- [ ] Loading states work correctly
- [ ] Error states display properly
- [ ] Success states update UI correctly
- [ ] Tab switching works in blog generator

## 🚀 DEPLOYMENT NOTES

### Before Deploying:
1. Remove all `console.log` statements added for debugging
2. Test in production environment
3. Monitor Vercel function logs for any runtime errors
4. Check OpenAI usage dashboard to confirm API calls are working

### After Deploying:
1. Test all functionality in production
2. Monitor error rates in Vercel dashboard
3. Check GA Real-time reports for tracking
4. Verify CSP isn't blocking any required resources

---

**🎯 PRIORITY ORDER**: Fix Step 1 first (critical runtime error), then Steps 2-3 (user-facing issues), then Steps 4-6 (blog generation debugging).

**⏱️ ESTIMATED TIME**: 2-4 hours total, with most time spent debugging the blog generation API issue.

**🔧 TOOLS NEEDED**: 
- Browser dev tools for debugging
- Vercel dashboard for function logs
- OpenAI dashboard for usage monitoring