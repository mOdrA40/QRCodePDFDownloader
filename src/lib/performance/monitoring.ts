/**
 * Performance Monitoring Utilities
 * Functions and hooks for monitoring application performance
 */

import { useCallback, useEffect, useState } from "react";

// Type for memory info (not available in all browsers)
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
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
    if ("memory" in performance) {
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
  handleScroll: (e: React.UIEvent<HTMLElement>) => void;
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
  };
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
          await new Promise((resolve) => setTimeout(resolve, delay));
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
