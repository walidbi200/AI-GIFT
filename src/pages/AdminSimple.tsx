import React from 'react';

const AdminSimple: React.FC = () => {
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">5</div>
                <div className="text-sm text-gray-500">Blog Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">1,234</div>
                <div className="text-sm text-gray-500">Monthly Visitors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">15</div>
                <div className="text-sm text-gray-500">AI Generations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">89%</div>
                <div className="text-sm text-gray-500">SEO Score</div>
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
                📊 Google Search Console
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminSimple;
