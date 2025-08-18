import { generateSecureToken } from './auth';

/**
 * Generate a cryptographically secure nonce for CSP
 * @param length - Length of the nonce (default: 32)
 * @returns Base64 encoded nonce
 */
export function generateNonce(length: number = 32): string {
  const token = generateSecureToken(length);
  return Buffer.from(token).toString('base64');
}

/**
 * Create CSP header value with nonce
 * @param nonce - The nonce to include in CSP
 * @returns CSP header value
 */
export function createCSPHeader(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.openai.com https://region1.google-analytics.com https://www.google-analytics.com https://analytics.google.com https://upstash.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ');
}

/**
 * Create a script tag with nonce
 * @param content - Script content
 * @param nonce - CSP nonce
 * @returns HTML script tag
 */
export function createScriptTag(content: string, nonce: string): string {
  return `<script nonce="${nonce}">${content}</script>`;
}

/**
 * Create a style tag with nonce
 * @param content - Style content
 * @param nonce - CSP nonce
 * @returns HTML style tag
 */
export function createStyleTag(content: string, nonce: string): string {
  return `<style nonce="${nonce}">${content}</style>`;
}

/**
 * CSP configuration for different environments
 */
export const cspConfig = {
  development: {
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    connectSrc: ["'self'", "http://localhost:*", "https://api.openai.com"]
  },
  production: {
    scriptSrc: ["'self'", "'nonce-{NONCE}'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
    styleSrc: ["'self'", "'nonce-{NONCE}'", "https://fonts.googleapis.com"],
    connectSrc: ["'self'", "https://api.openai.com", "https://upstash.io"]
  }
};

/**
 * Generate CSP header based on environment
 * @param nonce - CSP nonce
 * @param environment - Environment (development/production)
 * @returns CSP header value
 */
export function generateCSPHeader(nonce: string, environment: 'development' | 'production' = 'production'): string {
  const config = cspConfig[environment];
  
  const directives = [
    `default-src 'self'`,
    `script-src ${config.scriptSrc.join(' ')}`,
    `style-src ${config.styleSrc.join(' ')}`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: https:`,
    `connect-src ${config.connectSrc.join(' ')}`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`
  ];
  
  return directives.join('; ');
}
