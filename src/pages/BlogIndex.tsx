import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// A simple interface for the post objects
interface Post {
  id: number;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  featured_image: string | null;
  created_at: string;
  readingTime: number;
}

const BlogIndex: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Blog - Smart Gift Finder';
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/blog/list');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Posts...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Smart Gift Finder Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover thoughtful gift ideas, expert tips, and inspiration for every occasion.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Posts Yet</h3>
            <p className="text-gray-600">
              There are no blog posts here yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                {post.featured_image && (
                  <Link to={`/blog/${post.slug}`} className="block h-48 overflow-hidden">
                    <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                  </Link>
                )}
                <div className="p-6 flex-grow flex flex-col">
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(post.created_at).toLocaleDateString()} &bull; {post.readingTime} min read
                  </p>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 flex-grow">
                    <Link to={`/blog/${post.slug}`} className="hover:text-indigo-600 transition-colors duration-200">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.description}
                  </p>
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <Link to={`/blog/${post.slug}`} className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
                      Read More &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogIndex;
