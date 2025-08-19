import { test, expect } from '@playwright/test';

test.describe('Blog Workflow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the admin page before each test
    await page.goto('/admin');
  });

  test.describe('Blog Creation and Management', () => {
    test('should create a new blog post successfully', async ({ page }) => {
      // Navigate to blog generator
      await page.click('text=Blog Generator');
      
      // Fill in blog post details
      await page.fill('[data-testid="blog-title"]', 'E2E Test Blog Post');
      await page.fill('[data-testid="blog-description"]', 'This is a test blog post created during E2E testing');
      await page.fill('[data-testid="blog-content"]', 'This is the main content of the blog post. It should be comprehensive and engaging.');
      
      // Add tags
      await page.fill('[data-testid="blog-tags"]', 'e2e, testing, automation');
      
      // Set primary keyword
      await page.fill('[data-testid="primary-keyword"]', 'E2E testing');
      
      // Select target audience
      await page.selectOption('[data-testid="target-audience"]', 'developers');
      
      // Select tone of voice
      await page.selectOption('[data-testid="tone-of-voice"]', 'professional');
      
      // Set status to draft
      await page.selectOption('[data-testid="blog-status"]', 'draft');
      
      // Save the blog post
      await page.click('button:has-text("Save Blog")');
      
      // Wait for success message
      await expect(page.locator('.text-green-600')).toContainText('Blog saved successfully');
      
      // Verify the blog appears in the list
      await page.click('text=Blog List');
      await expect(page.locator('text=E2E Test Blog Post')).toBeVisible();
    });

    test('should generate blog content using AI', async ({ page }) => {
      // Navigate to blog generator
      await page.click('text=Blog Generator');
      
      // Fill in basic details for AI generation
      await page.fill('[data-testid="blog-title"]', 'AI Generated Blog Post');
      await page.fill('[data-testid="blog-description"]', 'A blog post about artificial intelligence');
      await page.fill('[data-testid="primary-keyword"]', 'artificial intelligence');
      await page.selectOption('[data-testid="target-audience"]', 'general');
      await page.selectOption('[data-testid="tone-of-voice"]', 'informative');
      
      // Click suggest button to generate content
      await page.click('button:has-text("Suggest")');
      
      // Wait for AI generation to complete
      await expect(page.locator('[data-testid="generation-status"]')).toContainText('Generating');
      
      // Wait for content to be generated (this might take a while)
      await page.waitForSelector('[data-testid="blog-content"]:not(:empty)', { timeout: 30000 });
      
      // Verify content was generated
      const content = await page.locator('[data-testid="blog-content"]').textContent();
      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThan(100);
    });

    test('should edit an existing blog post', async ({ page }) => {
      // First create a blog post
      await page.click('text=Blog Generator');
      await page.fill('[data-testid="blog-title"]', 'Blog Post to Edit');
      await page.fill('[data-testid="blog-content"]', 'Original content');
      await page.click('button:has-text("Save Blog")');
      
      // Navigate to blog list
      await page.click('text=Blog List');
      
      // Find and click edit button for the created post
      await page.click('text=Blog Post to Edit');
      await page.click('button:has-text("Edit")');
      
      // Modify the content
      await page.fill('[data-testid="blog-content"]', 'Updated content for the blog post');
      
      // Save changes
      await page.click('button:has-text("Update")');
      
      // Verify update was successful
      await expect(page.locator('.text-green-600')).toContainText('Blog updated successfully');
    });

    test('should delete a blog post', async ({ page }) => {
      // First create a blog post
      await page.click('text=Blog Generator');
      await page.fill('[data-testid="blog-title"]', 'Blog Post to Delete');
      await page.fill('[data-testid="blog-content"]', 'This post will be deleted');
      await page.click('button:has-text("Save Blog")');
      
      // Navigate to blog list
      await page.click('text=Blog List');
      
      // Find and click delete button for the created post
      await page.click('text=Blog Post to Delete');
      await page.click('button:has-text("Delete")');
      
      // Confirm deletion in modal
      await page.click('button:has-text("Confirm Delete")');
      
      // Verify deletion was successful
      await expect(page.locator('.text-green-600')).toContainText('Blog deleted successfully');
      
      // Verify post is no longer in the list
      await expect(page.locator('text=Blog Post to Delete')).not.toBeVisible();
    });
  });

  test.describe('Blog Publishing and Viewing', () => {
    test('should publish a blog post and view it publicly', async ({ page }) => {
      // Create a blog post as draft
      await page.click('text=Blog Generator');
      await page.fill('[data-testid="blog-title"]', 'Public Blog Post');
      await page.fill('[data-testid="blog-description"]', 'A blog post that will be published');
      await page.fill('[data-testid="blog-content"]', 'This is the content of the public blog post.');
      await page.fill('[data-testid="blog-tags"]', 'public, blog, test');
      await page.selectOption('[data-testid="blog-status"]', 'draft');
      await page.click('button:has-text("Save Blog")');
      
      // Navigate to blog list and publish the post
      await page.click('text=Blog List');
      await page.click('text=Public Blog Post');
      await page.click('button:has-text("Publish")');
      
      // Verify publication
      await expect(page.locator('.text-green-600')).toContainText('Blog published successfully');
      
      // Navigate to public blog page
      await page.goto('/blog');
      
      // Verify the published post appears in the public list
      await expect(page.locator('text=Public Blog Post')).toBeVisible();
      
      // Click on the post to view it
      await page.click('text=Public Blog Post');
      
      // Verify the full blog post content is displayed
      await expect(page.locator('h1')).toContainText('Public Blog Post');
      await expect(page.locator('.prose')).toContainText('This is the content of the public blog post.');
    });

    test('should display blog post with proper Medium-style layout', async ({ page }) => {
      // Create a comprehensive blog post
      await page.click('text=Blog Generator');
      await page.fill('[data-testid="blog-title"]', 'Medium-Style Blog Post');
      await page.fill('[data-testid="blog-description"]', 'A blog post to test Medium-style layout');
      await page.fill('[data-testid="blog-content"]', `
# Introduction

This is a test blog post with **bold text** and *italic text*.

## Main Section

Here's some content with bullet points:
- First bullet point
- Second bullet point
- Third bullet point

### Subsection

This is a subsection with more detailed content.

## Conclusion

This concludes our test blog post.
      `);
      await page.fill('[data-testid="blog-tags"]', 'medium, style, test');
      await page.selectOption('[data-testid="blog-status"]', 'published');
      await page.click('button:has-text("Save Blog")');
      
      // Navigate to the published post
      await page.goto('/blog');
      await page.click('text=Medium-Style Blog Post');
      
      // Verify Medium-style layout elements
      await expect(page.locator('h1.text-4xl')).toBeVisible();
      await expect(page.locator('.prose p')).toHaveCount(4); // Should have multiple paragraphs
      await expect(page.locator('.prose h2')).toHaveCount(2); // Should have h2 headings
      await expect(page.locator('.prose h3')).toHaveCount(1); // Should have h3 heading
      await expect(page.locator('.prose ul')).toBeVisible(); // Should have bullet list
      await expect(page.locator('.prose strong')).toContainText('bold text');
      await expect(page.locator('.prose em')).toContainText('italic text');
    });
  });

  test.describe('Blog Search and Filtering', () => {
    test('should search for blog posts', async ({ page }) => {
      // Create multiple blog posts with different titles
      const posts = [
        { title: 'Search Test Post 1', content: 'Content for post 1' },
        { title: 'Search Test Post 2', content: 'Content for post 2' },
        { title: 'Different Title Post', content: 'Content for different post' }
      ];
      
      for (const post of posts) {
        await page.click('text=Blog Generator');
        await page.fill('[data-testid="blog-title"]', post.title);
        await page.fill('[data-testid="blog-content"]', post.content);
        await page.selectOption('[data-testid="blog-status"]', 'published');
        await page.click('button:has-text("Save Blog")');
      }
      
      // Navigate to blog list and search
      await page.click('text=Blog List');
      await page.fill('[data-testid="search-input"]', 'Search Test');
      
      // Verify only matching posts are shown
      await expect(page.locator('text=Search Test Post 1')).toBeVisible();
      await expect(page.locator('text=Search Test Post 2')).toBeVisible();
      await expect(page.locator('text=Different Title Post')).not.toBeVisible();
    });

    test('should filter blog posts by status', async ({ page }) => {
      // Create posts with different statuses
      const posts = [
        { title: 'Draft Post', content: 'Draft content', status: 'draft' },
        { title: 'Published Post', content: 'Published content', status: 'published' }
      ];
      
      for (const post of posts) {
        await page.click('text=Blog Generator');
        await page.fill('[data-testid="blog-title"]', post.title);
        await page.fill('[data-testid="blog-content"]', post.content);
        await page.selectOption('[data-testid="blog-status"]', post.status);
        await page.click('button:has-text("Save Blog")');
      }
      
      // Navigate to blog list and filter by published
      await page.click('text=Blog List');
      await page.selectOption('[data-testid="status-filter"]', 'published');
      
      // Verify only published posts are shown
      await expect(page.locator('text=Published Post')).toBeVisible();
      await expect(page.locator('text=Draft Post')).not.toBeVisible();
    });
  });

  test.describe('Blog Statistics and Analytics', () => {
    test('should display blog statistics correctly', async ({ page }) => {
      // Create some test posts
      const posts = [
        { title: 'Stats Test Post 1', content: 'Content 1', status: 'published' },
        { title: 'Stats Test Post 2', content: 'Content 2', status: 'draft' },
        { title: 'Stats Test Post 3', content: 'Content 3', status: 'published' }
      ];
      
      for (const post of posts) {
        await page.click('text=Blog Generator');
        await page.fill('[data-testid="blog-title"]', post.title);
        await page.fill('[data-testid="blog-content"]', post.content);
        await page.selectOption('[data-testid="blog-status"]', post.status);
        await page.click('button:has-text("Save Blog")');
      }
      
      // Navigate to admin dashboard
      await page.goto('/admin');
      
      // Verify statistics are displayed
      await expect(page.locator('[data-testid="total-posts"]')).toBeVisible();
      await expect(page.locator('[data-testid="published-posts"]')).toBeVisible();
      await expect(page.locator('[data-testid="draft-posts"]')).toBeVisible();
      
      // Verify the counts are correct (should be at least our test posts)
      const totalPosts = await page.locator('[data-testid="total-posts"]').textContent();
      const publishedPosts = await page.locator('[data-testid="published-posts"]').textContent();
      const draftPosts = await page.locator('[data-testid="draft-posts"]').textContent();
      
      expect(parseInt(totalPosts!)).toBeGreaterThanOrEqual(3);
      expect(parseInt(publishedPosts!)).toBeGreaterThanOrEqual(2);
      expect(parseInt(draftPosts!)).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle validation errors gracefully', async ({ page }) => {
      await page.click('text=Blog Generator');
      
      // Try to save without required fields
      await page.click('button:has-text("Save Blog")');
      
      // Verify error messages are displayed
      await expect(page.locator('.text-red-600')).toContainText('Title is required');
      await expect(page.locator('.text-red-600')).toContainText('Content is required');
    });

    test('should handle network errors during save', async ({ page }) => {
      // Mock network failure
      await page.route('/api/blog', route => route.abort());
      
      await page.click('text=Blog Generator');
      await page.fill('[data-testid="blog-title"]', 'Network Error Test');
      await page.fill('[data-testid="blog-content"]', 'This should fail');
      await page.click('button:has-text("Save Blog")');
      
      // Verify error handling
      await expect(page.locator('.text-red-600')).toContainText('Failed to save blog');
    });

    test('should handle large content gracefully', async ({ page }) => {
      await page.click('text=Blog Generator');
      
      // Create very large content
      const largeContent = 'A'.repeat(10000);
      await page.fill('[data-testid="blog-title"]', 'Large Content Test');
      await page.fill('[data-testid="blog-content"]', largeContent);
      
      // Should not crash or become unresponsive
      await page.click('button:has-text("Save Blog")');
      
      // Should either save successfully or show appropriate error
      await expect(page.locator('.text-green-600, .text-red-600')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigate to blog generator
      await page.click('text=Blog Generator');
      
      // Verify form is usable on mobile
      await page.fill('[data-testid="blog-title"]', 'Mobile Test Post');
      await page.fill('[data-testid="blog-content"]', 'Mobile content test');
      
      // Verify buttons are accessible
      await expect(page.locator('button:has-text("Save Blog")')).toBeVisible();
      await expect(page.locator('button:has-text("Suggest")')).toBeVisible();
      
      // Save the post
      await page.click('button:has-text("Save Blog")');
      
      // Verify success on mobile
      await expect(page.locator('.text-green-600')).toContainText('Blog saved successfully');
    });

    test('should work correctly on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Navigate to blog list
      await page.click('text=Blog List');
      
      // Verify layout is appropriate for tablet
      await expect(page.locator('.grid')).toBeVisible();
      
      // Verify search and filter controls are accessible
      await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="status-filter"]')).toBeVisible();
    });
  });
});
