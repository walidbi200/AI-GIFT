// Analytics event tracking
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, properties);
    }

    // Console log in development
    if (import.meta.env.DEV) {
        console.log('[Analytics]', eventName, properties);
    }
};

// Specific event trackers
export const analytics = {
    // Gift generation events
    giftSearchStarted: (params: {
        recipient: string;
        occasion: string;
        budget: string;
    }) => {
        trackEvent('gift_search_started', params);
    },

    giftSearchCompleted: (params: {
        recipient: string;
        occasion: string;
        cached: boolean;
        responseTime: number;
    }) => {
        trackEvent('gift_search_completed', params);
    },

    giftSearchFailed: (error: string) => {
        trackEvent('gift_search_failed', { error });
    },

    // Affiliate link clicks
    affiliateLinkClicked: (params: {
        giftName: string;
        platform: string;
        position: number;
    }) => {
        trackEvent('affiliate_link_clicked', params);
    },

    // Email signup
    emailSignupStarted: () => {
        trackEvent('email_signup_started');
    },

    emailSignupCompleted: () => {
        trackEvent('email_signup_completed');
    },

    // Navigation
    pageViewed: (pagePath: string) => {
        trackEvent('page_view', { page_path: pagePath });
    },

    // Errors
    errorOccurred: (params: {
        errorType: string;
        errorMessage: string;
        component?: string;
    }) => {
        trackEvent('error_occurred', params);
    },
};
