# Smart Gift Finder - Project Structure

Last Updated: February 2026

## Root Directory Structure

```
smart-gift-finder/
├── api/                    # Serverless API routes (Vercel Functions)
│   ├── analytics/          # Analytics endpoints
│   ├── auth/               # Authentication endpoints
│   ├── middleware/         # Middleware (rate limiting)
│   ├── blog.ts             # Blog operations
│   ├── generate-gifts.ts   # AI gift generation
│   ├── setup-analytics.ts  # Analytics setup
│   └── subscribe.ts        # Newsletter subscription
├── public/                 # Static assets
├── src/                    # React application source
├── node_modules/           # Dependencies (ignored)
├── scripts/                # Utility scripts
├── templates/              # Content templates
├── .git/                   # Version control
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite bundler config
├── vercel.json             # Vercel deployment config
└── README.md               # Project documentation
```

## API Directory (/api)
Purpose: Vercel Serverless Functions

| File/Folder | Purpose |
|-------------|---------|
| `api/analytics/beacon.ts` | Analytics beacon endpoint |
| `api/analytics/stats.ts` | Analytics stats endpoint |
| `api/auth/login.ts` | Admin login |
| `api/auth/validate.ts` | Token validation |
| `api/middleware/rateLimit.ts` | Rate limiting logic |
| `api/blog.ts` | Blog CRUD operations |
| `api/generate-gifts.ts` | OpenAI gift generation |
| `api/subscribe.ts` | Email subscription |
| `api/setup-analytics.ts` | Analytics initialization |

## Source Directory (/src)
Purpose: React Application Frontend

| Directory | Content |
|-----------|---------|
| `src/components/` | Reusable UI components |
| `src/components/admin/` | Admin dashboard components |
| `src/components/auth/` | Auth protection components |
| `src/components/blog/` | Blog-specific components |
| `src/components/layout/` | Structural components (Header, Footer) |
| `src/pages/` | Route components (Pages) |
| `src/hooks/` | Custom React hooks |
| `src/services/` | API service wrappers |
| `src/utils/` | Helper functions |
| `src/types/` | TypeScript type definitions |
| `src/styles/` | Global styles |

## File Count Summary
- **Total Files**: ~80+ source files
- **API Routes**: 8 endpoints
- **Pages**: ~20 pages
- **Components**: ~35 components

## Issues Detected

### ⚠️ Duplicate/Conflicting Files
These files appear to be redundant or misplaced versions of other files:
1.  `src/components/Footer.tsx` vs `src/components/layout/Footer.tsx` (Likely older version in root components)
2.  `src/components/BlogPost.tsx` vs `src/components/blog/BlogPost.tsx`
3.  `src/utils/validation.js` vs `src/utils/validation.ts` (Duplicate JS/TS)

### ⚠️ Legacy/Unused Files
Files that appear to be from a previous Express.js setup, not used in the current Vercel Serverless architecture:
1.  `src/server.js`
2.  `src/routes/products.js`
3.  `src/services/productService.js` (Check if used)

### ⚠️ Structure Inconsistencies
1.  `api/blog/` directory vs `api/blog.ts` file. (Confirm if `api/blog/` contains unused routes or is part of the structure).

## Recommended Cleanup Actions

### 1. Delete Legacy Code
Remove the old Express.js server files as the project uses Vercel functions:
- [ ] `src/server.js`
- [ ] `src/routes/` directory

### 2. Consolidate Components
Move/Delete duplicates to ensure a single source of truth:
- [ ] Delete `src/components/Footer.tsx` (Verify `layout/Footer.tsx` is the one used)
- [ ] Delete `src/components/BlogPost.tsx` (Verify `blog/BlogPost.tsx` is the one used)

### 3. Remove JS Duplicates
- [ ] Delete `src/utils/validation.js` (Keep `.ts` version)

## Optimal Folder Structure Recommendation

```
smart-gift-finder/
├── api/
│   ├── auth/
│   ├── blog/              # Move blog.ts logic here if complex, or keep as single file
│   └── ...
├── src/
│   ├── components/
│   │   ├── common/        # Generic UI (Button, Input) - currently mixed in components/
│   │   ├── layout/        # Header, Footer
│   │   ├── features/      # Feature-specific components (e.g., GiftFinder)
│   │   └── ...
│   ├── pages/
│   ├── services/
│   └── ...
└── ...
```
