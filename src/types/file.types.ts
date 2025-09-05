/**
 * File handling and processing type definitions
 */

// Supported file types for drag and drop
export type SupportedFileType = 
  | "text/plain"
  | "application/json"
  | "text/csv"
  | "text/xml"
  | "text/html"
  | "application/pdf"
  | "image/png"
  | "image/jpeg"
  | "image/gif"
  | "image/webp";

// File processing result
export interface FileProcessingResult {
  success: boolean;
  extractedText?: string;
  error?: string;
  fileInfo: {
    name: string;
    size: number;
    type: string;
    lastModified: Date;
  };
}

// File validation result
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo: {
    name: string;
    size: number;
    type: string;
  };
}

// File upload configuration
export interface FileUploadConfig {
  maxSize: number; // in bytes
  allowedTypes: SupportedFileType[];
  maxFiles: number;
}

// Download options
export interface DownloadOptions {
  filename?: string;
  format: "pdf" | "png" | "jpeg" | "webp";
  quality?: number; // for lossy formats
  metadata?: Record<string, string>;
}

// PDF generation options
export interface PDFGenerationOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  password?: string;
  permissions?: {
    printing?: boolean;
    modifying?: boolean;
    copying?: boolean;
    annotating?: boolean;
  };
  pageSize?: "a4" | "letter" | "legal";
  orientation?: "portrait" | "landscape";
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Export result
export interface ExportResult {
  success: boolean;
  filename?: string;
  size?: number;
  format: string;
  downloadUrl?: string;
  error?: string;
}
