import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../Button';
import Toast from '../Toast';
import type { ToastType } from '../../types';
import { BlogEditor } from './BlogEditor';
import { BulkContentGenerator } from './BulkContentGenerator';
import { SEODashboard } from './SEODashboard';
import { EnhancedSEODashboard } from './EnhancedSEODashboard';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { Sidebar } from './Sidebar';
import { DashboardCard } from './DashboardCard';
import { UserManagement } from './UserManagement';
import { BackupSecurity } from './BackupSecurity';
import { GlobalSearch } from './GlobalSearch';
import BlogList from './BlogList';
import BlogGenerator from './BlogGenerator';
import BlogErrorBoundary from '../BlogErrorBoundary';
import { useSession, signOut } from '../../hooks/useNextAuth';

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

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'writer';
  status: 'active' | 'inactive';
  lastLogin: string;
  permissions: string[];
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const user: User = {
    id: '1',
    name: session?.user?.name || 'Admin',
    email: session?.user?.email || 'admin@example.com',
    role: 'admin',
    status: 'active',
    lastLogin: new Date().toISOString(),
    permissions: ['content.create', 'content.edit', 'content.delete', 'content.publish', 'analytics.view', 'seo.manage', 'users.manage', 'settings.manage', 'backup.manage']
  };
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    generateMockNotifications();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Mock blog stats since we removed the blog content utilities
      const stats: BlogStats = {
        totalPosts: 5,
        totalViews: 1250,
        averageReadingTime: 4,
        topPerformingPosts: [
          { title: 'Sample Blog Post 1', views: 450, readingTime: 5 },
          { title: 'Sample Blog Post 2', views: 320, readingTime: 3 },
          { title: 'Sample Blog Post 3', views: 280, readingTime: 4 }
        ]
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

  const generateMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: 'New Blog Post Published',
        message: 'Your blog post "Tech Gifts Guide" has been successfully published.',
        timestamp: new Date().toISOString(),
        isRead: false
      },
      {
        id: '2',
        type: 'warning',
        title: 'SEO Score Alert',
        message: '3 blog posts have SEO scores below 70. Consider optimizing them.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: false
      },
      {
        id: '3',
        type: 'success',
        title: 'Backup Completed',
        message: 'Database backup completed successfully. Size: 2.4 MB',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isRead: true
      }
    ];
    setNotifications(mockNotifications);
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

  const handleNotificationClick = (notificationId: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    ));
  };

  const handleSearchResultClick = (result: any) => {
    // Navigate to the selected post or handle the result
    console.log('Search result clicked:', result);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Posts"
          value={blogStats.totalPosts}
          subtitle="Published content"
          icon="📝"
          onClick={() => setActiveTab('blog-list')}
        />
        <DashboardCard
          title="Total Views"
          value={blogStats.totalViews.toLocaleString()}
          subtitle="Page views this month"
          icon="👁️"
          trend={{ value: 12, isPositive: true }}
          onClick={() => setActiveTab('analytics')}
        />
        <DashboardCard
          title="AI Generated"
          value={aiStats.totalGenerated}
          subtitle="Content pieces"
          icon="🤖"
          variant="info"
          onClick={() => setActiveTab('ai-generator')}
        />
        <DashboardCard
          title="Avg Quality"
          value={`${aiStats.averageQuality}%`}
          subtitle="Content quality score"
          icon="⭐"
          variant="success"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performing Posts</h3>
          <div className="space-y-3">
            {blogStats.topPerformingPosts.map((post, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{post.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{post.views} views • {post.readingTime} min read</p>
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Generation Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Tokens Used:</span>
              <span className="font-medium text-gray-900 dark:text-white">{aiStats.totalTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Estimated Cost:</span>
              <span className="font-medium text-gray-900 dark:text-white">${aiStats.estimatedCost}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average Quality Score:</span>
              <span className="font-medium text-green-600 dark:text-green-400">{aiStats.averageQuality}%</span>
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Content Management</h2>
        <Button
          onClick={() => setActiveTab('ai-generator')}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Create New Post
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">All Blog Posts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Reading Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {/* Mock data for content management */}
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Sample Post {i}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Description for Sample Post {i}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    5 min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Published
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Edit</button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
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

  const renderAnalytics = () => {
    return <AnalyticsDashboard />;
  };

  const renderSEOMonitor = () => (
    <SEODashboard />
  );

  const renderEnhancedSEO = () => (
    <EnhancedSEODashboard />
  );

  const renderBlogEditor = () => (
    <BlogErrorBoundary>
      <BlogEditor />
    </BlogErrorBoundary>
  );

  const renderBulkGenerator = () => (
    <BlogErrorBoundary>
      <BulkContentGenerator />
    </BlogErrorBoundary>
  );

  const renderAIGenerator = () => (
    <BlogErrorBoundary>
      <BlogGenerator />
    </BlogErrorBoundary>
  );

  const renderBlogList = () => (
    <BlogErrorBoundary>
      <BlogList />
    </BlogErrorBoundary>
  );

  const renderUserManagement = () => (
    <UserManagement currentUser={user} />
  );

  const renderBackupSecurity = () => (
    <BackupSecurity />
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
      case 'analytics':
        return renderAnalytics();
      case 'seo':
        return renderSEOMonitor();
      case 'enhanced-seo':
        return renderEnhancedSEO();
      case 'blog-list':
        return renderBlogList();
      case 'users':
        return renderUserManagement();
      case 'backup-security':
        return renderBackupSecurity();
      default:
        return renderOverview();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Global Search */}
              <GlobalSearch onResultClick={handleSearchResultClick} />
              
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Welcome, {user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
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
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
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
