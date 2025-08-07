import { useEffect, useState } from 'react';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  sessionDuration: number;
  bounceRate: number;
  topPages: Array<{
    path: string;
    views: number;
    title: string;
  }>;
  isLoading: boolean;
  error: string | null;
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export function useGoogleAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    pageViews: 0,
    uniqueVisitors: 0,
    sessionDuration: 0,
    bounceRate: 0,
    topPages: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Initialize Google Analytics
    const initGA = () => {
      if (typeof window !== 'undefined' && !window.gtag) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.VITE_GA_TRACKING_ID || 'G-XXXXXXXXXX'}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
          window.dataLayer.push(arguments);
        };

        window.gtag('js', new Date());
        window.gtag('config', process.env.VITE_GA_TRACKING_ID || 'G-XXXXXXXXXX', {
          page_title: document.title,
          page_location: window.location.href,
        });
      }
    };

    initGA();
  }, []);

  const trackPageView = (page: string, title?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.VITE_GA_TRACKING_ID || 'G-XXXXXXXXXX', {
        page_title: title || document.title,
        page_location: window.location.origin + page,
      });
    }
  };

  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  const trackGiftGeneration = (occasion: string, budget: string, interests: string[]) => {
    trackEvent('gift_generation', 'engagement', occasion, 1);
    trackEvent('gift_budget', 'engagement', budget, parseInt(budget) || 0);
    interests.forEach(interest => {
      trackEvent('gift_interest', 'engagement', interest, 1);
    });
  };

  const trackBlogView = (postTitle: string, readTime: number) => {
    trackEvent('blog_view', 'content', postTitle, readTime);
  };

  const trackAdminAction = (action: string, details?: string) => {
    trackEvent('admin_action', 'administration', action, 1);
  };

  // Mock analytics data for development
  const loadAnalyticsData = async () => {
    try {
      setAnalyticsData(prev => ({ ...prev, isLoading: true, error: null }));

      // In production, you would fetch real data from Google Analytics API
      // For now, we'll use mock data
      const mockData: AnalyticsData = {
        pageViews: Math.floor(Math.random() * 5000) + 1000,
        uniqueVisitors: Math.floor(Math.random() * 3000) + 500,
        sessionDuration: Math.floor(Math.random() * 300) + 60, // seconds
        bounceRate: Math.floor(Math.random() * 40) + 20, // percentage
        topPages: [
          { path: '/', views: Math.floor(Math.random() * 1000) + 500, title: 'Home' },
          { path: '/blog', views: Math.floor(Math.random() * 800) + 300, title: 'Blog' },
          { path: '/blog/unique-gifts-for-gamers', views: Math.floor(Math.random() * 600) + 200, title: 'Gaming Gifts' },
          { path: '/blog/tech-gifts-for-parents', views: Math.floor(Math.random() * 500) + 150, title: 'Tech Gifts' },
          { path: '/about', views: Math.floor(Math.random() * 300) + 100, title: 'About' },
        ],
        isLoading: false,
        error: null,
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      setAnalyticsData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load analytics data',
      }));
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  return {
    ...analyticsData,
    trackPageView,
    trackEvent,
    trackGiftGeneration,
    trackBlogView,
    trackAdminAction,
    refreshData: loadAnalyticsData,
  };
}
