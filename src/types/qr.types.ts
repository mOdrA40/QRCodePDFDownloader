/**
 * QR Code related type definitions
 * Comprehensive types for QR code generation and configuration
 */

// Error correction levels for QR codes
export type QRErrorCorrectionLevel = "L" | "M" | "Q" | "H";

// Supported image formats for QR code export (including SVG for browser compatibility)
export type QRImageFormat = "png" | "jpeg" | "webp" | "svg";

// QR code size presets
export type QRSizePreset = "small" | "medium" | "large" | "xl";

// QR code color themes
export interface QRColorTheme {
  name: string;
  foreground: string;
  background: string;
}

// Main QR options interface
export interface QROptions {
  text: string;
  size: number;
  margin: number;
  errorCorrectionLevel: QRErrorCorrectionLevel;
  foreground: string;
  background: string;
  format: QRImageFormat;
  logoUrl?: string;
  logoSize?: number;
  logoBackground?: boolean;
  pdfPassword?: string;
  enablePdfPassword?: boolean;
}

// QR generation configuration
export interface QRGenerationConfig {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: QRErrorCorrectionLevel;
  color?: {
    dark?: string;
    light?: string;
  };
  format?: QRImageFormat;
}

// QR generation result with enhanced browser compatibility info
export interface QRGenerationResult {
  dataUrl: string;
  format: QRImageFormat;
  size: number;
  timestamp: number;
  method?: string; // Generation method used (server-side, client-canvas, client-svg, fallback)
  browserInfo?: string; // Browser information for debugging
  warning?: string; // Any warnings during generation
}

// QR preset for saving/loading configurations
export interface QRPreset {
  id: string;
  name: string;
  options: QROptions;
  createdAt: Date;
  updatedAt: Date;
}

// QR validation result
export interface QRValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// QR generation progress
export interface QRGenerationProgress {
  stage: "initializing" | "generating" | "processing" | "complete" | "error";
  progress: number;
  message?: string;
}

// QR code metadata
export interface QRMetadata {
  text: string;
  size: number;
  format: QRImageFormat;
  errorCorrectionLevel: QRErrorCorrectionLevel;
  generatedAt: Date;
  fileSize?: number;
}
