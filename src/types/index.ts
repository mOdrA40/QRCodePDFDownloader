/**
 * Central export file for all type definitions.
 */

// Core types
export type {
  ApiResponse,
  AppConfig,
  AppError,
  PaginatedResponse,
} from "./core";
// Core application types
export * from "./core";
// Feature-specific types
export * from "./features";
// Usage statistics types
export type {
  UsageAnalytics,
  UsageEvent,
  UsagePreferences,
  UsageStats,
} from "./features/analytics";
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
} from "./features/qr";
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
} from "./features/ui";
// File handling types
export type {
  DownloadOptions,
  ExportResult,
  FileProcessingResult,
  FileUploadConfig,
  FileValidationResult,
  PDFGenerationOptions,
  SupportedFileType,
} from "./infrastructure";
// Infrastructure types
export * from "./infrastructure";
// Shared utility types
export * from "./shared";
