/**
 * Client-Only Component
 * Ensures components only render on client-side to prevent hydration mismatches
 */

"use client";

import { useEffect, useState } from "react";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that only renders children on client-side
 * Prevents hydration mismatches for components that use browser-specific APIs
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to check if component has mounted on client-side
 * Useful for conditional rendering based on client-side state
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook for safe access to browser APIs
 * Returns null on server-side, actual value on client-side
 */
export function useBrowserAPI<T>(getAPI: () => T, fallback: T | null = null): T | null {
  const [api, setApi] = useState<T | null>(fallback);
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient) {
      try {
        setApi(getAPI());
      } catch (error) {
        console.warn("Failed to access browser API:", error);
        setApi(fallback);
      }
    }
  }, [isClient, getAPI, fallback]);

  return api;
}
