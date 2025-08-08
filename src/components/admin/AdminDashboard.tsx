import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../Button';
import Toast from '../Toast';
import type { ToastType } from '../../types';
import { getAllPosts } from '../../utils/blogContent';
import { BlogEditor } from './BlogEditor';
import { BulkContentGenerator } from './BulkContentGenerator';
import { SEODashboard } from './SEODashboard';
import SaveToBlog from './SaveToBlog';
import { useSession, signOut } from '../../hooks/useNextAuth';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';

interface BlogStats {
  totalPosts: number;
  totalViews: number;
  averageReadingTime: number;
  topPerformingPosts: Array<{
    title: string;
    views: number;
    readingTime: number;
  }>;
}

interface AIGenerationStats {
  totalGenerated: number;
  averageQuality: number;
  totalTokens: number;
  estimatedCost: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const user = session?.user?.name || 'Admin';
  const [activeTab, setActiveTab] = useState('overview');
  const [blogStats, setBlogStats] = useState<BlogStats>({
    totalPosts: 0,
    totalViews: 0,
    averageReadingTime: 0,
    topPerformingPosts: []
  });
  const [aiStats, setAiStats] = useState<AIGenerationStats>({
    totalGenerated: 0,
    averageQuality: 0,
    totalTokens: 0,
    estimatedCost: 0
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load blog posts
      const posts = getAllPosts();
      
      // Calculate blog stats (mock data for now)
      const stats: BlogStats = {
        totalPosts: posts.length,
        totalViews: posts.reduce((sum, _post) => sum + (Math.floor(Math.random() * 1000) + 100), 0),
        averageReadingTime: Math.round(posts.reduce((sum, post) => sum + post.readTime, 0) / posts.length),
        topPerformingPosts: posts.slice(0, 5).map(post => ({
          title: post.title,
          views: Math.floor(Math.random() * 1000) + 100,
          readingTime: post.readTime
        })).sort((a, b) => b.views - a.views)
      };

      // Mock AI stats
      const aiStats: AIGenerationStats = {
        totalGenerated: 12,
        averageQuality: 87,
        totalTokens: 45000,
        estimatedCost: 0.45
      };

      setBlogStats(stats);
      setAiStats(aiStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showToastMessage('Failed to load dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToastMessage = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
    showToastMessage('Logged out successfully', 'success');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'content', label: 'Content Management', icon: '📝' },
    { id: 'blog-editor', label: 'Blog Editor', icon: '✏️' },
    { id: 'bulk-generator', label: 'Bulk Generator', icon: '📦' },
    { id: 'ai-generator', label: 'AI Generator', icon: '🤖' },
    { id: 'save-to-blog', label: 'Save to Blog', icon: '💾' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'seo', label: 'SEO Monitor', icon: '🔍' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{blogStats.totalPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">👁️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{blogStats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">AI Generated</p>
              <p className="text-2xl font-bold text-gray-900">{aiStats.totalGenerated}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Quality</p>
              <p className="text-2xl font-bold text-gray-900">{aiStats.averageQuality}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Posts</h3>
          <div className="space-y-3">
            {blogStats.topPerformingPosts.map((post, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 truncate">{post.title}</p>
                  <p className="text-sm text-gray-600">{post.views} views • {post.readingTime} min read</p>
                </div>
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Generation Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Tokens Used:</span>
              <span className="font-medium">{aiStats.totalTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Estimated Cost:</span>
              <span className="font-medium">${aiStats.estimatedCost}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Quality Score:</span>
              <span className="font-medium text-green-600">{aiStats.averageQuality}%</span>
            </div>
            <div className="pt-4">
              <Button
                onClick={() => setActiveTab('ai-generator')}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                Generate New Content
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Content Management</h2>
        <Button
          onClick={() => setActiveTab('ai-generator')}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Create New Post
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Blog Posts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reading Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getAllPosts().map((post, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                    <div className="text-sm text-gray-500">{post.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.readTime} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Published
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAIGenerator = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">AI Blog Generation Tools</h2>
        <p className="text-blue-700 mb-4">
          Create high-quality, SEO-optimized blog posts using our AI-powered content generators.
        </p>
        <div className="flex gap-4">
          <Link
            to="/admin/blog-generator"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <span className="mr-2">🤖</span>
            Quick Blog Generator
          </Link>
          <Link
            to="/admin/save-to-blog"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <span className="mr-2">💾</span>
            Save to Blog
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Generation</h3>
          <div className="space-y-3">
            <Button className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200">
              🎄 Christmas Gift Guide
            </Button>
            <Button className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200">
              💝 Valentine's Day Ideas
            </Button>
            <Button className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200">
              🎓 Graduation Gifts
            </Button>
            <Button className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200">
              🏠 Housewarming Gifts
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation History</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Tech Gifts for Professionals</p>
                <p className="text-sm text-gray-600">2 hours ago</p>
              </div>
              <span className="text-sm font-medium text-green-600">87% Quality</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Budget-Friendly Gift Ideas</p>
                <p className="text-sm text-gray-600">1 day ago</p>
              </div>
              <span className="text-sm font-medium text-green-600">92% Quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    const analytics = useGoogleAnalytics();
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
          <Button
            onClick={analytics.refreshData}
            disabled={analytics.isLoading}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {analytics.isLoading ? 'Loading...' : 'Refresh Data'}
          </Button>
        </div>
        
        {analytics.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{analytics.error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Overview</h3>
            {analytics.isLoading ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Page Views (30 days)</span>
                  <span className="font-medium">{analytics.pageViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Unique Visitors</span>
                  <span className="font-medium">{analytics.uniqueVisitors.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg. Session Duration</span>
                  <span className="font-medium">{Math.floor(analytics.sessionDuration / 60)}m {analytics.sessionDuration % 60}s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bounce Rate</span>
                  <span className={`font-medium ${analytics.bounceRate < 30 ? 'text-green-600' : analytics.bounceRate < 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {analytics.bounceRate}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
            {analytics.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.topPages.map((page, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate">{page.title}</p>
                      <p className="text-sm text-gray-600">{page.path}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-500">{page.views.toLocaleString()} views</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSEOMonitor = () => (
    <SEODashboard />
  );

  const renderBlogEditor = () => (
    <BlogEditor
      onSave={(post) => {
        showToastMessage('Blog post saved successfully!', 'success');
        console.log('Saved post:', post);
      }}
      onPublish={(post) => {
        showToastMessage('Blog post published successfully!', 'success');
        console.log('Published post:', post);
      }}
    />
  );

  const renderBulkGenerator = () => (
    <BulkContentGenerator />
  );

  const renderSaveToBlog = () => (
    <SaveToBlog />
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'content':
        return renderContentManagement();
      case 'blog-editor':
        return renderBlogEditor();
      case 'bulk-generator':
        return renderBulkGenerator();
      case 'ai-generator':
        return renderAIGenerator();
      case 'save-to-blog':
        return renderSaveToBlog();
      case 'analytics':
        return renderAnalytics();
      case 'seo':
        return renderSEOMonitor();
      default:
        return renderOverview();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your blog content and AI generation</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Welcome, {user}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
