/**
 * Auth Recovery Component
 * Handles authentication recovery when state errors occur
 */

"use client";

import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { clearAuth0State } from "@/utils/auth-cleanup";

interface AuthRecoveryProps {
  children: React.ReactNode;
}

export function AuthRecovery({ children }: AuthRecoveryProps) {
  const { error, isLoading } = useAuth0();
  const [hasRecovered, setHasRecovered] = useState(false);

  useEffect(() => {
    if (error && !isLoading && !hasRecovered) {
      console.log("Auth error detected, attempting recovery...", error);

      // Check if it's a state-related error
      if (error.message?.includes('Invalid state') ||
          error.message?.includes('state mismatch') ||
          error.message?.includes('invalid_request')) {

        console.log("State error detected, clearing auth state...");
        clearAuth0State();
        setHasRecovered(true);

        // Redirect to home instead of login to avoid loops
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    }
  }, [error, isLoading, hasRecovered]);

  // Show recovery message if we're handling an auth error
  if (error && !isLoading && !hasRecovered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Recovering Authentication
            </h2>
            <p className="text-gray-600 mb-4">
              We detected an authentication issue and are fixing it automatically.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              You will be redirected to login shortly...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
