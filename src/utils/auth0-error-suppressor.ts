/**
 * Auth0 Error Suppressor
 * Silently handles Auth0 "Invalid state" errors to prevent console spam
 */

let originalConsoleError: typeof console.error | null = null;
let isSuppressionActive = false;

export function suppressAuth0Errors() {
  if (isSuppressionActive || typeof window === 'undefined') return;
  
  originalConsoleError = console.error;
  isSuppressionActive = true;
  
  console.error = (...args: unknown[]) => {
    const message = args.join(' ');
    
    // Suppress specific Auth0 errors
    if (message.includes('Invalid state') || 
        message.includes('state mismatch') ||
        message.includes('invalid_request') ||
        message.includes('Auth0') && message.includes('error')) {
      
      // Log to a different method for debugging if needed
      console.warn('[Auth0 Error Suppressed]:', message);
      return;
    }
    
    // Allow other errors through
    if (originalConsoleError) {
      originalConsoleError.apply(console, args);
    }
  };
  
  console.log('Auth0 error suppression activated');
}

export function restoreConsoleError() {
  if (!isSuppressionActive || !originalConsoleError) return;
  
  console.error = originalConsoleError;
  originalConsoleError = null;
  isSuppressionActive = false;
  
  console.log('Auth0 error suppression deactivated');
}

// Auto-suppress on import in browser environment
if (typeof window !== 'undefined') {
  // Add global error handler for unhandled Auth0 errors
  window.addEventListener('error', (event) => {
    if (event.error?.message?.includes('Invalid state') ||
        event.error?.message?.includes('state mismatch')) {
      console.warn('[Auth0 Global Error Suppressed]:', event.error.message);
      event.preventDefault();
      return false;
    }
    return true;
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('Invalid state') ||
        event.reason?.message?.includes('state mismatch')) {
      console.warn('[Auth0 Promise Rejection Suppressed]:', event.reason.message);
      event.preventDefault();
      return false;
    }
    return true;
  });
}
