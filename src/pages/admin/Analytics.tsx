import { useEffect, useState } from 'react';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalVisitors: 0,
    affiliateClicks: 0,
    emailSignups: 0,
    avgTimeOnPage: 0,
    topPages: [],
    trafficSources: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/analytics/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading)
    return <div className="p-12 text-center">Loading analytics...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total Page Views</div>
          <div className="text-3xl font-bold">{stats.totalVisitors}</div>
          <div className="text-sm text-green-600">--</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Affiliate Clicks</div>
          <div className="text-3xl font-bold">{stats.affiliateClicks}</div>
          <div className="text-sm text-gray-600">
            {stats.totalVisitors > 0
              ? ((stats.affiliateClicks / stats.totalVisitors) * 100).toFixed(1)
              : 0}
            % click-through
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Avg Time on Page</div>
          <div className="text-3xl font-bold">
            {formatTime(stats.avgTimeOnPage)}
          </div>
          <div className="text-sm text-green-600">--</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Email Signups</div>
          <div className="text-3xl font-bold">{stats.emailSignups}</div>
          <div className="text-sm text-gray-600">
            {stats.totalVisitors > 0
              ? ((stats.emailSignups / stats.totalVisitors) * 100).toFixed(1)
              : 0}
            % conversion
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Top Landing Pages</h2>
        <div className="space-y-3">
          {stats.topPages.length === 0 ? (
            <p className="text-gray-500">No data yet.</p>
          ) : (
            stats.topPages.map((item: any) => (
              <div
                key={item.page}
                className="flex justify-between items-center border-b last:border-0 pb-2 last:pb-0"
              >
                <span className="font-medium text-gray-800">
                  {item.page || '/'}
                </span>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span className="w-24 text-right">{item.views} views</span>
                  {/* <span className="w-24 text-right">{item.clicks} clicks</span> */}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Traffic Sources</h2>
        <div className="space-y-3">
          {stats.trafficSources.length === 0 ? (
            <p className="text-gray-500">No traffic source data yet.</p>
          ) : (
            stats.trafficSources.map((item: any, i) => (
              <div
                key={i}
                className="flex justify-between p-2 hover:bg-gray-50 rounded"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${['bg-green-500', 'bg-blue-500', 'bg-purple-500'][i % 3] || 'bg-gray-500'}`}
                  ></span>
                  {item.source}
                </span>
                <span className="font-medium">{item.count}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
