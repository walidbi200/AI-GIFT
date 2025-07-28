import React from 'react';
import { useParams } from 'react-router-dom';
import BlogLayout from '../layouts/BlogLayout';
import { Helmet } from 'react-helmet-async';

// Import Contentlayer types with fallback
let allPosts: any[] = [];
let Post: any;

try {
  const contentlayer = require('@/.contentlayer/generated');
  allPosts = contentlayer.allPosts || [];
  Post = contentlayer.Post;
} catch {
  // Fallback if Contentlayer hasn't generated content yet
  console.log('Contentlayer content not yet generated. Please run: npm run content:build');
}

// This component will render the body of the post
const PostBody: React.FC<{ code: string }> = ({ code }) => {
  return <div dangerouslySetInnerHTML={{ __html: code }} />;
};

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = allPosts.find((p: any) => p.slug === slug);

  if (!post) {
    return (
      <BlogLayout>
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post not found!</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <a 
            href="/blog" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Blog
          </a>
        </div>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout>
      <Helmet>
        <title>{post.title} - Smart Gift Finder</title>
        <meta name="description" content={post.description} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.date} />
        {post.tags?.map((tag: string) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
      </Helmet>
      
      <article className="prose lg:prose-xl max-w-none">
        <header className="mb-12 text-center">
          <div className="mb-6">
            {post.tags?.map((tag: string) => (
              <span key={tag} className="inline-block text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full mr-2 mb-2">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>
          <p className="text-2xl text-gray-600 mb-6 leading-relaxed max-w-4xl mx-auto">{post.description}</p>
          <div className="flex items-center justify-center space-x-4 text-lg text-gray-500">
            <span>By {post.author}</span>
            <span>•</span>
            <span>{new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
        </header>
        
        {/* Featured Image */}
        {post.image && (
          <div className="mb-12">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}
        
        {/* Post Content */}
        <div className="prose lg:prose-xl max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900">
          <PostBody code={post.body?.html || post.content || ''} />
        </div>
      </article>
    </BlogLayout>
  );
};

export default BlogPost;
