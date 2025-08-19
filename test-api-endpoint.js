const fetch = require('node-fetch');

async function testBlogAPI() {
  console.log('🧪 Testing /api/blog endpoint...');
  
  try {
    // Test GET request to /api/blog
    const response = await fetch('http://localhost:5173/api/blog');
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API endpoint working correctly!');
      console.log('📄 Response data:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ API endpoint returned error status:', response.status);
      const errorText = await response.text();
      console.log('📄 Error response:', errorText);
    }
  } catch (error) {
    console.log('❌ Failed to connect to API endpoint:', error.message);
    console.log('💡 Make sure the development server is running on port 5173');
  }
}

testBlogAPI();
