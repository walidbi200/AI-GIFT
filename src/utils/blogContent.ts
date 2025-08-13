import fs from 'fs';
import path from 'path';

export interface Post {
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

// Hardcoded blog posts (existing content)
const hardcodedPosts: Post[] = [
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

// Function to load saved blog posts from the file system
function loadSavedBlogPosts(): Post[] {
  try {
    const postsDir = path.join(process.cwd(), 'content', 'posts');
    
    if (!fs.existsSync(postsDir)) {
      console.log('📁 Posts directory does not exist yet');
      return [];
    }

    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
    const savedPosts: Post[] = [];

    files.forEach((file, index) => {
      try {
        const filePath = path.join(postsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Parse frontmatter and content
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        const markdownContent = content.replace(/^---\n[\s\S]*?\n---/, '').trim();
        
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
          const slugMatch = frontmatter.match(/slug:\s*"([^"]+)"/);
          const dateMatch = frontmatter.match(/date:\s*"([^"]+)"/);
          const descriptionMatch = frontmatter.match(/description:\s*"([^"]+)"/);
          const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/);
          
          if (titleMatch && slugMatch) {
            const tags = tagsMatch 
              ? tagsMatch[1].split(',').map(tag => tag.trim().replace(/"/g, ''))
              : [];
            
            const post: Post = {
              id: `saved_${index + 1}`,
              title: titleMatch[1],
              slug: slugMatch[1],
              description: descriptionMatch ? descriptionMatch[1] : '',
              content: markdownContent,
              tags,
              publishedAt: dateMatch ? dateMatch[1] : new Date().toISOString(),
              status: 'published',
              readingTime: Math.ceil(markdownContent.split(' ').length / 200),
              wordCount: markdownContent.split(' ').length
            };
            
            savedPosts.push(post);
            console.log(`📄 Loaded saved blog post: ${post.title}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error loading blog post from ${file}:`, error);
      }
    });

    return savedPosts;
  } catch (error) {
    console.error('❌ Error loading saved blog posts:', error);
    return [];
  }
}

// Combine hardcoded and saved posts
function getAllPosts(): Post[] {
  const savedPosts = loadSavedBlogPosts();
  return [...savedPosts, ...hardcodedPosts];
}

// Export functions
export function getAllPosts(): Post[] {
  return getAllPosts();
}

export function getPostBySlug(slug: string): Post | undefined {
  const posts = getAllPosts();
  return posts.find(post => post.slug === slug);
}

export function getPostsByTag(tag: string): Post[] {
  const posts = getAllPosts();
  return posts.filter(post => 
    post.tags.some(postTag => 
      postTag.toLowerCase().includes(tag.toLowerCase())
    )
  );
}

export function searchPosts(query: string): Post[] {
  const posts = getAllPosts();
  const lowercaseQuery = query.toLowerCase();
  
  return posts.filter(post => 
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.description.toLowerCase().includes(lowercaseQuery) ||
    post.content.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

export function formatPostDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatReadTime(minutes: number): string {
  return `${minutes} min read`;
}
