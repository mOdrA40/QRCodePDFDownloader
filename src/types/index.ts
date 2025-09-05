/**
 * Central export file for all type definitions
 * This file provides a single import point for all types across the application
 */

// QR Code types
export type {
  QRErrorCorrectionLevel,
  QRImageFormat,
  QRSizePreset,
  QRColorTheme,
  QROptions,
  QRGenerationConfig,
  QRGenerationResult,
  QRPreset,
  QRValidationResult,
  QRGenerationProgress,
  QRMetadata,
} from "./qr.types";

// Usage statistics types
export type {
  UsageStats,
  UsageEvent,
  UsageAnalytics,
  UsagePreferences,
} from "./usage.types";

// File handling types
export type {
  SupportedFileType,
  FileProcessingResult,
  FileValidationResult,
  FileUploadConfig,
  DownloadOptions,
  PDFGenerationOptions,
  ExportResult,
} from "./file.types";

// UI and component types
export type {
  Theme,
  ModalType,
  ComponentState,
  ToastNotification,
  ValidationState,
  QuickActionConfig,
  ShareOption,
  ShareData,
  DragDropState,
  ProgressState,
  SettingsPanelState,
  PreviewState,
} from "./ui.types";

// Common utility types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

// Configuration types
export interface AppConfig {
  maxFileSize: number;
  supportedFormats: string[];
  defaultQRSize: number;
  defaultErrorCorrection: "L" | "M" | "Q" | "H";
  enableAnalytics: boolean;
  enableLocalStorage: boolean;
  previewMode?: boolean;
  autoGenerate?: boolean;
}
