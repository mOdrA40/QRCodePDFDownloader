/**
 * Utils Backward Compatibility Export
 */

export { isBrowser, safeJsonParse } from "./core/environment";
export { clamp, formatDate, formatFileSize } from "./core/formatting";
export { debounce, generateId, throttle } from "./core/functions";
// Core utilities
export { cn } from "./core/tailwind";
// Performance utilities
export {
  useDebounce,
  useExpensiveCalculation,
  usePerformanceMonitor,
  useThrottle,
} from "./performance/hooks";
export {
  useIntersectionObserver,
  useLazyImage,
  useLazyLoad,
} from "./performance/lazy-loading";
export {
  useBatchProcessor,
  useMemoryMonitor,
  useVirtualScroll,
} from "./performance/monitoring";
export { CSP_DIRECTIVES, generateCSP } from "./security/csp";
export { RateLimiter } from "./security/rate-limiting";

// Security utilities
export { sanitizeText, sanitizeUrl } from "./security/sanitization";
export {
  validateFileName,
  validateFileSize,
  validateFileType,
  validateHexColor,
  validatePassword,
  validateQRMargin,
  validateQRSize,
} from "./security/validation";
// UI utilities
export { copyToClipboard } from "./ui/clipboard";
export { getUserInitials } from "./ui/user-helpers";
export { validateFileUpload } from "./validation/file-validation";
export { validatePDFOptions } from "./validation/pdf-validation";
export { validateQROptions } from "./validation/qr-validation";
// Validation utilities
export type { ValidationResult } from "./validation/schemas";
export { validatePresetName } from "./validation/schemas";
