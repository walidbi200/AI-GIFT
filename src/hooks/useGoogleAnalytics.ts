import { useEffect, useState, useCallback } from 'react';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  sessionDuration: number; // in seconds
  bounceRate: number; // as a percentage
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
    sessions: 0,
    topPages: [],
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ga');
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics data: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error('Invalid analytics data format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      // Fallback to zeroed data on error
      setData({ 
        pageViews: 0, 
        uniqueVisitors: 0, 
        sessionDuration: 0, 
        bounceRate: 0,
        sessions: 0,
        topPages: [],
        recentActivity: [],
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return { ...data, isLoading, error, refreshData: fetchAnalyticsData };
}
