import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import API routes
import('./api/blog.js').then(blogModule => {
  // Create a mock request/response handler for the blog API
  app.use('/api/blog', async (req, res) => {
    try {
      // Mock the Vercel request/response objects
      const vercelReq = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        query: req.query
      };
      
      const vercelRes = {
        status: (code) => {
          res.status(code);
          return vercelRes;
        },
        json: (data) => {
          res.json(data);
        },
        send: (data) => {
          res.send(data);
        }
      };
      
      // Call the blog handler
      await blogModule.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });
});

// Import auth routes
import('./api/auth.js').then(authModule => {
  app.use('/api/auth', async (req, res) => {
    try {
      const vercelReq = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        query: req.query
      };
      
      const vercelRes = {
        status: (code) => {
          res.status(code);
          return vercelRes;
        },
        json: (data) => {
          res.json(data);
        },
        send: (data) => {
          res.send(data);
        }
      };
      
      await authModule.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Auth API Error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });
});

// Import other API routes
import('./api/generate-gifts.js').then(giftsModule => {
  app.use('/api/generate-gifts', async (req, res) => {
    try {
      const vercelReq = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        query: req.query
      };
      
      const vercelRes = {
        status: (code) => {
          res.status(code);
          return vercelRes;
        },
        json: (data) => {
          res.json(data);
        },
        send: (data) => {
          res.send(data);
        }
      };
      
      await giftsModule.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Gifts API Error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });
});

import('./api/ga.js').then(gaModule => {
  app.use('/api/ga', async (req, res) => {
    try {
      const vercelReq = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        query: req.query
      };
      
      const vercelRes = {
        status: (code) => {
          res.status(code);
          return vercelRes;
        },
        json: (data) => {
          res.json(data);
        },
        send: (data) => {
          res.send(data);
        }
      };
      
      await gaModule.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('GA API Error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 Blog API: http://localhost:${PORT}/api/blog`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
});

export default app;
