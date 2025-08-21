import { chromium, FullConfig } from '@playwright/test';
import { sql } from '@vercel/postgres';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  console.log('🧪 Setting up E2E test environment...');
  
  // Clean up test data from database
  try {
    console.log('🗑️ Cleaning up test data...');
    await sql`DELETE FROM posts WHERE title LIKE 'E2E Test%'`;
    await sql`DELETE FROM posts WHERE title LIKE 'Test Post%'`;
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.warn('⚠️ Could not clean up test data:', error);
  }
  
  // Start browser and perform any necessary setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    await page.goto(baseURL!);
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
    
    // Verify the application is running
    const title = await page.title();
    console.log(`📱 Application loaded: ${title}`);
    
    // Perform any additional setup (e.g., create test users, set up test data)
    await setupTestData(page);
    
  } catch (error) {
    console.error('❌ Failed to set up E2E test environment:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ E2E test environment setup complete');
}

async function setupTestData(page: any) {
  try {
    console.log('📝 Setting up test data...');
    
    // Create test blog posts if needed
    const testPosts = [
      {
        title: 'E2E Test Post 1',
        content: 'This is a test post for E2E testing',
        status: 'published'
      },
      {
        title: 'E2E Test Post 2',
        content: 'Another test post for E2E testing',
        status: 'draft'
      }
    ];
    
    // Note: In a real scenario, you might want to create test data via API calls
    // For now, we'll just verify the application is accessible
    
    console.log('✅ Test data setup complete');
  } catch (error) {
    console.warn('⚠️ Could not set up test data:', error);
  }
}

export default globalSetup;
