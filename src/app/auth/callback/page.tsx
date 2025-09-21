/**
 * Auth0 Callback Page
 * Handles the callback from Auth0 after authentication
 */

"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { CallbackErrorBoundary } from "@/components/auth/CallbackErrorBoundary";
import { isValidAuthCallback, getCallbackError } from "@/utils/auth-cleanup";
import { suppressAuth0Errors, restoreConsoleError } from "@/utils/auth0-error-suppressor";

function CallbackPageContent() {
  const { isLoading, error, isAuthenticated, handleRedirectCallback } = useAuth0();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [progressStage, setProgressStage] = useState<'initializing' | 'processing' | 'completing'>('initializing');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const processCallback = async () => {
      // Prevent double processing
      if (hasProcessedRef.current) return;
      hasProcessedRef.current = true;

      try {
        console.log("Processing Auth0 callback...");
        setProgressStage('processing');

        // Activate error suppression for Auth0 errors
        suppressAuth0Errors();

        // Check for callback errors first
        const callbackError = getCallbackError();
        if (callbackError) {
          console.error("Auth0 callback error:", callbackError);
          // Don't redirect to login from callback - go to home with error
          setTimeout(() => {
            router.replace("/?error=callback_error");
          }, 1000);
          return;
        }

        // Validate callback parameters
        if (!isValidAuthCallback()) {
          console.warn("Invalid callback parameters detected");
          console.log("Current URL:", window.location.href);
          console.log("URL params:", window.location.search);

          // Clear any stale auth state
          try {
            const { clearAuth0State } = await import("@/utils/auth-cleanup");
            clearAuth0State();
          } catch (error) {
            console.warn("Error clearing auth state:", error);
          }

          // Don't redirect to login from callback - go to home
          setTimeout(() => {
            router.replace("/?error=invalid_callback");
          }, 1000);
          return;
        }

        console.log("Found valid auth callback parameters, processing...");

        // SILENT ERROR HANDLING - Suppress all Auth0 errors
        try {
          // Create a promise wrapper that catches ALL errors silently
          const silentHandleRedirectCallback = () => {
            return new Promise<void>((resolve, reject) => {
              // Override console.error temporarily to suppress Auth0 errors
              const originalConsoleError = console.error;

              // Suppress specific Auth0 errors
              console.error = (...args: unknown[]) => {
                const message = args.join(' ');
                if (message.includes('Invalid state') ||
                    message.includes('state mismatch') ||
                    message.includes('invalid_request')) {
                  // Silently ignore these errors
                  return;
                }
                // Allow other errors through
                originalConsoleError.apply(console, args);
              };

              try {
                const result = handleRedirectCallback();

                // Restore console.error
                setTimeout(() => {
                  console.error = originalConsoleError;
                }, 100);

                if (result && typeof result.then === 'function') {
                  result
                    .then(() => {
                      console.error = originalConsoleError;
                      resolve();
                    })
                    .catch((error: unknown) => {
                      console.error = originalConsoleError;
                      // Check if it's a known Auth0 error
                      const errorMessage = error instanceof Error ? error.message : String(error);
                      const errorObj = error as { error?: string; message?: string };

                      if (errorMessage.includes('Invalid state') ||
                          errorMessage.includes('state mismatch') ||
                          errorObj?.error === 'invalid_request') {
                        // Silently resolve instead of rejecting
                        console.log("Auth0 error silently handled:", errorMessage);
                        resolve();
                      } else {
                        reject(error);
                      }
                    });
                } else {
                  resolve();
                }
              } catch (error: unknown) {
                console.error = originalConsoleError;
                // Check if it's a known Auth0 error
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorObj = error as { error?: string; message?: string };

                if (errorMessage.includes('Invalid state') ||
                    errorMessage.includes('state mismatch') ||
                    errorObj?.error === 'invalid_request') {
                  // Silently resolve instead of rejecting
                  console.log("Auth0 error silently handled:", errorMessage);
                  resolve();
                } else {
                  reject(error);
                }
              }
            });
          };

          console.log("Attempting handleRedirectCallback with silent error handling...");
          await silentHandleRedirectCallback();
          console.log("Callback processed successfully (or silently handled)");

        } catch (callbackError: unknown) {
          console.error("Unhandled callback error:", callbackError);

          // Fallback: redirect to home
          setIsProcessing(false);
          setTimeout(() => {
            router.replace("/?error=auth_fallback");
          }, 500);
          return;
        }

        // Wait a moment for auth state to update with cleanup
        setProgressStage('completing');
        timeoutRef.current = setTimeout(() => {
          setIsProcessing(false);
          // Restore console error after processing
          restoreConsoleError();
        }, 1000);

      } catch (err) {
        console.error("Callback processing error:", err);
        setIsProcessing(false);
        // Restore console error on error
        restoreConsoleError();
      }
    };

    if (!isLoading && !hasProcessedRef.current) {
      processCallback();
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, handleRedirectCallback, router]);

  useEffect(() => {
    if (!isLoading && !isProcessing) {
      console.log("Auth state:", { isAuthenticated, error });

      // Use a small delay to ensure smooth navigation
      const navigationTimeout = setTimeout(() => {
        if (error) {
          console.error("Auth0 callback error:", error);
          router.replace("/?error=auth_failed");
        } else if (isAuthenticated) {
          console.log("User authenticated, redirecting...");
          // Get returnTo from URL params safely
          const urlParams = new URLSearchParams(window.location.search);
          const returnTo = urlParams.get("returnTo");

          // Avoid redirecting back to callback or login pages
          if (returnTo && returnTo !== '/auth/callback' && returnTo !== '/auth/login') {
            router.replace(returnTo);
          } else {
            router.replace("/");
          }
        } else {
          console.log("User not authenticated after callback processing, redirecting to home...");
          router.replace("/");
        }
      }, 500); 

      return () => clearTimeout(navigationTimeout);
    }

    // Return undefined for other code paths
    return undefined;
  }, [isLoading, isProcessing, error, isAuthenticated, router]);

  if (isLoading || isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Completing Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {progressStage === 'initializing' && "Initializing..."}
            {progressStage === 'processing' && "Processing your login..."}
            {progressStage === 'completing' && "Almost done..."}
          </p>

          {/* Smooth Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
            <div
              className={`bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full progress-bar-smooth auth-progress-pulse ${
                progressStage === 'initializing' ? 'w-1/4' :
                progressStage === 'processing' ? 'w-3/5' :
                'auth-progress-complete'
              }`}
            ></div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            This should only take a moment
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Redirecting...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <CallbackErrorBoundary>
      <CallbackPageContent />
    </CallbackErrorBoundary>
  );
}
