import React, { useState, useEffect } from 'react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

interface BlogStats {
  totalPosts: number;
  monthlyPosts: number;
  weeklyPosts: number;
}

const AdminSimple: React.FC = () => {
  const [blogStats, setBlogStats] = useState<BlogStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  const { uniqueVisitors, isLoading: isAnalyticsLoading } = useGoogleAnalytics();

  // Fetch blog statistics from the API
  const fetchBlogStats = async () => {
    try {
      setIsLoadingStats(true);
      setStatsError(null);
      
      const response = await fetch('/api/blog/stats');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setBlogStats(data.stats);
      } else {
        throw new Error(data.error || 'Failed to fetch blog stats');
      }
    } catch (error) {
      console.error('Error fetching blog stats:', error);
      setStatsError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Load blog stats on component mount
  useEffect(() => {
    fetchBlogStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nextauth.session-token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Admin</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Status Card */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800">
                  Admin Panel Active! 🎉
                </h3>
                <p className="text-green-700">
                  Authentication successful. All systems operational.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Blog Generator Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">AI</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        AI Blog Generator
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Create Content
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => window.open('/admin/blog-generator', '_blank')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Generate Blog Post
                  </button>
                </div>
              </div>
            </div>

            {/* Blog Management Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">📝</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Blog Posts
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Manage Content
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => window.location.href = '/blog'}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                  >
                    View Blog
                  </button>
                </div>
              </div>
            </div>

            {/* SEO Tools Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">📊</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        SEO Dashboard
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Optimize Content
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => window.open('/admin/seo-dashboard', '_blank')}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
                  >
                    Open SEO Tools
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Quick Stats</h3>
              <button
                onClick={fetchBlogStats}
                disabled={isLoadingStats}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {isLoadingStats ? 'Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
            
            {statsError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                Error loading stats: {statsError}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {isLoadingStats ? '...' : blogStats?.totalPosts || 0}
                </div>
                <div className="text-sm text-gray-500">Blog Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {isAnalyticsLoading ? '...' : uniqueVisitors.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Monthly Visitors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {isLoadingStats ? '...' : blogStats?.monthlyPosts || 0}
                </div>
                <div className="text-sm text-gray-500">This Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {isLoadingStats ? '...' : blogStats?.weeklyPosts || 0}
                </div>
                <div className="text-sm text-gray-500">This Week</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full text-left px-4 py-3 bg-gray-50 rounded hover:bg-gray-100"
              >
                🏠 View Homepage
              </button>
              <button
                onClick={() => window.location.href = '/blog'}
                className="w-full text-left px-4 py-3 bg-gray-50 rounded hover:bg-gray-100"
              >
                📖 Browse Blog Posts
              </button>
              <button
                onClick={() => window.open('https://vercel.com/dashboard', '_blank')}
                className="w-full text-left px-4 py-3 bg-gray-50 rounded hover:bg-gray-100"
              >
                🚀 Vercel Dashboard
              </button>
              <button
                onClick={() => window.open('https://console.cloud.google.com', '_blank')}
                className="w-full text-left px-4 py-3 bg-gray-50 rounded hover:bg-gray-100"
              >
                📊 Google Analytics
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSimple;
