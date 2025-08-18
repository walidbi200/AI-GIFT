import { test, expect } from '@playwright/test';

test.describe('Gift Finder E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the gift finder page before each test
    await page.goto('/gift-finder');
  });

  test.describe('Gift Search and Recommendations', () => {
    test('should search for gifts with basic criteria', async ({ page }) => {
      // Fill in basic gift search form
      await page.fill('[data-testid="recipient-input"]', 'mom');
      await page.fill('[data-testid="occasion-input"]', 'birthday');
      await page.fill('[data-testid="budget-input"]', '100');
      
      // Submit the form
      await page.click('button:has-text("Find Gifts")');
      
      // Wait for recommendations to load
      await page.waitForSelector('[data-testid="gift-recommendations"]', { timeout: 10000 });
      
      // Verify recommendations are displayed
      const recommendations = await page.locator('[data-testid="gift-card"]');
      await expect(recommendations).toHaveCount(3); // Should show 3 recommendations
      
      // Verify each recommendation has required elements
      for (let i = 0; i < 3; i++) {
        const card = recommendations.nth(i);
        await expect(card.locator('[data-testid="gift-name"]')).toBeVisible();
        await expect(card.locator('[data-testid="gift-price"]')).toBeVisible();
        await expect(card.locator('[data-testid="gift-reason"]')).toBeVisible();
      }
    });

    test('should search for gifts with advanced criteria', async ({ page }) => {
      // Fill in comprehensive gift search form
      await page.fill('[data-testid="recipient-input"]', 'dad');
      await page.fill('[data-testid="occasion-input"]', 'christmas');
      await page.fill('[data-testid="budget-input"]', '200');
      await page.fill('[data-testid="age-input"]', '45');
      
      // Add interests
      await page.fill('[data-testid="interests-input"]', 'tech, cooking, sports');
      
      // Submit the form
      await page.click('button:has-text("Find Gifts")');
      
      // Wait for recommendations to load
      await page.waitForSelector('[data-testid="gift-recommendations"]', { timeout: 10000 });
      
      // Verify recommendations are displayed
      const recommendations = await page.locator('[data-testid="gift-card"]');
      await expect(recommendations).toHaveCount(3);
      
      // Verify budget constraint is respected
      for (let i = 0; i < 3; i++) {
        const priceElement = recommendations.nth(i).locator('[data-testid="gift-price"]');
        const priceText = await priceElement.textContent();
        const price = parseInt(priceText!.replace(/[^0-9]/g, ''));
        expect(price).toBeLessThanOrEqual(200);
      }
    });

    test('should handle empty search criteria gracefully', async ({ page }) => {
      // Submit form without filling any fields
      await page.click('button:has-text("Find Gifts")');
      
      // Should show validation error or default recommendations
      await expect(page.locator('.text-red-600, [data-testid="gift-recommendations"]')).toBeVisible();
    });

    test('should filter recommendations by price range', async ({ page }) => {
      // Fill in basic search
      await page.fill('[data-testid="recipient-input"]', 'friend');
      await page.fill('[data-testid="budget-input"]', '50');
      await page.click('button:has-text("Find Gifts")');
      
      // Wait for initial recommendations
      await page.waitForSelector('[data-testid="gift-recommendations"]');
      
      // Apply price filter
      await page.selectOption('[data-testid="price-filter"]', '25-50');
      
      // Verify filtered results
      const recommendations = await page.locator('[data-testid="gift-card"]');
      await expect(recommendations).toBeVisible();
      
      // Verify all recommendations are within the price range
      for (let i = 0; i < await recommendations.count(); i++) {
        const priceElement = recommendations.nth(i).locator('[data-testid="gift-price"]');
        const priceText = await priceElement.textContent();
        const price = parseInt(priceText!.replace(/[^0-9]/g, ''));
        expect(price).toBeGreaterThanOrEqual(25);
        expect(price).toBeLessThanOrEqual(50);
      }
    });
  });

  test.describe('Gift Card Display and Interaction', () => {
    test('should display gift cards with proper information', async ({ page }) => {
      // Search for gifts first
      await page.fill('[data-testid="recipient-input"]', 'sister');
      await page.click('button:has-text("Find Gifts")');
      await page.waitForSelector('[data-testid="gift-card"]');
      
      // Verify gift card structure
      const firstCard = page.locator('[data-testid="gift-card"]').first();
      
      await expect(firstCard.locator('[data-testid="gift-name"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="gift-price"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="gift-reason"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="gift-category"]')).toBeVisible();
      
      // Verify card has proper styling
      await expect(firstCard).toHaveClass(/bg-white/);
      await expect(firstCard).toHaveClass(/rounded-lg/);
      await expect(firstCard).toHaveClass(/shadow/);
    });

    test('should allow saving favorite gifts', async ({ page }) => {
      // Search for gifts
      await page.fill('[data-testid="recipient-input"]', 'brother');
      await page.click('button:has-text("Find Gifts")');
      await page.waitForSelector('[data-testid="gift-card"]');
      
      // Click favorite button on first gift
      const firstCard = page.locator('[data-testid="gift-card"]').first();
      await firstCard.locator('[data-testid="favorite-button"]').click();
      
      // Verify favorite state
      await expect(firstCard.locator('[data-testid="favorite-button"]')).toHaveClass(/text-red-500/);
      
      // Navigate to favorites page
      await page.click('text=Favorites');
      
      // Verify gift appears in favorites
      await expect(page.locator('[data-testid="favorite-gift"]')).toBeVisible();
    });

    test('should allow sharing gift recommendations', async ({ page }) => {
      // Search for gifts
      await page.fill('[data-testid="recipient-input"]', 'cousin');
      await page.click('button:has-text("Find Gifts")');
      await page.waitForSelector('[data-testid="gift-card"]');
      
      // Click share button on first gift
      const firstCard = page.locator('[data-testid="gift-card"]').first();
      await firstCard.locator('[data-testid="share-button"]').click();
      
      // Verify share modal appears
      await expect(page.locator('[data-testid="share-modal"]')).toBeVisible();
      
      // Verify share options are available
      await expect(page.locator('text=Copy Link')).toBeVisible();
      await expect(page.locator('text=Share on Facebook')).toBeVisible();
      await expect(page.locator('text=Share on Twitter')).toBeVisible();
    });
  });

  test.describe('Search History and Recent Searches', () => {
    test('should save and display recent searches', async ({ page }) => {
      // Perform multiple searches
      const searches = [
        { recipient: 'mom', occasion: 'birthday' },
        { recipient: 'dad', occasion: 'christmas' },
        { recipient: 'friend', occasion: 'graduation' }
      ];
      
      for (const search of searches) {
        await page.fill('[data-testid="recipient-input"]', search.recipient);
        await page.fill('[data-testid="occasion-input"]', search.occasion);
        await page.click('button:has-text("Find Gifts")');
        await page.waitForSelector('[data-testid="gift-recommendations"]');
        
        // Wait a bit between searches
        await page.waitForTimeout(1000);
      }
      
      // Navigate to search history
      await page.click('text=Search History');
      
      // Verify recent searches are displayed
      for (const search of searches) {
        await expect(page.locator(`text=${search.recipient}`)).toBeVisible();
        await expect(page.locator(`text=${search.occasion}`)).toBeVisible();
      }
    });

    test('should allow quick re-search from history', async ({ page }) => {
      // Perform initial search
      await page.fill('[data-testid="recipient-input"]', 'grandma');
      await page.fill('[data-testid="occasion-input"]', 'mothers-day');
      await page.click('button:has-text("Find Gifts")');
      await page.waitForSelector('[data-testid="gift-recommendations"]');
      
      // Navigate to search history
      await page.click('text=Search History');
      
      // Click on a recent search to re-execute it
      await page.click('[data-testid="recent-search-item"]');
      
      // Verify search is re-executed
      await page.waitForSelector('[data-testid="gift-recommendations"]');
      await expect(page.locator('[data-testid="gift-card"]')).toBeVisible();
    });
  });

  test.describe('Responsive Design and Mobile Experience', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Verify form is usable on mobile
      await page.fill('[data-testid="recipient-input"]', 'mom');
      await page.fill('[data-testid="occasion-input"]', 'birthday');
      await page.fill('[data-testid="budget-input"]', '100');
      
      // Submit form
      await page.click('button:has-text("Find Gifts")');
      
      // Wait for results
      await page.waitForSelector('[data-testid="gift-recommendations"]');
      
      // Verify results are displayed properly on mobile
      await expect(page.locator('[data-testid="gift-card"]')).toBeVisible();
      
      // Verify touch interactions work
      const firstCard = page.locator('[data-testid="gift-card"]').first();
      await firstCard.locator('[data-testid="favorite-button"]').click();
      await expect(firstCard.locator('[data-testid="favorite-button"]')).toHaveClass(/text-red-500/);
    });

    test('should handle tablet layout correctly', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Fill form
      await page.fill('[data-testid="recipient-input"]', 'dad');
      await page.fill('[data-testid="budget-input"]', '150');
      await page.click('button:has-text("Find Gifts")');
      
      // Wait for results
      await page.waitForSelector('[data-testid="gift-recommendations"]');
      
      // Verify grid layout works on tablet
      await expect(page.locator('.grid')).toBeVisible();
      
      // Verify filters are accessible
      await expect(page.locator('[data-testid="price-filter"]')).toBeVisible();
      await expect(page.locator('[data-testid="category-filter"]')).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network failure
      await page.route('/api/generate-gifts', route => route.abort());
      
      // Fill form and submit
      await page.fill('[data-testid="recipient-input"]', 'friend');
      await page.click('button:has-text("Find Gifts")');
      
      // Verify error handling
      await expect(page.locator('.text-red-600')).toContainText('Failed to load recommendations');
      await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
    });

    test('should handle invalid budget inputs', async ({ page }) => {
      // Try negative budget
      await page.fill('[data-testid="recipient-input"]', 'friend');
      await page.fill('[data-testid="budget-input"]', '-50');
      await page.click('button:has-text("Find Gifts")');
      
      // Should show validation error
      await expect(page.locator('.text-red-600')).toContainText('Budget must be positive');
    });

    test('should handle very large budget inputs', async ({ page }) => {
      // Try very large budget
      await page.fill('[data-testid="recipient-input"]', 'friend');
      await page.fill('[data-testid="budget-input"]', '999999');
      await page.click('button:has-text("Find Gifts")');
      
      // Should either work or show appropriate error
      await expect(page.locator('[data-testid="gift-recommendations"], .text-red-600')).toBeVisible();
    });

    test('should handle special characters in inputs', async ({ page }) => {
      // Try inputs with special characters
      await page.fill('[data-testid="recipient-input"]', 'Mom & Dad');
      await page.fill('[data-testid="occasion-input"]', 'Christmas 2024!');
      await page.fill('[data-testid="interests-input"]', 'tech, cooking, sports & games');
      await page.click('button:has-text("Find Gifts")');
      
      // Should handle special characters gracefully
      await expect(page.locator('[data-testid="gift-recommendations"], .text-red-600')).toBeVisible();
    });
  });

  test.describe('Performance and Loading States', () => {
    test('should show loading state during search', async ({ page }) => {
      // Fill form
      await page.fill('[data-testid="recipient-input"]', 'friend');
      await page.click('button:has-text("Find Gifts")');
      
      // Verify loading state is shown
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
      
      // Wait for results to load
      await page.waitForSelector('[data-testid="gift-recommendations"]');
      
      // Verify loading state is hidden
      await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
    });

    test('should handle slow network connections', async ({ page }) => {
      // Mock slow network
      await page.route('/api/generate-gifts', route => 
        route.fulfill({ 
          status: 200, 
          body: JSON.stringify({ recommendations: [] }),
          delay: 5000 
        })
      );
      
      // Fill form and submit
      await page.fill('[data-testid="recipient-input"]', 'friend');
      await page.click('button:has-text("Find Gifts")');
      
      // Verify loading state persists
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
      
      // Wait for response
      await page.waitForSelector('[data-testid="gift-recommendations"]', { timeout: 10000 });
      
      // Verify loading state is hidden
      await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Navigate through form using keyboard
      await page.keyboard.press('Tab');
      await page.fill('[data-testid="recipient-input"]', 'friend');
      
      await page.keyboard.press('Tab');
      await page.fill('[data-testid="occasion-input"]', 'birthday');
      
      await page.keyboard.press('Tab');
      await page.fill('[data-testid="budget-input"]', '100');
      
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Wait for results
      await page.waitForSelector('[data-testid="gift-recommendations"]');
      
      // Verify results are accessible via keyboard
      await expect(page.locator('[data-testid="gift-card"]')).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Verify form inputs have proper labels
      await expect(page.locator('[data-testid="recipient-input"]')).toHaveAttribute('aria-label');
      await expect(page.locator('[data-testid="occasion-input"]')).toHaveAttribute('aria-label');
      await expect(page.locator('[data-testid="budget-input"]')).toHaveAttribute('aria-label');
      
      // Verify buttons have proper labels
      await expect(page.locator('button:has-text("Find Gifts")')).toHaveAttribute('aria-label');
    });
  });
});
