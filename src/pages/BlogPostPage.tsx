import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

// Interface for a single blog post
interface Post {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  featured_image: string | null;
  created_at: string;
  readingTime: number;
  primary_keyword: string;
}

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      navigate('/404');
      return;
    }

    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/blog/post?slug=${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            navigate('/404');
          }
          throw new Error('Failed to fetch post data.');
        }

        const data = await response.json();
        setPost(data.post);
        document.title = `${data.post.title} - Smart Gift Finder`;

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug, navigate]);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-red-600">Error</h2>
            <p className="text-gray-600 mt-2">{error || "Could not load the blog post."}</p>
            <Link to="/blog" className="mt-4 inline-block text-indigo-600 hover:underline">
                &larr; Back to Blog
            </Link>
        </div>
    );
  }

  return (
    <div className="bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <article>
          <header className="mb-8">
            <div className="mb-4">
                <Link to="/blog" className="text-indigo-600 hover:underline text-sm font-semibold">
                    &larr; Back to all posts
                </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-lg text-gray-500">
              {post.description}
            </p>
            <div className="mt-4 text-sm text-gray-500">
              <span>Published on {new Date(post.created_at).toLocaleDateString()}</span>
              <span className="mx-2">&bull;</span>
              <span>{post.readingTime} min read</span>
            </div>
          </header>

          {post.featured_image && (
            <div className="mb-8">
              <img src={post.featured_image} alt={post.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-lg" />
            </div>
          )}

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <footer className="mt-12 pt-8 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
};

export default BlogPostPage;
