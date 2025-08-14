import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

// Mock functions since blogContent utility was removed
const formatPostDate = (date: string) => new Date(date).toLocaleDateString();
const formatReadTime = (minutes: number) => `${minutes} min read`;

interface Post {
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

const getPostBySlug = async (slug: string): Promise<Post | null> => {
  // Mock implementation - return null since we removed the blog storage
  return null;
};

const getAllPosts = async (): Promise<Post[]> => {
  // Mock implementation - return empty array since we removed the blog storage
  return [];
};

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load the specific post
        const foundPost = await getPostBySlug(slug);
        if (!foundPost) {
          setError('Post not found');
          return;
        }

        setPost(foundPost);

        // Load related posts
        const allPosts = await getAllPosts();
        const related = allPosts
          .filter(p => p.id !== foundPost.id)
          .filter(p => p.tags.some(tag => foundPost.tags.includes(tag)))
          .slice(0, 3);

        setRelatedPosts(related);
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">
            {error || 'The blog post you\'re looking for doesn\'t exist.'}
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link to="/" className="hover:text-gray-700">Home</Link>
          </li>
          <li>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li>
            <Link to="/blog" className="hover:text-gray-700">Blog</Link>
          </li>
          <li>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li className="text-gray-900">{post.title}</li>
        </ol>
      </nav>

      {/* Article Header */}
      <article className="mb-12">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="flex items-center space-x-4 text-gray-600 mb-6">
          <span>{formatPostDate(post.publishedAt)}</span>
          <span>•</span>
          <span>{formatReadTime(post.readingTime)}</span>
          <span>•</span>
          <span>{post.wordCount} words</span>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Description */}
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          {post.description}
        </p>

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Social Sharing */}
      <div className="border-t border-gray-200 pt-8 mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this post</h3>
        <div className="flex space-x-4">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Share on Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Share on Facebook
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Share on LinkedIn
          </a>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map(relatedPost => (
              <article key={relatedPost.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    <Link
                      to={`/blog/${relatedPost.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {relatedPost.title}
                    </Link>
                  </h4>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {relatedPost.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatPostDate(relatedPost.publishedAt)}</span>
                    <span>{formatReadTime(relatedPost.readingTime)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Back to Blog */}
      <div className="mt-12 text-center">
        <Link
          to="/blog"
          className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>
      </div>
    </div>
  );
};

export default BlogPost;
