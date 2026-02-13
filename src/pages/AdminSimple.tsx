import React, { useState, useEffect } from 'react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

const AdminSimple: React.FC = () => {
  // Destructure all required values, including isLoading
  const { uniqueVisitors, isLoading: isAnalyticsLoading, refreshData } = useGoogleAnalytics();
  const [blogPostCount, setBlogPostCount] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchBlogStats = async () => {
      setIsLoadingStats(true);
      try {
        const response = await fetch('/api/blog');
        if (response.ok) {
          const data = await response.json();
          setBlogPostCount(Array.isArray(data) ? data.length : 0);
        } else {
          setBlogPostCount(0);
        }
      } catch (error) {
        console.error("Failed to fetch blog stats", error);
        setBlogPostCount(0);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchBlogStats();
  }, []);


  const handleRefresh = () => {
    // Re-fetch both data sources
    const fetchBlogStats = async () => {
      setIsLoadingStats(true);
      try {
        const response = await fetch('/api/blog');
        if (response.ok) {
          const data = await response.json();
          setBlogPostCount(Array.isArray(data) ? data.length : 0);
        }
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchBlogStats();
    refreshData();
  };

  const handleLogout = () => {
    localStorage.removeItem('nextauth.session-token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/login';
  };

  // Safely handle loading state before calling toLocaleString()
  const monthlyVisitorsDisplay = isAnalyticsLoading ? '...' : (uniqueVisitors || 0).toLocaleString();
  const thisMonthVisitors = isAnalyticsLoading ? '...' : (uniqueVisitors || 0).toLocaleString();
  const thisWeekVisitors = isAnalyticsLoading ? '...' : Math.round((uniqueVisitors || 0) / 4).toLocaleString();
  const blogPostCountDisplay = isLoadingStats ? '...' : blogPostCount;


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
              <button onClick={handleRefresh} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <svg className={`w-4 h-4 ${(isAnalyticsLoading || isLoadingStats) ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001a7.5 7.5 0 0 1-1.08 3.916m-1.08 3.916a7.5 7.5 0 0 1-3.916 1.08m-3.916-1.08a7.5 7.5 0 0 1-3.916-1.08m0 0a7.5 7.5 0 0 1-1.08-3.916m1.08-3.916a7.5 7.5 0 0 1 1.08-3.916m3.916-1.08a7.5 7.5 0 0 1 3.916 1.08m-3.916 1.08a7.5 7.5 0 0 1 3.916 1.08" />
                </svg>
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {blogPostCountDisplay}
                </div>
                <div className="text-sm text-gray-500 mt-1">Blog Posts</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {monthlyVisitorsDisplay}
                </div>
                <div className="text-sm text-gray-500 mt-1">Monthly Visitors</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{thisMonthVisitors}</div>
                <div className="text-sm text-gray-500 mt-1">This Month</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">{thisWeekVisitors}</div>
                <div className="text-sm text-gray-500 mt-1">This Week</div>
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
                onClick={() => window.open('https://analytics.google.com/', '_blank')}
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
