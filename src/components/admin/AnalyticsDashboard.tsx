import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  sessionDuration: number;
  bounceRate: number;
  sessions: number;
  topPages: Array<{
    path: string;
    title: string;
    views: number;
  }>;
  recentActivity: Array<{
    timestamp: string;
    action: string;
    page?: string;
    occasion?: string;
    post?: string;
  }>;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
}

export function AnalyticsDashboard() {
  const { uniqueVisitors, isLoading, error, refreshData } = useGoogleAnalytics();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    if (uniqueVisitors) {
      // Mock data for now since the hook doesn't return the expected structure
      const mockData: AnalyticsData = {
        pageViews: 1250,
        uniqueVisitors: uniqueVisitors,
        sessionDuration: 180,
        bounceRate: 45,
        sessions: 800,
        topPages: [
          { path: '/', title: 'Home', views: 500 },
          { path: '/blog', title: 'Blog', views: 300 },
          { path: '/blog/tech-gifts', title: 'Tech Gifts', views: 200 }
        ],
        recentActivity: [
          { timestamp: new Date().toISOString(), action: 'page_view', page: '/' },
          { timestamp: new Date(Date.now() - 300000).toISOString(), action: 'gift_generation', occasion: 'birthday' }
        ]
      };
      setAnalyticsData(mockData);
      generateAlerts(mockData);
    }
  }, [uniqueVisitors]);

  const generateAlerts = (data: AnalyticsData) => {
    const newAlerts: Alert[] = [];

    // Traffic spike/drop alerts
    if (data.pageViews > 1000) {
      newAlerts.push({
        id: 'traffic-spike',
        type: 'success',
        title: 'Traffic Spike Detected',
        message: `Page views increased to ${data.pageViews.toLocaleString()} in the last period`,
        timestamp: new Date().toISOString(),
      });
    }

    if (data.bounceRate > 70) {
      newAlerts.push({
        id: 'high-bounce',
        type: 'warning',
        title: 'High Bounce Rate',
        message: `Bounce rate is ${data.bounceRate}% - consider improving content engagement`,
        timestamp: new Date().toISOString(),
      });
    }

    if (data.sessionDuration < 60) {
      newAlerts.push({
        id: 'low-engagement',
        type: 'warning',
        title: 'Low Session Duration',
        message: `Average session duration is ${data.sessionDuration}s - content may need improvement`,
        timestamp: new Date().toISOString(),
      });
    }

    setAlerts(newAlerts);
  };

  const exportReport = () => {
    if (!analyticsData) return;

    const reportData = {
      generatedAt: new Date().toISOString(),
      timeframe: selectedTimeframe,
      metrics: {
        pageViews: analyticsData.pageViews,
        uniqueVisitors: analyticsData.uniqueVisitors,
        sessionDuration: analyticsData.sessionDuration,
        bounceRate: analyticsData.bounceRate,
        sessions: analyticsData.sessions,
      },
      topPages: analyticsData.topPages,
      alerts: alerts,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Chart configurations
  const trafficData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Page Views',
        data: [1200, 1900, 1600, 2400],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Unique Visitors',
        data: [800, 1200, 1100, 1600],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const topPagesData = {
    labels: analyticsData?.topPages.map(page => page.title.substring(0, 20)) || [],
    datasets: [
      {
        label: 'Page Views',
        data: analyticsData?.topPages.map(page => page.views) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const trafficSourcesData = {
    labels: ['Organic Search', 'Direct', 'Social Media', 'Referral', 'Email'],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-600 mr-3">⚠️</div>
          <div>
            <h3 className="text-lg font-medium text-red-800">Analytics Error</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={refreshData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Data-driven insights for your content strategy</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={exportReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Export Report
          </button>
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Alerts
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Alerts Panel */}
      {showAlerts && alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'success' ? 'bg-green-50 border-green-400' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  alert.type === 'error' ? 'bg-red-50 border-red-400' :
                  'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {alert.type === 'success' && '✅'}
                    {alert.type === 'warning' && '⚠️'}
                    {alert.type === 'error' && '❌'}
                    {alert.type === 'info' && 'ℹ️'}
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Page Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData?.pageViews.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData?.uniqueVisitors.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Session</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData?.sessionDuration || '0'}s
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData?.bounceRate || '0'}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Trends</h3>
          <Line data={trafficData} options={chartOptions} />
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Pages</h3>
          <Bar data={topPagesData} options={chartOptions} />
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
        <div className="max-w-md mx-auto">
          <Doughnut data={trafficSourcesData} options={chartOptions} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {analyticsData?.recentActivity.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  {activity.action === 'page_view' && `Page viewed: ${activity.page}`}
                  {activity.action === 'gift_generation' && `Gift generated for: ${activity.occasion}`}
                  {activity.action === 'blog_view' && `Blog post viewed: ${activity.post}`}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
