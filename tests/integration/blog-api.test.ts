import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { sql } from '@vercel/postgres';
import { generateToken } from '../../lib/auth';
import type { User } from '../../lib/auth';

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.POSTGRES_URL = process.env.POSTGRES_URL || 'postgresql://test:test@localhost:5432/test';

describe('Blog API Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let testPostId: number;

  const adminUser: User = {
    id: 'admin-123',
    email: 'admin@test.com',
    role: 'admin',
    createdAt: new Date()
  };

  const regularUser: User = {
    id: 'admin-123',
    email: 'admin@test.com',
    role: 'admin',
    createdAt: new Date()
  };

  beforeAll(async () => {
    // Generate test tokens
    adminToken = generateToken(adminUser);
    userToken = generateToken(regularUser);

    // Clean up test data
    await sql`DELETE FROM posts WHERE title LIKE 'Test Post%'`;
  });

  afterAll(async () => {
    // Clean up test data
    await sql`DELETE FROM posts WHERE title LIKE 'Test Post%'`;
  });

  beforeEach(async () => {
    // Clean up before each test
    await sql`DELETE FROM posts WHERE title LIKE 'Test Post%'`;
  });

  describe('POST /api/blog', () => {
    it('should create a new blog post with valid data', async () => {
      const postData = {
        title: 'Test Post - Create',
        description: 'A test blog post for creation',
        content: 'This is the content of the test blog post.',
        tags: ['test', 'integration'],
        primaryKeyword: 'test blog',
        targetAudience: 'developers',
        toneOfVoice: 'professional',
        status: 'draft'
      };

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(postData)
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.blog).toBeDefined();
      expect(result.blog.title).toBe(postData.title);
      expect(result.blog.slug).toContain('test-post-create');
      expect(result.blog.id).toBeDefined();
      
      testPostId = result.blog.id;
    });

    it('should reject request without authentication', async () => {
      const postData = {
        title: 'Test Post - No Auth',
        content: 'This should fail'
      };

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      expect(response.status).toBe(401);
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });

    it('should reject request with invalid data', async () => {
      const invalidData = {
        title: '', // Empty title should fail validation
        content: 'This has no title'
      };

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(invalidData)
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
    });

    it('should generate unique slugs for posts with same title', async () => {
      const postData = {
        title: 'Test Post - Duplicate Title',
        content: 'First post with this title'
      };

      // Create first post
      const response1 = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(postData)
      });

      const result1 = await response1.json();
      const slug1 = result1.blog.slug;

      // Create second post with same title
      const response2 = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(postData)
      });

      const result2 = await response2.json();
      const slug2 = result2.blog.slug;

      expect(slug1).not.toBe(slug2);
      expect(slug1).toContain('test-post-duplicate-title');
      expect(slug2).toContain('test-post-duplicate-title');
    });
  });

  describe('GET /api/blog', () => {
    beforeEach(async () => {
      // Create test posts
      const posts = [
        {
          title: 'Test Post - List 1',
          content: 'First test post for listing',
          status: 'published'
        },
        {
          title: 'Test Post - List 2',
          content: 'Second test post for listing',
          status: 'draft'
        },
        {
          title: 'Test Post - List 3',
          content: 'Third test post for listing',
          status: 'published'
        }
      ];

      for (const post of posts) {
        await fetch('/api/blog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(post)
        });
      }
    });

    it('should list all posts with pagination', async () => {
      const response = await fetch('/api/blog?page=1&limit=10');
      
      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.posts).toBeDefined();
      expect(Array.isArray(result.posts)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should filter posts by status', async () => {
      const response = await fetch('/api/blog?status=published');
      
      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.posts).toBeDefined();
      
      // All returned posts should be published
      result.posts.forEach((post: any) => {
        expect(post.status).toBe('published');
      });
    });

    it('should search posts by title', async () => {
      const response = await fetch('/api/blog?search=List 1');
      
      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.posts).toBeDefined();
      
      // Should find the specific post
      const foundPost = result.posts.find((post: any) => post.title === 'Test Post - List 1');
      expect(foundPost).toBeDefined();
    });

    it('should handle pagination correctly', async () => {
      const response = await fetch('/api/blog?page=1&limit=2');
      
      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.posts.length).toBeLessThanOrEqual(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
    });
  });

  describe('DELETE /api/blog', () => {
    let deletePostId: number;

    beforeEach(async () => {
      // Create a post to delete
      const postData = {
        title: 'Test Post - Delete',
        content: 'This post will be deleted'
      };

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(postData)
      });

      const result = await response.json();
      deletePostId = result.blog.id;
    });

    it('should delete a blog post with valid ID', async () => {
      const response = await fetch('/api/blog', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ id: deletePostId })
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');
    });

    it('should reject deletion without authentication', async () => {
      const response = await fetch('/api/blog', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: deletePostId })
      });

      expect(response.status).toBe(401);
      const result = await response.json();
      expect(result.success).toBe(false);
    });

    it('should handle deletion of non-existent post', async () => {
      const response = await fetch('/api/blog', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ id: 99999 })
      });

      expect(response.status).toBe(404);
      const result = await response.json();
      expect(result.success).toBe(false);
    });
  });

  describe('GET /api/blog?action=stats', () => {
    beforeEach(async () => {
      // Create test posts with different dates
      const posts = [
        {
          title: 'Test Post - Stats 1',
          content: 'First stats test post',
          status: 'published'
        },
        {
          title: 'Test Post - Stats 2',
          content: 'Second stats test post',
          status: 'draft'
        }
      ];

      for (const post of posts) {
        await fetch('/api/blog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(post)
        });
      }
    });

    it('should return blog statistics', async () => {
      const response = await fetch('/api/blog?action=stats');
      
      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.stats).toBeDefined();
      expect(result.stats.total).toBeGreaterThan(0);
      expect(result.stats.published).toBeGreaterThan(0);
      expect(result.stats.draft).toBeGreaterThan(0);
    });

    it('should include monthly and weekly counts', async () => {
      const response = await fetch('/api/blog?action=stats');
      
      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.stats.monthly).toBeDefined();
      expect(result.stats.weekly).toBeDefined();
      expect(typeof result.stats.monthly).toBe('number');
      expect(typeof result.stats.weekly).toBe('number');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on blog save endpoint', async () => {
      const postData = {
        title: 'Test Post - Rate Limit',
        content: 'Testing rate limiting'
      };

      const requests = Array(11).fill(null).map(() => 
        fetch('/api/blog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(postData)
        })
      );

      const responses = await Promise.all(requests);
      
      // First 10 requests should succeed
      for (let i = 0; i < 10; i++) {
        expect(responses[i].status).toBe(200);
      }
      
      // 11th request should be rate limited
      expect(responses[10].status).toBe(429);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we'll test with invalid data that might cause DB errors
      const invalidData = {
        title: 'A'.repeat(1000), // Very long title that might exceed DB limits
        content: 'Test content'
      };

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(invalidData)
      });

      // Should either return 400 (validation error) or 500 (DB error)
      expect([400, 500]).toContain(response.status);
    });

    it('should return proper error format', async () => {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({}) // Empty body should fail validation
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
  });
});
