/**
 * Utils Barrel Export
 * Central export point for all utility functions
 */

// Feature-specific utilities
export * from "./features";

// Shared utilities
export * from "./shared";

// Auth utilities
export {
  clearAuth0State,
  clearAuthCache,
  debugAuthState,
  getCallbackError,
  isValidAuthCallback,
  redirectToLogin,
  restoreConsoleError,
  suppressAuth0Errors,
} from "./features/auth";

// QR utilities
export type { ParsedQRContent, QRContentType, QRFilterOptions, QRHistoryItem } from "./features/qr";
export {
  applyQRFilters,
  detectQRContentType,
  filterByDateRange,
  getContentTypeDisplayName,
  getContentTypeIcon,
  parseQRContent,
  QR_FORMAT_INFO,
  searchQRHistory,
} from "./features/qr";
