import React from 'react';
import { Link } from 'react-router-dom';

// This is a placeholder for your future blog posts
const blogPosts = [
  { slug: 'tested-switch-accessories', title: 'I Tested 10 Switch Accessories: Here Are the 3 That Are Actually Worth the Money', excerpt: 'To save you the trouble, I bought and tested 10 of the most popular Nintendo Switch accessories. Here are the winners.' },
  { slug: 'unique-gifts-for-gamers', title: 'My Experience Gifting These 5 Unique Items to a Lifelong Gamer', excerpt: 'Finding a truly unique gift for a gamer is tough. I went on a mission to find 5 items that arent just another headset or mousepad.' }
];

const BlogPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {blogPosts.map((post) => (
        <article key={post.slug} className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-md border border-light-border dark:border-dark-border">
          <h2 className="text-2xl font-bold mb-2">
            <Link to={`/blog/${post.slug}`} className="text-light-text-primary dark:text-dark-text-primary hover:text-light-primary dark:hover:text-dark-primary transition-colors">
              {post.title}
            </Link>
          </h2>
          <p className="text-light-text-muted dark:text-dark-text-muted">{post.excerpt}</p>
          <Link to={`/blog/${post.slug}`} className="text-light-primary dark:text-dark-primary font-semibold mt-4 inline-block">
            Read More &rarr;
          </Link>
        </article>
      ))}
    </div>
  );
};

export default BlogPage; 