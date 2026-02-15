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
    // Page views with metadata
    trackPageView: (pagePath: string, pageTitle: string, category?: string) => {
        trackEvent('page_view', {
            page_path: pagePath,
            page_title: pageTitle,
            page_category: category,
        });
    },

    // Gift finder interactions
    giftFinderStarted: (params: {
        recipient: string;
        occasion: string;
        budget: string;
    }) => {
        trackEvent('gift_finder_started', {
            recipient: params.recipient,
            occasion: params.occasion,
            budget: params.budget,
        });
    },

    giftFinderCompleted: (params: {
        recipient: string;
        occasion: string;
        cached: boolean;
        responseTime: number;
    }) => {
        trackEvent('gift_finder_completed', {
            ...params,
            value: 1, // Track as conversion
        });
    },

    giftFinderFailed: (error: string) => {
        trackEvent('gift_finder_failed', { error });
    },

    // Landing page engagement
    landingPageEngagement: (params: {
        page: string;
        scrollDepth: number;
        timeOnPage: number;
    }) => {
        trackEvent('landing_page_engagement', params);
    },

    // Affiliate link tracking
    affiliateLinkClicked: (params: {
        giftName: string;
        platform: string;
        position: number;
        page: string;
        commission?: string;
    }) => {
        trackEvent('affiliate_click', {
            ...params,
            value: 1, // Track as conversion
        });
    },

    // Blog engagement
    blogPostRead: (params: {
        postTitle: string;
        readPercentage: number;
        timeSpent: number;
    }) => {
        trackEvent('blog_post_read', params);
    },

    // Social sharing
    contentShared: (params: {
        platform: string;
        contentType: string;
        contentTitle: string;
    }) => {
        trackEvent('content_shared', params);
    },

    // Search Console integration events
    organicLanding: (params: {
        keyword?: string;
        landingPage: string;
    }) => {
        trackEvent('organic_landing', params);
    },

    // UTM Tracking
    trackUTM: (params: Record<string, string>) => {
        trackEvent('utm_landing', params);
    },

    // Email signup
    emailSignupStarted: (source: string) => {
        trackEvent('email_signup_started', { source });
    },

    emailSignupCompleted: (source: string) => {
        trackEvent('email_signup_completed', { source, value: 5 }); // Assign value to signups
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

export function getUTMParams(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    return {
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || '',
        utm_content: params.get('utm_content') || '',
    };
}

export function trackUTMParams() {
    const utmParams = getUTMParams();
    if (utmParams.utm_source) {
        analytics.trackUTM(utmParams);
    }
}
