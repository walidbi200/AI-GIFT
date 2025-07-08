// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

// Performance monitoring utilities
export const performance = {
  // Track API response times
  trackApiCall: (operation: string, startTime: number) => {
    const duration = Date.now() - startTime
    console.log(`API Call - ${operation}: ${duration}ms`)
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'api_call', {
        operation,
        duration,
        category: 'performance'
      })
    }
  },

  // Track user interactions
  trackInteraction: (action: string, details?: Record<string, any>) => {
    console.log(`User Interaction - ${action}:`, details)
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'user_interaction', {
        action,
        ...details,
        category: 'engagement'
      })
    }
  },

  // Track page views
  trackPageView: (page: string) => {
    console.log(`Page View - ${page}`)
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: page,
        page_location: window.location.href
      })
    }
  },

  // Track errors
  trackError: (error: Error, context?: string) => {
    console.error(`Error - ${context}:`, error)
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        context
      })
    }
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Local storage with error handling
export const storage = {
  get: (key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return defaultValue
    }
  },

  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }
}

// Analytics helper
export const analytics = {
  // Track gift suggestions generated
  trackGiftSuggestions: (count: number, occasion: string, hasBudget: boolean) => {
    performance.trackInteraction('gift_suggestions_generated', {
      count,
      occasion,
      has_budget: hasBudget
    })
  },

  // Track feedback submitted
  trackFeedback: (rating: number, hasComment: boolean) => {
    performance.trackInteraction('feedback_submitted', {
      rating,
      has_comment: hasComment
    })
  },

  // Track copy to clipboard
  trackCopyToClipboard: (suggestionCount: number) => {
    performance.trackInteraction('copy_to_clipboard', {
      suggestion_count: suggestionCount
    })
  }
} 