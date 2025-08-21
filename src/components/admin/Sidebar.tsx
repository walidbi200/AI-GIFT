import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  notifications: Notification[];
  onNotificationClick: (id: string) => void;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: '📊', path: '/admin' },
  { id: 'content', label: 'Content', icon: '📝', path: '/admin/content' },
  { id: 'blog-editor', label: 'Blog Editor', icon: '✏️', path: '/admin/blog-editor' },
  { id: 'bulk-generator', label: 'Bulk Generator', icon: '📦', path: '/admin/bulk-generator' },
  { id: 'ai-generator', label: 'AI Generator', icon: '🤖', path: '/admin/ai-generator' },
  { id: 'analytics', label: 'Analytics', icon: '📈', path: '/admin/analytics' },
  { id: 'seo', label: 'SEO Tools', icon: '🔍', path: '/admin/seo' },
  { id: 'enhanced-seo', label: 'Enhanced SEO', icon: '⚡', path: '/admin/enhanced-seo' },
  { id: 'media', label: 'Media Library', icon: '🖼️', path: '/admin/media' },
  { id: 'blog-list', label: 'Blog List', icon: '📋', path: '/admin/blog-list' },
  { id: 'users', label: 'User Management', icon: '👥', path: '/admin/users' },
  { id: 'backup-security', label: 'Backup & Security', icon: '🔒', path: '/admin/backup-security' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/admin/settings' },
];

export function Sidebar({ isCollapsed, onToggle, notifications, onNotificationClick }: SidebarProps) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500 bg-green-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'error': return 'border-red-500 bg-red-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Admin Panel
          </h2>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Notification Center */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-full flex items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
          >
            <span className="text-lg">🔔</span>
            {!isCollapsed && <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</span>}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
              </div>
              <div className="p-2">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No notifications
                  </p>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => onNotificationClick(notification.id)}
                      className={`p-3 rounded-lg border-l-4 cursor-pointer transition-colors ${
                        getNotificationColor(notification.type)
                      } ${!notification.isRead ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                    >
                      <div className="flex items-start">
                        <span className="text-sm mr-2">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
