/**
 * Auth0 Callback Page
 * Handles the callback from Auth0 after authentication
 */

"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CallbackPage() {
  const { isLoading, error, isAuthenticated } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        console.error("Auth0 callback error:", error);
        router.push("/?error=auth_failed");
      } else if (isAuthenticated) {
        // Redirect to home page or intended destination
        const returnTo = new URLSearchParams(window.location.search).get("returnTo");
        router.push(returnTo || "/");
      } else {
        // If not authenticated, redirect to home
        router.push("/");
      }
    }
  }, [isLoading, error, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Completing authentication...</p>
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
