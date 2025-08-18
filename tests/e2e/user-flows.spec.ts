import { test, expect } from '@playwright/test';

test.describe('Smart Gift Finder User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
  });

  test.describe('Gift Finder Flow', () => {
    test('should search and find gifts', async ({ page }) => {
      // Navigate to homepage
      await expect(page).toHaveTitle(/Smart Gift Finder/);
      
      // Fill search form
      await page.fill('[data-testid="recipient-input"]', 'John');
      await page.selectOption('[data-testid="occasion-select"]', 'birthday');
      await page.fill('[data-testid="budget-input"]', '100');
      await page.click('[data-testid="search-button"]');
      
      // Wait for results
      await page.waitForSelector('[data-testid="gift-results"]');
      
      // Verify results are displayed
      const results = await page.locator('[data-testid="gift-card"]');
      await expect(results).toHaveCount(3); // Should show 3 gift suggestions
      
      // Verify gift cards have required information
      const firstGift = results.first();
      await expect(firstGift.locator('[data-testid="gift-title"]')).toBeVisible();
      await expect(firstGift.locator('[data-testid="gift-price"]')).toBeVisible();
      await expect(firstGift.locator('[data-testid="gift-reason"]')).toBeVisible();
    });

    test('should handle empty search results', async ({ page }) => {
      // Fill form with very specific criteria that might not have results
      await page.fill('[data-testid="recipient-input"]', 'Very Specific Person');
      await page.selectOption('[data-testid="occasion-select"]', 'other');
      await page.fill('[data-testid="budget-input"]', '5');
      await page.click('[data-testid="search-button"]');
      
      // Wait for no results message
      await page.waitForSelector('[data-testid="no-results"]');
      await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
    });

    test('should validate form inputs', async ({ page }) => {
      // Try to submit empty form
      await page.click('[data-testid="search-button"]');
      
      // Should show validation errors
      await expect(page.locator('[data-testid="recipient-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="budget-error"]')).toBeVisible();
    });

    test('should filter gifts by budget', async ({ page }) => {
      // Search with low budget
      await page.fill('[data-testid="recipient-input"]', 'Friend');
      await page.selectOption('[data-testid="occasion-select"]', 'birthday');
      await page.fill('[data-testid="budget-input"]', '25');
      await page.click('[data-testid="search-button"]');
      
      await page.waitForSelector('[data-testid="gift-results"]');
      
      // All gifts should be within budget
      const prices = await page.locator('[data-testid="gift-price"]').allTextContents();
      for (const price of prices) {
        const numericPrice = parseInt(price.replace(/[^0-9]/g, ''));
        expect(numericPrice).toBeLessThanOrEqual(25);
      }
    });
  });

  test.describe('Blog Reading Flow', () => {
    test('should display blog posts', async ({ page }) => {
      // Navigate to blog page
      await page.click('[data-testid="blog-link"]');
      await page.waitForURL('**/blog');
      
      // Should show blog posts
      await page.waitForSelector('[data-testid="blog-card"]');
      const blogCards = await page.locator('[data-testid="blog-card"]');
      await expect(blogCards).toHaveCount.greaterThan(0);
    });

    test('should read a blog post', async ({ page }) => {
      // Navigate to blog page
      await page.click('[data-testid="blog-link"]');
      await page.waitForURL('**/blog');
      
      // Click on first blog post
      await page.click('[data-testid="blog-card"]:first-child');
      
      // Should navigate to blog post page
      await page.waitForURL('**/blog/**');
      
      // Verify blog post content
      await expect(page.locator('[data-testid="blog-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="blog-content"]')).toBeVisible();
      await expect(page.locator('[data-testid="blog-meta"]')).toBeVisible();
    });

    test('should search blog posts', async ({ page }) => {
      // Navigate to blog page
      await page.click('[data-testid="blog-link"]');
      await page.waitForURL('**/blog');
      
      // Search for a specific term
      await page.fill('[data-testid="blog-search"]', 'gift');
      await page.press('[data-testid="blog-search"]', 'Enter');
      
      // Should show filtered results
      await page.waitForSelector('[data-testid="blog-card"]');
      const results = await page.locator('[data-testid="blog-card"]');
      await expect(results).toHaveCount.greaterThan(0);
    });
  });

  test.describe('Navigation Flow', () => {
    test('should navigate between pages', async ({ page }) => {
      // Test navigation to different pages
      await page.click('[data-testid="home-link"]');
      await expect(page).toHaveURL('/');
      
      await page.click('[data-testid="blog-link"]');
      await expect(page).toHaveURL(/.*\/blog/);
      
      await page.click('[data-testid="about-link"]');
      await expect(page).toHaveURL(/.*\/about/);
      
      await page.click('[data-testid="contact-link"]');
      await expect(page).toHaveURL(/.*\/contact/);
    });

    test('should have responsive navigation', async ({ page }) => {
      // Test mobile navigation
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Mobile menu should be hidden initially
      await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
      
      // Click hamburger menu
      await page.click('[data-testid="mobile-menu-button"]');
      
      // Mobile menu should be visible
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Click on a menu item
      await page.click('[data-testid="mobile-menu"] [data-testid="blog-link"]');
      await expect(page).toHaveURL(/.*\/blog/);
      
      // Menu should close after navigation
      await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
    });
  });

  test.describe('Contact Form Flow', () => {
    test('should submit contact form', async ({ page }) => {
      // Navigate to contact page
      await page.click('[data-testid="contact-link"]');
      await page.waitForURL('**/contact');
      
      // Fill contact form
      await page.fill('[data-testid="contact-name"]', 'Test User');
      await page.fill('[data-testid="contact-email"]', 'test@example.com');
      await page.fill('[data-testid="contact-subject"]', 'Test Subject');
      await page.fill('[data-testid="contact-message"]', 'This is a test message with enough characters to meet the minimum requirement.');
      
      // Submit form
      await page.click('[data-testid="contact-submit"]');
      
      // Should show success message
      await page.waitForSelector('[data-testid="contact-success"]');
      await expect(page.locator('[data-testid="contact-success"]')).toBeVisible();
    });

    test('should validate contact form', async ({ page }) => {
      // Navigate to contact page
      await page.click('[data-testid="contact-link"]');
      await page.waitForURL('**/contact');
      
      // Try to submit empty form
      await page.click('[data-testid="contact-submit"]');
      
      // Should show validation errors
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="subject-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="message-error"]')).toBeVisible();
    });
  });

  test.describe('Theme Toggle Flow', () => {
    test('should toggle between light and dark themes', async ({ page }) => {
      // Check initial theme (should be light by default)
      await expect(page.locator('html')).toHaveAttribute('class', /light/);
      
      // Toggle to dark theme
      await page.click('[data-testid="theme-toggle"]');
      await expect(page.locator('html')).toHaveAttribute('class', /dark/);
      
      // Toggle back to light theme
      await page.click('[data-testid="theme-toggle"]');
      await expect(page.locator('html')).toHaveAttribute('class', /light/);
    });

    test('should persist theme preference', async ({ page }) => {
      // Set to dark theme
      await page.click('[data-testid="theme-toggle"]');
      await expect(page.locator('html')).toHaveAttribute('class', /dark/);
      
      // Reload page
      await page.reload();
      
      // Theme should persist
      await expect(page.locator('html')).toHaveAttribute('class', /dark/);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 errors gracefully', async ({ page }) => {
      // Navigate to non-existent page
      await page.goto('/non-existent-page');
      
      // Should show 404 page
      await expect(page.locator('[data-testid="404-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="404-message"]')).toBeVisible();
      
      // Should have link back to home
      await page.click('[data-testid="404-home-link"]');
      await expect(page).toHaveURL('/');
    });

    test('should handle network errors', async ({ page }) => {
      // Mock network failure for API calls
      await page.route('**/api/**', route => route.abort());
      
      // Try to search for gifts
      await page.fill('[data-testid="recipient-input"]', 'Test');
      await page.selectOption('[data-testid="occasion-select"]', 'birthday');
      await page.fill('[data-testid="budget-input"]', '100');
      await page.click('[data-testid="search-button"]');
      
      // Should show error message
      await page.waitForSelector('[data-testid="error-message"]');
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      // Check for proper ARIA labels on form inputs
      await expect(page.locator('[data-testid="recipient-input"]')).toHaveAttribute('aria-label');
      await expect(page.locator('[data-testid="budget-input"]')).toHaveAttribute('aria-label');
      await expect(page.locator('[data-testid="search-button"]')).toHaveAttribute('aria-label');
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Navigate using keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to activate search button with Enter
      await page.keyboard.press('Enter');
      
      // Should show validation errors
      await expect(page.locator('[data-testid="recipient-error"]')).toBeVisible();
    });

    test('should have proper focus management', async ({ page }) => {
      // Click on a link
      await page.click('[data-testid="blog-link"]');
      
      // Focus should be managed properly
      await expect(page.locator('[data-testid="blog-title"]')).toBeFocused();
    });
  });

  test.describe('Performance', () => {
    test('should load quickly', async ({ page }) => {
      // Measure page load time
      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have good Core Web Vitals', async ({ page }) => {
      // Navigate to page and wait for load
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for large contentful paint
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcpEntry = entries[entries.length - 1];
            resolve(lcpEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
        });
      });
      
      // LCP should be under 2.5 seconds
      expect(lcp).toBeLessThan(2500);
    });
  });
});
