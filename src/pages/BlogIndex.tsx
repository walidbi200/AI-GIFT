import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import BlogList from '../components/blog/BlogList';
import { getAllPosts, getPostsByTag, searchPosts } from '../utils/blogContent';
import type { Post } from '../types/post';

const POSTS_PER_PAGE = 9;

const BlogIndex: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get URL parameters
  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedTag = searchParams.get('tag') || '';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    // Update document title for SEO
    document.title = 'Blog - Smart Gift Finder | Gift Ideas & Tips';

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Discover thoughtful gift ideas, tips, and inspiration on the Smart Gift Finder blog. Expert advice for every occasion and recipient.',
      );
    }

    // Load blog posts
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const loadedPosts = getAllPosts();
      setPosts(loadedPosts);
    } catch (err) {
      setError('Failed to load blog posts');
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by search query
    if (searchQuery) {
      filtered = searchPosts(searchQuery);
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(post => post.tags.includes(selectedTag));
    }

    // Posts are already sorted by date (newest first)
    return filtered;
  }, [posts, searchQuery, selectedTag]);

  // Get featured posts (first 3 posts)
  const featuredPosts = useMemo(() => {
    return filteredPosts.slice(0, 3).map(post => ({ ...post, featured: true }));
  }, [filteredPosts]);

  // Get regular posts (excluding featured)
  const regularPosts = useMemo(() => {
    return filteredPosts.slice(3);
  }, [filteredPosts]);

  // Pagination
  const totalPages = Math.ceil(regularPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = regularPosts.slice(startIndex, endIndex);

  // Update URL parameters
  const updateURLParams = (updates: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });

    // Reset to page 1 when changing filters
    if (updates.tag !== undefined || updates.search !== undefined) {
      newSearchParams.delete('page');
    }

    setSearchParams(newSearchParams);
  };

  const handleTagSelect = (tag: string) => {
    updateURLParams({ tag: tag === selectedTag ? null : tag });
  };

  const handleSearchChange = (query: string) => {
    updateURLParams({ search: query || null });
  };

  const handlePageChange = (page: number) => {
    updateURLParams({ page: page.toString() });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Blog</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadPosts}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Smart Gift Finder Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover thoughtful gift ideas, expert tips, and inspiration for every occasion. 
            From birthdays to holidays, we've got you covered with personalized gift recommendations.
          </p>
        </header>

        {/* Blog List Component */}
        <BlogList
          posts={currentPosts}
          featuredPosts={featuredPosts}
          selectedTag={selectedTag}
          searchQuery={searchQuery}
          onTagSelect={handleTagSelect}
          onSearchChange={handleSearchChange}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                // Show first page, last page, current page, and pages around current
                const shouldShow = 
                  page === 1 || 
                  page === totalPages || 
                  Math.abs(page - currentPage) <= 1;

                if (!shouldShow) {
                  // Show ellipsis
                  if (page === 2 || page === totalPages - 1) {
                    return (
                      <span key={page} className="px-3 py-2 text-sm text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === currentPage
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Call to Action */}
        <section className="mt-16 text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Need Personalized Gift Recommendations?</h2>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Our AI-powered gift finder analyzes the recipient's interests, age, and occasion 
              to suggest the perfect gifts. Get started in minutes!
            </p>
            <a
              href="/"
              className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
            >
              🎁 Start Finding Gifts
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BlogIndex;
