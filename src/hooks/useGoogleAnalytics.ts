import { useEffect, useState, useCallback } from 'react';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  sessionDuration: number; // in seconds
  bounceRate: number; // as a percentage
}

interface UseAnalyticsReturn extends AnalyticsData {
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

export function useGoogleAnalytics(): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData>({
    pageViews: 0,
    uniqueVisitors: 0,
    sessionDuration: 0,
    bounceRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      /* API removed to stay under Hobby plan limit
      const response = await fetch('/api/analytics/ga');
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics data: ${response.statusText}`);
      }
      const analytics: AnalyticsData = await response.json();
      setData(analytics);
      */
      // Return mock/empty data instead
      setData({ pageViews: 0, uniqueVisitors: 0, sessionDuration: 0, bounceRate: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setData({ pageViews: 0, uniqueVisitors: 0, sessionDuration: 0, bounceRate: 0 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return { ...data, isLoading, error, refreshData: fetchAnalyticsData };
}
