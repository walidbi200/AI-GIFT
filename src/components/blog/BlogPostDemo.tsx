import React from 'react';
import BlogPost from './BlogPost';
import type { BlogPost as BlogPostType } from '../../types/blog';

const BlogPostDemo: React.FC = () => {
  // Sample blog post data to demonstrate the Medium-style layout
  const sampleBlog: BlogPostType = {
    id: 1,
    slug: 'top-gifts-for-gamers-under-30',
    title: 'Top Gifts for Gamers Under $30',
    description: 'Discover the best gifts for gamers under $30 with our top picks. Perfect for any budget!',
    content: `
      <h2>Introduction</h2>
      <p>Finding the perfect gift for a gamer doesn't have to break the bank. In this guide, we'll explore some of the best gaming accessories and gadgets that cost less than $30, perfect for birthdays, holidays, or just because.</p>
      
      <h2>LED Gaming Mouse Pad</h2>
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
        <p>An LED Gaming Mouse Pad is a fantastic addition to any gamer's setup. These colorful mouse pads not only look great but also provide a smooth surface for precise mouse movements. Many models feature customizable RGB lighting and come in various sizes to fit different desk setups.</p>
      </div>
      
      <h2>Gaming Keycap Set</h2>
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
        <p>A Gaming Keycap Set is an excellent way to personalize a gaming keyboard without spending hundreds on a new one. These sets often include special gaming-focused keys like WASD, arrow keys, and function keys with unique designs and colors.</p>
      </div>
      
      <h2>Virtual Reality Viewer</h2>
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
        <p>Affordable VR headsets allow gamers to explore immersive experiences without the high cost of premium VR systems. These budget-friendly options work with smartphones and provide a great introduction to virtual reality gaming.</p>
      </div>
      
      <h2>Gaming Headset Stand</h2>
      <p>A gaming headset stand is both practical and stylish. It keeps the desk organized while displaying the headset like a piece of gaming art. Many stands include USB ports for charging devices and RGB lighting for that extra gaming aesthetic.</p>
      
      <h2>Conclusion</h2>
      <p>Gaming gifts under $30 can be just as thoughtful and useful as more expensive options. The key is choosing items that enhance the gaming experience while fitting within your budget. These suggestions should help you find the perfect gift for any gamer in your life.</p>
    `,
    tags: ['gaming', 'gifts', 'budget', 'accessories', 'tech'],
    primaryKeyword: 'gaming gifts',
    secondaryKeywords: ['budget gifts', 'gaming accessories'],
    targetAudience: 'Gamers and gift-givers',
    toneOfVoice: 'Friendly and informative',
    featuredImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop',
    galleryImages: [],
    wordCount: 450,
    status: 'published',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  };

  const relatedPosts: BlogPostType[] = [
    {
      id: 2,
      slug: 'best-tech-gifts-2025',
      title: 'Best Tech Gifts in 2025',
      description: 'Discover the top gadgets and tech gifts that will impress everyone this year.',
      content: '',
      tags: ['tech', 'gifts', '2025'],
      primaryKeyword: 'tech gifts',
      wordCount: 300,
      status: 'published',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z'
    },
    {
      id: 3,
      slug: 'gamer-desk-setup-guide',
      title: 'Gamer Desk Setup Guide',
      description: 'Learn how to create the perfect gaming workspace with our comprehensive setup guide.',
      content: '',
      tags: ['gaming', 'setup', 'desk'],
      primaryKeyword: 'gaming setup',
      wordCount: 350,
      status: 'published',
      createdAt: '2024-01-05T10:00:00Z',
      updatedAt: '2024-01-05T10:00:00Z'
    },
    {
      id: 4,
      slug: 'affordable-vr-gear',
      title: 'Affordable VR Gear',
      description: 'Get into VR without breaking the bank with these budget-friendly options.',
      content: '',
      tags: ['vr', 'budget', 'gaming'],
      primaryKeyword: 'affordable vr',
      wordCount: 280,
      status: 'published',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    }
  ];

  const previousPost = {
    slug: 'previous-gaming-post',
    title: 'Previous Gaming Post'
  };

  const nextPost = {
    slug: 'next-gaming-post',
    title: 'Next Gaming Post'
  };

  return (
    <BlogPost 
      blog={sampleBlog}
      relatedPosts={relatedPosts}
      previousPost={previousPost}
      nextPost={nextPost}
    />
  );
};

export default BlogPostDemo;
