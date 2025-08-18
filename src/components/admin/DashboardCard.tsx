import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
}

export function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  onClick,
  variant = 'default',
  loading = false
}: DashboardCardProps) {
  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getIconColors = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    }
  };

  return (
    <div
      className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${
        getVariantColors()
      } ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className={`p-2 rounded-lg ${getIconColors()}`}>
              <span className="text-xl">{icon}</span>
            </div>
            {trend && (
              <div className={`ml-2 flex items-center text-sm font-medium ${
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                <span>{trend.isPositive ? '↗' : '↘'}</span>
                <span className="ml-1">{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </h3>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
              {subtitle && (
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              )}
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
