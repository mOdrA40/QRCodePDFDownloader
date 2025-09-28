/**
 * Core Error Types
 * Application-wide error handling types and interfaces
 */

// Application error interface
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

// Error severity levels
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

// Error categories for better classification
export type ErrorCategory =
  | "validation"
  | "authentication"
  | "authorization"
  | "network"
  | "file_processing"
  | "qr_generation"
  | "pdf_export"
  | "storage"
  | "unknown";

// Enhanced error with additional context
export interface EnhancedError extends AppError {
  severity: ErrorSeverity;
  category: ErrorCategory;
  stack?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
}

// Error boundary state
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: {
    componentStack: string;
  };
}

// Error recovery options
export interface ErrorRecoveryOptions {
  retry?: () => void;
  fallback?: () => void;
  redirect?: string;
  message?: string;
}
