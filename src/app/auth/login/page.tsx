/**
 * Auth0 Login Page
 * Handles login redirect to Auth0 Universal Login
 */

"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { loginWithRedirect, isLoading, isAuthenticated, user } = useAuth0();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Get returnTo parameter from URL, but avoid callback/login loops
  const rawReturnTo = searchParams.get('returnTo') || '/';
  const returnTo = (rawReturnTo === '/auth/callback' || rawReturnTo === '/auth/login') ? '/' : rawReturnTo;

  useEffect(() => {
    // Prevent infinite loops by checking if we came from callback
    const referrer = document.referrer;
    const isFromCallback = referrer.includes('/auth/callback');

    console.log("Login page effect:", { isLoading, isAuthenticated, user: !!user, isRedirecting, returnTo, isFromCallback });

    // If user is already authenticated, redirect to returnTo
    if (isAuthenticated && user && !isLoading) {
      console.log("User already authenticated, redirecting to:", returnTo);

      // Add a delay to prevent rapid redirects
      const timer = setTimeout(() => {
        router.replace(returnTo);
      }, 500);

      return () => clearTimeout(timer);
    }

    // Auto-redirect to Auth0 login after a short delay, but not if we just came from callback
    if (!isLoading && !isAuthenticated && !isRedirecting && !isFromCallback) {
      console.log("Auto-redirecting to Auth0 login...");
      setIsRedirecting(true);

      const timer = setTimeout(() => {
        loginWithRedirect({
          authorizationParams: {
            redirect_uri: `${window.location.origin}/auth/callback`,
            screen_hint: 'login',
          },
          appState: {
            returnTo: returnTo,
          },
        });
      }, 1500); // Increased delay to prevent rapid redirects

      return () => clearTimeout(timer);
    }

    // If we came from callback and user is not authenticated, something went wrong
    if (isFromCallback && !isAuthenticated && !isLoading) {
      console.warn("Came from callback but not authenticated - redirecting to home");
      setTimeout(() => {
        router.replace("/?error=auth_incomplete");
      }, 1000);
    }

    // Return undefined for other code paths
    return undefined;
  }, [isLoading, isAuthenticated, user, loginWithRedirect, router, returnTo, isRedirecting]);

  const handleManualLogin = () => {
    setIsRedirecting(true);
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: `${window.location.origin}/auth/callback`,
        screen_hint: 'login',
      },
      appState: {
        returnTo: returnTo,
      },
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Already authenticated
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Already Signed In
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Welcome back, {user.name}! Redirecting you...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Login page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to access your QR PDF Downloader
            </p>
          </div>

          {/* Auto-redirect message */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {isRedirecting
                ? "Redirecting to secure login..."
                : "You will be redirected to our secure login page automatically."
              }
            </p>

            {/* Smooth Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
              <div
                className={`bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full progress-bar-smooth ${
                  isRedirecting ? 'auth-progress-login auth-progress-pulse' : 'w-3/5'
                }`}
              ></div>
            </div>
          </div>

          {/* Manual login button */}
          <div className="space-y-4">
            <Button
              onClick={handleManualLogin}
              disabled={isRedirecting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In Now
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Secure authentication powered by Auth0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
