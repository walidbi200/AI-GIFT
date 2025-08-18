import { useState, useEffect, useRef } from 'react';
import type { Post } from '../../types/post';

interface SearchResult {
  id: string;
  type: 'post' | 'draft' | 'page';
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  tags: string[];
  status: 'published' | 'draft' | 'scheduled';
  lastModified: string;
  relevance: number;
}

interface GlobalSearchProps {
  onResultClick?: (result: SearchResult) => void;
}

export function GlobalSearch({ onResultClick }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'post' | 'draft' | 'page',
    status: 'all' as 'all' | 'published' | 'draft' | 'scheduled'
  });
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchPosts = async () => {
      if (!query.trim()) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setShowResults(true);

      try {
        // Fetch posts from API
        const response = await fetch('/api/blog/list');
        if (response.ok) {
          const data = await response.json();
          const posts = data.posts || [];

          // Perform search
          const searchResults = performSearch(posts, query, filters);
          setResults(searchResults);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchPosts, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, filters]);

  const performSearch = (posts: Post[], searchQuery: string, searchFilters: typeof filters): SearchResult[] => {
    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    posts.forEach((post) => {
      // Apply filters
      if (searchFilters.type !== 'all' && searchFilters.type !== 'post') return;
      if (searchFilters.status !== 'all' && post.status !== searchFilters.status) return;

      // Calculate relevance score
      let relevance = 0;
      let matchedContent = '';

      // Title match (highest weight)
      if (post.title.toLowerCase().includes(query)) {
        relevance += 10;
        matchedContent = post.title;
      }

      // Content match
      const contentMatch = post.content.toLowerCase().indexOf(query);
      if (contentMatch !== -1) {
        relevance += 5;
        const start = Math.max(0, contentMatch - 50);
        const end = Math.min(post.content.length, contentMatch + 100);
        matchedContent = post.content.substring(start, end) + '...';
      }

      // Tags match
      if (post.tags.some(tag => tag.toLowerCase().includes(query))) {
        relevance += 3;
      }

      // Excerpt match
      if (post.excerpt && post.excerpt.toLowerCase().includes(query)) {
        relevance += 2;
        if (!matchedContent) {
          matchedContent = post.excerpt;
        }
      }

      if (relevance > 0) {
        results.push({
          id: post.id,
          type: 'post',
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || '',
          slug: post.slug,
          tags: post.tags,
          status: post.status,
          lastModified: post.updatedAt || post.createdAt,
          relevance
        });
      }
    });

    // Sort by relevance and return top results
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setQuery('');
    if (onResultClick) {
      onResultClick(result);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return '📝';
      case 'draft': return '📄';
      case 'page': return '📄';
      default: return '📄';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder="Search posts, drafts, and pages..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && (query.trim() || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
          {/* Filters */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="post">Posts</option>
                <option value="draft">Drafts</option>
                <option value="page">Pages</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="p-2">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-gray-600 dark:text-gray-400">Searching...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">🔍</div>
                <p className="text-gray-600 dark:text-gray-400">
                  {query.trim() ? 'No results found' : 'Start typing to search...'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-lg">{getTypeIcon(result.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {result.title}
                          </h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                            {result.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {result.excerpt || result.content.substring(0, 150) + '...'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>Modified: {new Date(result.lastModified).toLocaleDateString()}</span>
                          {result.tags.length > 0 && (
                            <span>Tags: {result.tags.slice(0, 3).join(', ')}</span>
                          )}
                          <span>Relevance: {result.relevance}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
