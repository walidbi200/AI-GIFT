import type { VercelRequest, VercelResponse } from '@vercel/node';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  tags: string[];
  publishedAt: string;
  status: 'published' | 'draft';
  readingTime: number;
  wordCount: number;
  featuredImage?: string;
}

// In-memory storage for demo purposes
// In production, you'd use a database like MongoDB, PostgreSQL, or Vercel KV
let blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '10 Unique Gift Ideas for Tech Enthusiasts',
    slug: 'unique-gift-ideas-tech-enthusiasts',
    description: 'Discover the perfect gifts for the tech-savvy people in your life. From smart home devices to innovative gadgets, find something they\'ll love.',
    content: `
      <h2>Introduction</h2>
      <p>Finding the perfect gift for tech enthusiasts can be challenging, but with the right approach, you can surprise them with something truly special.</p>
      
      <h2>Smart Home Devices</h2>
      <p>Smart home devices are always a hit with tech lovers. Consider items like:</p>
      <ul>
        <li>Smart speakers with voice assistants</li>
        <li>Smart lighting systems</li>
        <li>Smart thermostats</li>
        <li>Security cameras</li>
      </ul>
      
      <h2>Gaming Accessories</h2>
      <p>For gamers, consider high-quality accessories that enhance their gaming experience.</p>
      
      <h2>Conclusion</h2>
      <p>Remember, the best gift is one that shows you understand their passion for technology.</p>
    `,
    tags: ['tech gifts', 'smart home', 'gaming', 'gift ideas'],
    publishedAt: '2024-01-15T10:00:00Z',
    status: 'published',
    readingTime: 3,
    wordCount: 150
  },
  {
    id: '2',
    title: 'The Ultimate Guide to Choosing Gifts for Different Personalities',
    slug: 'ultimate-guide-choosing-gifts-personalities',
    description: 'Learn how to match gifts with personality types and make every gift-giving occasion a success.',
    content: `
      <h2>Understanding Personality Types</h2>
      <p>Different people have different preferences and interests. Understanding these can help you choose better gifts.</p>
      
      <h2>For the Creative Type</h2>
      <p>Creative individuals often appreciate gifts that allow them to express themselves.</p>
      
      <h2>For the Practical Person</h2>
      <p>Practical people value functionality and usefulness in their gifts.</p>
      
      <h2>For the Adventure Seeker</h2>
      <p>Adventure seekers love experiences and items that support their active lifestyle.</p>
      
      <h2>Conclusion</h2>
      <p>The key is to think about what brings them joy and aligns with their lifestyle.</p>
    `,
    tags: ['gift guide', 'personality types', 'gift giving'],
    publishedAt: '2024-01-10T14:30:00Z',
    status: 'published',
    readingTime: 4,
    wordCount: 200
  },
  {
    id: '3',
    title: 'Budget-Friendly Gift Ideas That Don\'t Look Cheap',
    slug: 'budget-friendly-gift-ideas',
    description: 'Discover thoughtful and impressive gifts that won\'t break the bank but will still delight your loved ones.',
    content: `
      <h2>Quality Over Quantity</h2>
      <p>When working with a budget, focus on quality and thoughtfulness rather than price tags.</p>
      
      <h2>Handmade Gifts</h2>
      <p>Handmade gifts show effort and care, making them incredibly meaningful.</p>
      
      <h2>Experience Gifts</h2>
      <p>Sometimes the best gifts aren\'t things at all, but experiences and memories.</p>
      
      <h2>Personalized Items</h2>
      <p>Adding a personal touch can make even inexpensive items feel special.</p>
      
      <h2>Conclusion</h2>
      <p>Remember, the best gifts come from the heart, not the wallet.</p>
    `,
    tags: ['budget gifts', 'affordable', 'thoughtful gifts'],
    publishedAt: '2024-01-05T09:15:00Z',
    status: 'published',
    readingTime: 3,
    wordCount: 180
  }
];

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, ' ');
  const wordCount = textContent.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all blog posts or a specific post
        const { slug } = req.query;
        
        if (slug) {
          // Get specific post by slug
          const post = blogPosts.find(p => p.slug === slug);
          if (post) {
            res.status(200).json(post);
          } else {
            res.status(404).json({ error: 'Post not found' });
          }
        } else {
          // Get all posts
          res.status(200).json(blogPosts);
        }
        break;

      case 'POST':
        // Create a new blog post
        const { title, description, content, tags, featuredImage } = req.body;

        if (!title || !description || !content) {
          res.status(400).json({
            error: 'Missing required fields: title, description, content'
          });
          return;
        }

        const newPost: BlogPost = {
          id: `post_${Date.now()}`,
          title,
          slug: generateSlug(title),
          description,
          content,
          tags: tags || [],
          publishedAt: new Date().toISOString(),
          status: 'published',
          readingTime: calculateReadingTime(content),
          wordCount: content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length,
          featuredImage
        };

        blogPosts.unshift(newPost); // Add to beginning of array

        res.status(201).json({
          success: true,
          message: 'Blog post created successfully!',
          post: newPost
        });
        break;

      case 'PUT':
        // Update an existing blog post
        const { id } = req.query;
        const updateData = req.body;

        const postIndex = blogPosts.findIndex(p => p.id === id);
        if (postIndex === -1) {
          res.status(404).json({ error: 'Post not found' });
          return;
        }

        blogPosts[postIndex] = {
          ...blogPosts[postIndex],
          ...updateData,
          id: blogPosts[postIndex].id, // Preserve original ID
          publishedAt: blogPosts[postIndex].publishedAt // Preserve original date
        };

        res.status(200).json({
          success: true,
          message: 'Blog post updated successfully!',
          post: blogPosts[postIndex]
        });
        break;

      case 'DELETE':
        // Delete a blog post
        const { id: deleteId } = req.query;
        
        const deleteIndex = blogPosts.findIndex(p => p.id === deleteId);
        if (deleteIndex === -1) {
          res.status(404).json({ error: 'Post not found' });
          return;
        }

        blogPosts.splice(deleteIndex, 1);

        res.status(200).json({
          success: true,
          message: 'Blog post deleted successfully!'
        });
        break;

      default:
        res.status(405).json({
          error: 'Method not allowed. Only GET, POST, PUT, DELETE are supported.'
        });
    }
  } catch (error) {
    console.error('Blog posts API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
