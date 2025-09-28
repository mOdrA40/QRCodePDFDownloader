/**
 * Performance Hooks
 * React hooks for performance optimization
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= limit) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      },
      limit - (Date.now() - lastRan.current)
    );

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * Custom hook for memoized expensive calculations
 * Note: This is intentionally designed to accept dependencies as a parameter
 */
export function useExpensiveCalculation<T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T {
  // biome-ignore lint/correctness/useExhaustiveDependencies: This is a utility function that intentionally accepts dependencies as parameter
  return useMemo(calculation, dependencies);
}

/**
 * Custom hook for performance monitoring
 */
export function usePerformanceMonitor(name: string) {
  const startTime = useRef<number | undefined>(undefined);

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

  const measure = useCallback(
    (fn: () => void) => {
      start();
      fn();
      return end();
    },
    [start, end]
  );

  return { start, end, measure };
}
