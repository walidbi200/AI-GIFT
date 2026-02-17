import { useEffect, useRef } from 'react';

// Use a type that matches the window.gtag definition or extend it
declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: any) => void;
  }
}

export function useScrollDepth(pageName: string) {
  const maxScrollRef = useRef(0);
  const sentMilestones = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      // Avoid division by zero
      if (documentHeight === 0) return;

      const scrollPercentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      if (scrollPercentage > maxScrollRef.current) {
        maxScrollRef.current = scrollPercentage;
      }

      // Track milestones: 25%, 50%, 75%, 90%
      const milestones = [25, 50, 75, 90];
      milestones.forEach((milestone) => {
        if (
          scrollPercentage >= milestone &&
          !sentMilestones.current.has(milestone)
        ) {
          sentMilestones.current.add(milestone);

          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'scroll_depth', {
              page: pageName,
              depth: milestone,
            });
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pageName]);
}
