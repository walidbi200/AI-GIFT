import { useEffect, useRef } from 'react';

export function useTimeOnPage(pageName: string) {
  const startTimeRef = useRef<number>(Date.now());
  const isActiveRef = useRef(true);

  useEffect(() => {
    const startTime = Date.now();
    startTimeRef.current = startTime;

    // Track active/inactive
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Send time on page when leaving
    const handleBeforeUnload = () => {
      if (isActiveRef.current) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);

        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          // We'll use a specific endpoint or just the GA endpoint if available, but since we don't have a backend /api/analytics/beacon yet,
          // we should try to use gtag if possible, or just rely on GA's automatic engagement time.
          // However, the prompt specifically requested navigator.sendBeacon to /api/analytics/beacon called "beacon".
          // I will stick to the prompt's implementation but also add a gtag call if possible as a fallback or parallel track.

          const data = JSON.stringify({
            event: 'time_on_page',
            page: pageName,
            seconds: timeSpent,
          });

          // Sending to a hypothetical endpoint as requested
          // Note: This endpoint needs to exist on the server to work properly.
          // Since I am modifying frontend mostly, I will assume the user handles the API side or I might need to make a stub later.
          // For now, I'll keep it as requested.
          navigator.sendBeacon('/api/analytics/beacon', data);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pageName]);
}
