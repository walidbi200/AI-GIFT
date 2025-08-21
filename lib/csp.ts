import { generateNonce } from './auth';

/**
 * Content Security Policy configuration
 */
export interface CSPConfig {
  nonce?: string;
  reportOnly?: boolean;
  reportUri?: string;
}

/**
 * Generate a Content Security Policy header
 * @param config - CSP configuration options
 * @returns CSP header value
 */
export function generateCSP(config: CSPConfig = {}): string {
  const nonce = config.nonce || generateNonce();
  const reportOnly = config.reportOnly || false;
  const reportUri = config.reportUri || '/api/csp-report';
  
  const directives = [
    // Default source - only allow same origin
    "default-src 'self'",
    
    // Script sources - allow same origin, nonce, and specific external sources
    `script-src 'self' 'nonce-${nonce}' https://vercel.live https://www.googletagmanager.com https://www.google-analytics.com`,
    
    // Style sources - allow same origin, nonce, and Google Fonts
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com 'unsafe-inline'`,
    
    // Image sources - allow same origin, data URIs, and HTTPS images
    "img-src 'self' data: https: blob:",
    
    // Font sources - allow same origin and Google Fonts
    "font-src 'self' https://fonts.gstatic.com",
    
    // Connect sources - allow same origin and specific APIs
    "connect-src 'self' https://api.openai.com https://www.google-analytics.com https://analytics.google.com",
    
    // Frame ancestors - prevent clickjacking
    "frame-ancestors 'none'",
    
    // Base URI - restrict base tag usage
    "base-uri 'self'",
    
    // Form action - restrict form submissions
    "form-action 'self'",
    
    // Object source - prevent plugin execution
    "object-src 'none'",
    
    // Media source - allow same origin
    "media-src 'self'",
    
    // Worker source - allow same origin
    "worker-src 'self'",
    
    // Manifest source - allow same origin
    "manifest-src 'self'",
    
    // Upgrade insecure requests - force HTTPS
    "upgrade-insecure-requests",
    
    // Block mixed content
    "block-all-mixed-content",
    
    // Require trusted types
    "require-trusted-types-for 'script'",
  ];
  
  // Add reporting directive if not in report-only mode
  if (!reportOnly) {
    directives.push(`report-uri ${reportUri}`);
  }
  
  return directives.join('; ');
}

/**
 * Generate CSP headers for Vercel
 * @param config - CSP configuration options
 * @returns Headers object for Vercel
 */
export function generateCSPHeaders(config: CSPConfig = {}): Record<string, string> {
  const csp = generateCSP(config);
  const headers: Record<string, string> = {};
  
  if (config.reportOnly) {
    headers['Content-Security-Policy-Report-Only'] = csp;
  } else {
    headers['Content-Security-Policy'] = csp;
  }
  
  // Additional security headers
  headers['X-Content-Type-Options'] = 'nosniff';
  headers['X-Frame-Options'] = 'DENY';
  headers['X-XSS-Protection'] = '1; mode=block';
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()';
  
  return headers;
}

/**
 * Validate CSP nonce
 * @param nonce - The nonce to validate
 * @returns True if nonce is valid
 */
export function validateNonce(nonce: string): boolean {
  // Basic validation - nonce should be alphanumeric and reasonable length
  return /^[a-zA-Z0-9]{16,32}$/.test(nonce);
}

/**
 * Generate nonce for inline scripts
 * @returns Nonce string
 */
export function getScriptNonce(): string {
  return generateNonce();
}

/**
 * Generate nonce for inline styles
 * @returns Nonce string
 */
export function getStyleNonce(): string {
  return generateNonce();
}

/**
 * CSP violation report handler
 * @param report - CSP violation report
 * @returns Promise that resolves when report is processed
 */
export async function handleCSPViolation(report: any): Promise<void> {
  try {
    console.error('CSP Violation:', {
      timestamp: new Date().toISOString(),
      documentUri: report['csp-report']?.['document-uri'],
      violatedDirective: report['csp-report']?.['violated-directive'],
      blockedUri: report['csp-report']?.['blocked-uri'],
      sourceFile: report['csp-report']?.['source-file'],
      lineNumber: report['csp-report']?.['line-number'],
      columnNumber: report['csp-report']?.['column-number'],
    });
    
    // In production, you might want to send this to a logging service
    // or store it in a database for analysis
  } catch (error) {
    console.error('Error handling CSP violation:', error);
  }
}

/**
 * Create CSP report endpoint handler
 * @returns API handler for CSP violation reports
 */
export function createCSPReportHandler() {
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    try {
      const report = await request.json();
      await handleCSPViolation(report);
      
      return new Response('OK', { status: 200 });
    } catch (error) {
      console.error('Error processing CSP report:', error);
      return new Response('Bad request', { status: 400 });
    }
  };
}
