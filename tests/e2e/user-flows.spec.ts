import { test, expect } from '@playwright/test';

test.describe('Gift Finder User Flow', () => {
  test('should search and find gifts', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify page title
    await expect(page).toHaveTitle(/Smart Gift Finder/);
    
    // Fill search form
    await page.fill('[data-testid="recipient-input"]', 'John Doe');
    await page.selectOption('[data-testid="occasion-select"]', 'birthday');
    await page.fill('[data-testid="budget-input"]', '100');
    await page.click('[data-testid="tech-preference"]');
    
    // Submit form
    await page.click('[data-testid="search-button"]');
    
    // Wait for results
    await page.waitForSelector('[data-testid="gift-results"]', { timeout: 10000 });
    
    // Verify results are displayed
    const results = await page.locator('[data-testid="gift-card"]');
    await expect(results).toHaveCount.greaterThan(0);
    
    // Verify first result has required elements
    const firstResult = results.first();
    await expect(firstResult.locator('[data-testid="gift-name"]')).toBeVisible();
    await expect(firstResult.locator('[data-testid="gift-description"]')).toBeVisible();
    await expect(firstResult.locator('[data-testid="gift-price"]')).toBeVisible();
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Fill form with very specific criteria that might not have results
    await page.fill('[data-testid="recipient-input"]', 'Very Specific Person');
    await page.selectOption('[data-testid="occasion-select"]', 'other');
    await page.fill('[data-testid="budget-input"]', '5');
    
    await page.click('[data-testid="search-button"]');
    
    // Should show no results message
    await page.waitForSelector('[data-testid="no-results"]', { timeout: 10000 });
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/');
    
    // Try to submit without filling required fields
    await page.click('[data-testid="search-button"]');
    
    // Should show validation errors
    await expect(page.locator('[data-testid="recipient-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="budget-error"]')).toBeVisible();
  });

  test('should filter results by preferences', async ({ page }) => {
    await page.goto('/');
    
    // Fill basic form
    await page.fill('[data-testid="recipient-input"]', 'Tech Enthusiast');
    await page.selectOption('[data-testid="occasion-select"]', 'christmas');
    await page.fill('[data-testid="budget-input"]', '200');
    
    // Select tech preference
    await page.click('[data-testid="tech-preference"]');
    
    await page.click('[data-testid="search-button"]');
    
    await page.waitForSelector('[data-testid="gift-results"]');
    
    // Verify results are tech-focused
    const results = await page.locator('[data-testid="gift-card"]');
    const techResults = await results.filter({ hasText: /tech|gadget|electronic/i });
    await expect(techResults).toHaveCount.greaterThan(0);
  });
});

test.describe('Blog Functionality', () => {
  test('should display blog posts', async ({ page }) => {
    await page.goto('/blog');
    
    // Wait for blog posts to load
    await page.waitForSelector('[data-testid="blog-post"]', { timeout: 10000 });
    
    // Verify blog posts are displayed
    const posts = await page.locator('[data-testid="blog-post"]');
    await expect(posts).toHaveCount.greaterThan(0);
    
    // Verify post structure
    const firstPost = posts.first();
    await expect(firstPost.locator('[data-testid="blog-title"]')).toBeVisible();
    await expect(firstPost.locator('[data-testid="blog-description"]')).toBeVisible();
    await expect(firstPost.locator('[data-testid="blog-date"]')).toBeVisible();
  });

  test('should navigate to individual blog post', async ({ page }) => {
    await page.goto('/blog');
    
    await page.waitForSelector('[data-testid="blog-post"]');
    
    // Click on first blog post
    const firstPost = page.locator('[data-testid="blog-post"]').first();
    const postTitle = await firstPost.locator('[data-testid="blog-title"]').textContent();
    
    await firstPost.click();
    
    // Should navigate to blog post page
    await page.waitForURL(/\/blog\/.+/);
    
    // Verify post content is displayed
    await expect(page.locator('[data-testid="blog-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="blog-title"]')).toContainText(postTitle || '');
  });

  test('should search blog posts', async ({ page }) => {
    await page.goto('/blog');
    
    // Wait for search input to be available
    await page.waitForSelector('[data-testid="blog-search"]');
    
    // Search for a specific term
    await page.fill('[data-testid="blog-search"]', 'gift');
    await page.keyboard.press('Enter');
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Verify search results
    const results = await page.locator('[data-testid="blog-post"]');
    await expect(results).toHaveCount.greaterThan(0);
  });
});

test.describe('Admin Dashboard', () => {
  test('should require authentication for admin access', async ({ page }) => {
    await page.goto('/admin');
    
    // Should redirect to login or show unauthorized message
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('should allow admin login with valid credentials', async ({ page }) => {
    await page.goto('/admin');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'adminpassword');
    await page.click('[data-testid="login-button"]');
    
    // Should navigate to admin dashboard
    await page.waitForURL('/admin/dashboard');
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
  });

  test('should generate blog post with AI', async ({ page }) => {
    // Login first
    await page.goto('/admin');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'adminpassword');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL('/admin/dashboard');
    
    // Navigate to blog generator
    await page.click('[data-testid="blog-generator-link"]');
    
    // Fill blog generation form
    await page.fill('[data-testid="topic-input"]', 'Best Tech Gifts for 2024');
    await page.selectOption('[data-testid="tone-select"]', 'friendly');
    await page.selectOption('[data-testid="length-select"]', 'medium');
    await page.fill('[data-testid="keyword-input"]', 'tech gifts');
    
    // Generate blog post
    await page.click('[data-testid="generate-button"]');
    
    // Wait for generation to complete
    await page.waitForSelector('[data-testid="generated-content"]', { timeout: 30000 });
    
    // Verify generated content
    await expect(page.locator('[data-testid="generated-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="generated-content"]')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Verify mobile menu is accessible
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Verify form is usable on mobile
    await page.fill('[data-testid="recipient-input"]', 'Mobile User');
    await page.selectOption('[data-testid="occasion-select"]', 'birthday');
    await page.fill('[data-testid="budget-input"]', '50');
    
    await page.click('[data-testid="search-button"]');
    
    // Wait for results
    await page.waitForSelector('[data-testid="gift-results"]', { timeout: 10000 });
    await expect(page.locator('[data-testid="gift-card"]')).toHaveCount.greaterThan(0);
  });

  test('should work on tablet devices', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    
    // Verify layout is appropriate for tablet
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    
    // Test form functionality
    await page.fill('[data-testid="recipient-input"]', 'Tablet User');
    await page.selectOption('[data-testid="occasion-select"]', 'christmas');
    await page.fill('[data-testid="budget-input"]', '150');
    
    await page.click('[data-testid="search-button"]');
    
    await page.waitForSelector('[data-testid="gift-results"]');
    await expect(page.locator('[data-testid="gift-card"]')).toHaveCount.greaterThan(0);
  });
});

test.describe('Performance and Accessibility', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have proper accessibility features', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6');
    await expect(headings).toHaveCount.greaterThan(0);
    
    // Check for alt text on images
    const images = await page.locator('img');
    for (let i = 0; i < await images.count(); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Check for proper form labels
    const inputs = await page.locator('input, select, textarea');
    for (let i = 0; i < await inputs.count(); i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = await page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate using keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to fill form with keyboard
    await page.keyboard.type('Keyboard User');
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.type('100');
    
    // Submit with Enter key
    await page.keyboard.press('Enter');
    
    // Wait for results
    await page.waitForSelector('[data-testid="gift-results"]', { timeout: 10000 });
    await expect(page.locator('[data-testid="gift-card"]')).toHaveCount.greaterThan(0);
  });
});
