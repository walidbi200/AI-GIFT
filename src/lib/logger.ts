

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

// Log context interface
export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  [key: string]: any;
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  data?: any;
}

// Logger configuration
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  enablePerformance: boolean;
  enableUserTracking: boolean;
  maxLogSize: number;
  retentionDays: number;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableRemote: false,
  enablePerformance: true,
  enableUserTracking: true,
  maxLogSize: 1000,
  retentionDays: 30,
};

class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private sessionId: string;
  private userId?: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();
    this.initializeLogger();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private initializeLogger(): void {
    // Set up global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.error('Unhandled error', {
          error: event.error,
          context: {
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: this.sessionId,
          },
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.error('Unhandled promise rejection', {
          error: event.reason,
          context: {
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: this.sessionId,
          },
        });
      });
    }

    // Set up performance monitoring
    if (this.config.enablePerformance && typeof window !== 'undefined') {
      this.setupPerformanceMonitoring();
    }
  }

  private setupPerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.info('Page load performance', {
          data: {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart,
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
          },
          context: {
            url: window.location.href,
            sessionId: this.sessionId,
          },
        });
      }
    });

    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              this.info('LCP measured', {
                data: { lcp: entry.startTime },
                context: { url: window.location.href, sessionId: this.sessionId },
              });
            }
            if (entry.entryType === 'first-input') {
              this.info('FID measured', {
                data: { fid: (entry as any).processingStart - entry.startTime },
                context: { url: window.location.href, sessionId: this.sessionId },
              });
            }
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      } catch (error) {
        this.warn('Performance monitoring setup failed', { error: error as Error });
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
    data?: any
  ): LogEntry {
    const baseContext: LogContext = {
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
    };

    if (this.userId) {
      baseContext.userId = this.userId;
    }

    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...baseContext, ...context },
      error,
      data,
    };
  }

  private addToLogs(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Maintain log size limit
    if (this.logs.length > this.config.maxLogSize) {
      this.logs = this.logs.slice(-this.config.maxLogSize);
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;
    let formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      formatted += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error) {
      formatted += ` | Error: ${error.message}\nStack: ${error.stack}`;
    }
    
    return formatted;
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const formatted = this.formatLogEntry(entry);
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.TRACE:
        console.trace(formatted);
        break;
    }
  }

  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fallback to console if remote logging fails
      console.error('Remote logging failed:', error);
    }
  }

  // Public logging methods
  error(message: string, options?: { context?: LogContext; error?: Error; data?: any }): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, options?.context, options?.error, options?.data);
    this.addToLogs(entry);
    this.logToConsole(entry);
    this.logToRemote(entry);
  }

  warn(message: string, options?: { context?: LogContext; error?: Error; data?: any }): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, message, options?.context, options?.error, options?.data);
    this.addToLogs(entry);
    this.logToConsole(entry);
    this.logToRemote(entry);
  }

  info(message: string, options?: { context?: LogContext; data?: any }): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, message, options?.context, undefined, options?.data);
    this.addToLogs(entry);
    this.logToConsole(entry);
    this.logToRemote(entry);
  }

  debug(message: string, options?: { context?: LogContext; data?: any }): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, options?.context, undefined, options?.data);
    this.addToLogs(entry);
    this.logToConsole(entry);
    this.logToRemote(entry);
  }

  trace(message: string, options?: { context?: LogContext; data?: any }): void {
    if (!this.shouldLog(LogLevel.TRACE)) return;
    
    const entry = this.createLogEntry(LogLevel.TRACE, message, options?.context, undefined, options?.data);
    this.addToLogs(entry);
    this.logToConsole(entry);
    this.logToRemote(entry);
  }

  // User tracking
  setUserId(userId: string): void {
    this.userId = userId;
    this.info('User ID set', { context: { userId } });
  }

  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.config.enableUserTracking) return;
    
    this.info(`Event: ${eventName}`, {
      context: { eventName },
      data: properties,
    });
  }

  trackPageView(page: string, properties?: Record<string, any>): void {
    if (!this.config.enableUserTracking) return;
    
    this.info(`Page view: ${page}`, {
      context: { page },
      data: properties,
    });
  }

  // Performance tracking
  trackPerformance(name: string, duration: number, properties?: Record<string, any>): void {
    if (!this.config.enablePerformance) return;
    
    this.info(`Performance: ${name}`, {
      context: { performanceMetric: name },
      data: { duration, ...properties },
    });
  }

  // API request tracking
  trackApiRequest(method: string, url: string, statusCode: number, responseTime: number, properties?: Record<string, any>): void {
    this.info(`API Request: ${method} ${url}`, {
      context: { method, url, statusCode, responseTime },
      data: properties,
    });
  }

  // Error tracking with context
  trackError(error: Error, context?: LogContext): void {
    this.error('Application error', {
      error,
      context: {
        ...context,
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
      },
    });
  }

  // Utility methods
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Configuration methods
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.info('Logger configuration updated', { data: this.config });
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// Create and export default logger instance
export const logger = new Logger();

// Export logger class for custom instances
export { Logger };

// Utility functions for common logging patterns
export const logUtils = {
  // Log user interactions
  logUserAction: (action: string, details?: any) => {
    logger.trackEvent('user_action', { action, details });
  },

  // Log form submissions
  logFormSubmission: (formName: string, success: boolean, errors?: any) => {
    logger.trackEvent('form_submission', { formName, success, errors });
  },

  // Log API calls
  logApiCall: (endpoint: string, method: string, success: boolean, duration?: number) => {
    logger.trackEvent('api_call', { endpoint, method, success, duration });
  },

  // Log page navigation
  logNavigation: (from: string, to: string) => {
    logger.trackEvent('navigation', { from, to });
  },

  // Log feature usage
  logFeatureUsage: (feature: string, properties?: any) => {
    logger.trackEvent('feature_usage', { feature, ...properties });
  },
};
