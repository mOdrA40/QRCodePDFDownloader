/**
 * Performance optimization utilities
 * Provides tools for lazy loading, memoization, and performance monitoring
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
): [React.RefObject<HTMLElement>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

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
        setIsIntersecting(entry.isIntersecting);
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
 * Custom hook for debounced values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for throttled values
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * Custom hook for memoized expensive calculations
 */
export function useExpensiveCalculation<T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(calculation, dependencies);
}

/**
 * Custom hook for performance monitoring
 */
export function usePerformanceMonitor(name: string) {
  const startTime = useRef<number>();

  const start = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const end = useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current;
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      return duration;
    }
    return 0;
  }, [name]);

  const measure = useCallback((fn: () => void) => {
    start();
    fn();
    return end();
  }, [start, end]);

  return { start, end, measure };
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

/**
 * Virtual scrolling utility for large lists
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
): {
  visibleItems: T[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
} {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length - 1
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    handleScroll,
  } as {
    visibleItems: T[];
    startIndex: number;
    endIndex: number;
    totalHeight: number;
    offsetY: number;
    handleScroll: (e: React.UIEvent<HTMLElement>) => void;
  };
}

/**
 * Memory usage monitoring
 */
export function useMemoryMonitor(): {
  memoryInfo: MemoryInfo | null;
  refreshMemoryInfo: () => void;
} {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);

  const refreshMemoryInfo = useCallback(() => {
    if ('memory' in performance) {
      setMemoryInfo((performance as Performance & { memory: MemoryInfo }).memory);
    }
  }, []);

  useEffect(() => {
    refreshMemoryInfo();
    const interval = setInterval(refreshMemoryInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [refreshMemoryInfo]);

  return { memoryInfo, refreshMemoryInfo };
}

/**
 * Batch processing utility for large operations
 */
export function useBatchProcessor<T, R>(
  processor: (batch: T[]) => Promise<R[]>,
  batchSize = 10,
  delay = 100
): {
  processBatch: (items: T[]) => Promise<R[]>;
  isProcessing: boolean;
  progress: number;
} {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processBatch = useCallback(
    async (items: T[]): Promise<R[]> => {
      setIsProcessing(true);
      setProgress(0);

      const results: R[] = [];
      const totalBatches = Math.ceil(items.length / batchSize);

      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await processor(batch);
        results.push(...batchResults);

        const currentBatch = Math.floor(i / batchSize) + 1;
        setProgress((currentBatch / totalBatches) * 100);

        // Add delay between batches to prevent blocking
        if (delay > 0 && currentBatch < totalBatches) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      setIsProcessing(false);
      setProgress(100);

      return results;
    },
    [processor, batchSize, delay]
  );

  return { processBatch, isProcessing, progress };
}

// Type for memory info (not available in all browsers)
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}
