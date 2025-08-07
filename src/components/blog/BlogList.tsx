import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../../types/post';
import { formatPostDate, formatReadTime } from '../../utils/blogContent';

interface BlogListProps {
  posts: Post[];
  featuredPosts?: Post[];
  selectedTag?: string;
  searchQuery?: string;
  onTagSelect?: (tag: string) => void;
  onSearchChange?: (query: string) => void;
}

const BlogList: React.FC<BlogListProps> = ({
  posts,
  featuredPosts = [],
  selectedTag,
  searchQuery = '',
  onTagSelect,
  onSearchChange,
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Get all unique tags from posts
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [posts]);

  // Filter posts based on search query and selected tag
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = localSearchQuery === '' || 
        post.title.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(localSearchQuery.toLowerCase()));
      
      const matchesTag = !selectedTag || post.tags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    });
  }, [posts, localSearchQuery, selectedTag]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    onSearchChange?.(query);
  };

  const handleTagClick = (tag: string) => {
    onTagSelect?.(tag);
  };

  const clearFilters = () => {
    setLocalSearchQuery('');
    onSearchChange?.('');
    onTagSelect?.('');
  };

  return (
    <div className="space-y-8">
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Posts
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={localSearchQuery}
                onChange={handleSearchChange}
                placeholder="Search by title, description, or tags..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(localSearchQuery || selectedTag) && (
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                    selectedTag === tag
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredPosts.map((post) => (
              <FeaturedPostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* All Posts Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedTag ? `Posts tagged "${selectedTag}"` : 'All Posts'}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

// Individual Post Card Component
const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <Link to={`/blog/${post.slug}`} className="block">
        {/* Post Image */}
        <div className="aspect-video bg-gray-200 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `
                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                  <div class="text-center">
                    <div class="text-4xl mb-2">📝</div>
                    <div class="text-sm text-gray-600 font-medium">Blog Post</div>
                  </div>
                </div>
              `;
            }}
          />
        </div>

        {/* Post Content */}
        <div className="p-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                +{post.tags.length - 3}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600 transition-colors">
            {post.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-3">
            {post.description}
          </p>

          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>{post.author}</span>
              <span>{formatPostDate(post.date)}</span>
            </div>
            <span>{formatReadTime(post.readTime)}</span>
          </div>
        </div>
      </Link>
    </article>
  );
};

// Featured Post Card Component (larger, more prominent)
const FeaturedPostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <Link to={`/blog/${post.slug}`} className="block">
        {/* Featured Badge */}
        <div className="relative">
          <div className="aspect-video bg-gray-200 overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                    <div class="text-center">
                      <div class="text-4xl mb-2">⭐</div>
                      <div class="text-sm text-gray-600 font-medium">Featured</div>
                    </div>
                  </div>
                `;
              }}
            />
          </div>
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-xs font-bold bg-yellow-400 text-yellow-900 rounded-full">
              Featured
            </span>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600 transition-colors">
            {post.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-3">
            {post.description}
          </p>

          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>{post.author}</span>
              <span>{formatPostDate(post.date)}</span>
            </div>
            <span>{formatReadTime(post.readTime)}</span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default BlogList;
