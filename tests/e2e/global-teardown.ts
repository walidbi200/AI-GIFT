import { FullConfig } from '@playwright/test';
import { sql } from '@vercel/postgres';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up E2E test environment...');
  
  // Clean up test data from database
  try {
    console.log('🗑️ Cleaning up test data...');
    
    // Delete test posts created during E2E tests
    await sql`DELETE FROM posts WHERE title LIKE 'E2E Test%'`;
    await sql`DELETE FROM posts WHERE title LIKE 'Test Post%'`;
    await sql`DELETE FROM posts WHERE title LIKE 'Mobile Test%'`;
    await sql`DELETE FROM posts WHERE title LIKE 'Search Test%'`;
    await sql`DELETE FROM posts WHERE title LIKE 'Stats Test%'`;
    await sql`DELETE FROM posts WHERE title LIKE 'Medium-Style%'`;
    await sql`DELETE FROM posts WHERE title LIKE 'Public Blog%'`;
    await sql`DELETE FROM posts WHERE title LIKE 'Blog Post to%'`;
    await sql`DELETE FROM posts WHERE title LIKE 'AI Generated%'`;
    await sql`DELETE FROM posts WHERE title LIKE 'Network Error%'`;
    await sql`DELETE FROM posts WHERE title LIKE 'Large Content%'`;
    await sql`DELETE FROM posts WHERE title LIKE 'Draft Post%'`;
    await sql`DELETE FROM posts WHERE title LIKE 'Published Post%'`;
    await sql`DELETE FROM posts WHERE title LIKE 'Different Title%'`;
    
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.warn('⚠️ Could not clean up test data:', error);
  }
  
  // Clean up any temporary files or artifacts
  try {
    console.log('📁 Cleaning up test artifacts...');
    
    // Note: Playwright automatically handles most cleanup
    // This is for any custom artifacts we might create
    
    console.log('✅ Test artifacts cleaned up');
  } catch (error) {
    console.warn('⚠️ Could not clean up test artifacts:', error);
  }
  
  console.log('✅ E2E test environment cleanup complete');
}

export default globalTeardown;
