/**
 * Performance Utilities Barrel Export
 * Central export point for all performance optimization utilities
 */

// Performance hooks
export {
  useDebounce,
  useExpensiveCalculation,
  usePerformanceMonitor,
  useThrottle,
} from "./hooks";

// Lazy loading utilities
export {
  useIntersectionObserver,
  useLazyImage,
  useLazyLoad,
} from "./lazy-loading";

// Performance monitoring utilities
export {
  useBatchProcessor,
  useMemoryMonitor,
  useVirtualScroll,
} from "./monitoring";
