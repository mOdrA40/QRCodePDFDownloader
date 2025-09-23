/**
 * Central export file for all type definitions
 * This file provides a single import point for all types across the application
 */

// File handling types
export type {
  DownloadOptions,
  ExportResult,
  FileProcessingResult,
  FileUploadConfig,
  FileValidationResult,
  PDFGenerationOptions,
  SupportedFileType,
} from "./file.types";
// QR Code types
export type {
  QRColorTheme,
  QRErrorCorrectionLevel,
  QRGenerationConfig,
  QRGenerationProgress,
  QRGenerationResult,
  QRHistorySaveResult,
  QRImageFormat,
  QRMetadata,
  QROptions,
  QRPreset,
  QRSizePreset,
  QRValidationResult,
} from "./qr.types";
// UI and component types
export type {
  ComponentState,
  DragDropState,
  ModalType,
  PreviewState,
  ProgressState,
  QuickActionConfig,
  SettingsPanelState,
  ShareData,
  ShareOption,
  Theme,
  ToastNotification,
  ValidationState,
} from "./ui.types";
// Usage statistics types
export type {
  UsageAnalytics,
  UsageEvent,
  UsagePreferences,
  UsageStats,
} from "./usage.types";

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
