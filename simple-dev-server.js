import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mock blog API endpoint
app.get('/api/blog', (req, res) => {
  res.json({ 
    posts: [
      {
        id: '1',
        slug: 'test-post',
        title: 'Test Blog Post',
        description: 'This is a test post for local development',
        content: 'This is the content of the test post.',
        tags: ['test', 'development'],
        primaryKeyword: 'test',
        wordCount: 10,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  });
});

// Mock auth API endpoint
app.post('/api/auth', (req, res) => {
  const { action, username, password } = req.body;
  
  if (action === 'login') {
    // Mock admin login
    if (username === 'admin' && password === 'admin123') {
      res.json({
        success: true,
        token: 'mock-jwt-token',
        user: { username: 'admin', role: 'admin' }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid action'
    });
  }
});

// Mock generate-gifts API endpoint
app.post('/api/generate-gifts', (req, res) => {
  res.json({
    gifts: [
      {
        name: 'Test Gift 1',
        description: 'A wonderful test gift',
        price: '$25',
        category: 'tech'
      },
      {
        name: 'Test Gift 2',
        description: 'Another great test gift',
        price: '$50',
        category: 'fashion'
      }
    ]
  });
});

// Mock GA API endpoint
app.all('/api/ga', (req, res) => {
  res.json({
    success: true,
    data: {
      pageViews: 100,
      uniqueVisitors: 50,
      sessionDuration: 180,
      bounceRate: 0.3,
      sessions: 25,
      topPages: [
        { path: '/', title: 'Home', views: 50 },
        { path: '/blog', title: 'Blog', views: 30 },
        { path: '/admin', title: 'Admin', views: 20 }
      ],
      recentActivity: [
        { timestamp: new Date().toISOString(), action: 'page_view', page: '/' },
        { timestamp: new Date().toISOString(), action: 'gift_search', occasion: 'birthday' }
      ]
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 Blog API: http://localhost:${PORT}/api/blog`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`🎁 Gifts API: http://localhost:${PORT}/api/generate-gifts`);
  console.log(`📈 GA API: http://localhost:${PORT}/api/ga`);
});

export default app;
