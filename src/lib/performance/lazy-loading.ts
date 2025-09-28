/**
 * Lazy Loading Utilities
 * Functions and hooks for lazy loading components and images
 */

import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for lazy loading components
 */
export function useLazyLoad<T>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: T
): { Component: T | null; isLoading: boolean; error: Error | null } {
  const [Component, setComponent] = useState<T | null>(fallback || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    importFunc()
      .then((module) => {
        if (isMounted) {
          setComponent(module.default);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [importFunc]);

  return { Component, isLoading, error };
}

/**
 * Custom hook for intersection observer (lazy loading images/components)
 * SSR-safe implementation
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement | null>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      // On server or unsupported browsers, assume element is intersecting
      setIsIntersecting(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry?.isIntersecting ?? false);
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options]);

  return [ref, isIntersecting];
}

/**
 * Image lazy loading utility
 */
export function useLazyImage(src: string): {
  imageSrc: string | null;
  isLoading: boolean;
  error: boolean;
} {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }

    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setError(false);
    };

    img.onerror = () => {
      setIsLoading(false);
      setError(true);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { imageSrc, isLoading, error };
}
