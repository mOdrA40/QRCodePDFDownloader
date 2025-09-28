/**
 * Error Boundary for Auth0 Callback Page
 * Handles any errors that occur during authentication callback
 */

"use client";

import { useRouter } from "next/navigation";
import React from "react";

interface CallbackErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface CallbackErrorBoundaryProps {
  children: React.ReactNode;
}

export class CallbackErrorBoundary extends React.Component<
  CallbackErrorBoundaryProps,
  CallbackErrorBoundaryState
> {
  constructor(props: CallbackErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): CallbackErrorBoundaryState {
    console.error("CallbackErrorBoundary caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("CallbackErrorBoundary error details:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return <CallbackErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

function CallbackErrorFallback({ error }: { error?: Error | undefined }) {
  const router = useRouter();

  const handleRetry = () => {
    window.location.href = "/";
  };

  const handleGoHome = () => {
    router.replace("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-4">
            Something went wrong during the authentication process.
          </p>
          {error && (
            <details className="text-left bg-gray-50 rounded p-3 mb-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                Error Details
              </summary>
              <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">{error.message}</pre>
            </details>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
