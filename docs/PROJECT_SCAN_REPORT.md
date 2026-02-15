# Project Structure Scan & Cleanup Report

**Date:** February 15, 2026
**Purpose:** Comprehensive scan of all folders to identify old, unused, cache, and problematic files.

---

## 🚀 Priority Issues & Recommendations

### 1. 🗑️ Cache & Temporary Files (Safe to Delete)
These folders contain auto-generated cache or build artifacts that can be safely removed to free up space.
- [ ] `.contentlayer/.cache/` (Contentlayer cache)
- [ ] `dist/` (Build output - will be regenerated on build)
- [ ] `node_modules/.vite-temp/` (Vite temp files)

### 2. ⚠️ Old & Backup Files (Review & Delete)
Files seemingly created as backups or placeholders that are likely no longer needed.
- [ ] `public/admin-backup.html` (Last modified: Aug 2025)
- [ ] `dist/admin-backup.html`
- [ ] `src/server.js` (Legacy Express server - verified unused in Vercel setup)
- [ ] `src/utils/validation.js` (Duplicate of `validation.ts`)

### 3. 🧩 Duplicate Components (Consolidate)
Found multiple versions of the same components.
- **Footer**:
  - `src/components/Footer.tsx` (Old version?)
  - `src/components/layout/Footer.tsx` (Newer version?)
  *Recommendation: Verify usage and keep only one (likely `layout/Footer.tsx`).*
- **BlogPost**:
  - `src/components/BlogPost.tsx`
  - `src/components/blog/BlogPost.tsx`
  *Recommendation: Consolidate to `src/components/blog/BlogPost.tsx`.*

---

## 📂 Detailed Folder Scan

### 📁 Root Directory
*Core configuration and entry points.*
- `package.json`: Dependencies & scripts (Active)
- `tsconfig.json`: TypeScript config (Active)
- `vite.config.ts`: Build config (Active)
- `vercel.json`: Deployment config (Active)
- `README.md`: Documentation (Active)
- `.gitignore`: Git ignore rules (Active)

### 📁 api/ (Backend Functions)
*Vercel Serverless Functions.*
- `api/blog.ts`: Blog operations
- `api/generate-gifts.ts`: AI generation
- `api/subscribe.ts`: Newsletter
- **Subfolders**:
  - `api/auth/`: Login & Validation
  - `api/middleware/`: Rate limiting
  - `api/analytics/`: Tracking (beacon.ts, stats.ts)

### 📁 src/ (Frontend Source)
*Main application code.*

#### `src/components/` (UI Components)
*Mixed collection of components. Recommendation: Organize into subfolders.*
- **General**: `Button.tsx`, `Toast.tsx`, `LoadingSpinner.tsx`
- **Features**: `GiftCard.tsx`, `GiftFinderForm.tsx`
- **Likely Duplicates**: `Footer.tsx` (check layout/), `BlogPost.tsx` (check blog/)

#### `src/components/admin/`
*Admin dashboard specific.*
- `AdminDashboard.tsx`, `BlogEditor.tsx`, `BlogList.tsx`

#### `src/components/layout/`
*Global layout elements.*
- `Header.tsx`, `Footer.tsx` (Preferred location)

#### `src/pages/` (Routes)
*Application pages.*
- `Home.tsx`, `About.tsx`, `Contact.tsx`
- **Gift Pages**: `GiftsForMom.tsx`, `GiftsForDad.tsx`, etc.
- **Blog Pages**: `BlogIndex.tsx`, `BlogPostPage.tsx`
- **Admin**: `AdminSimple.tsx`, `Login.tsx`

#### `src/hooks/`
*Custom React Hooks.*
- `useAuth.ts`, `useScrollDepth.ts`, `useTimeOnPage.ts`

#### `src/services/`
*API Integration.*
- `giftService.ts`, `analytics.ts`
- **Legacy**: `productService.js` (Review for deletion)

#### `src/utils/`
*Helpers.*
- `validation.ts` (Keep)
- `validation.js` (Delete - Duplicate)

### 📁 public/ (Static Assets)
*Served directly to browser.*
- `images/`: Blog images, placeholders
- `sitemap.xml`, `robots.txt`: SEO
- `manifest.json`: PWA config
- **Trash**: `admin-backup.html`

### 📁 docs/ (Documentation)
*Project guides.*
- `PROJECT_STRUCTURE.md`
- `SEO_STRATEGY.md`
- `MONITORING.md`

---

## 🛠️ Cleanup Plan

Run the following commands to clean up the project:

```bash
# 1. Remove cache and temp folders
rm -rf .contentlayer
rm -rf dist

# 2. Remove legacy/backup files
rm public/admin-backup.html
rm src/server.js
rm src/utils/validation.js
rm src/services/productService.js

# 3. Remove verified duplicates (After checking imports)
# rm src/components/Footer.tsx
# rm src/components/BlogPost.tsx
```
