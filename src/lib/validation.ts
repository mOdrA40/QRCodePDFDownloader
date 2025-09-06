/**
 * Validation schemas and utilities
 * Comprehensive validation for all application inputs
 */

import type {
  FileUploadConfig,
  PDFGenerationOptions,
  QRErrorCorrectionLevel,
  QRImageFormat,
  QROptions,
} from "@/types";
import {
  sanitizeText,
  sanitizeUrl,
  validateFileName,
  validateFileSize,
  validateFileType,
  validateHexColor,
  validatePassword,
  validateQRMargin,
  validateQRSize,
} from "./security";

// Validation result interface
export interface ValidationResult<T = unknown> {
  isValid: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
}

/**
 * Validates QR options comprehensively
 */
export function validateQROptions(
  options: Partial<QROptions>,
): ValidationResult<QROptions> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate text
  if (!options.text || typeof options.text !== "string") {
    errors.push("Text is required");
  } else {
    const sanitizedText = sanitizeText(options.text);
    if (sanitizedText !== options.text) {
      warnings.push("Text content was sanitized for security");
    }
    if (sanitizedText.length === 0) {
      errors.push("Text cannot be empty after sanitization");
    }
    if (sanitizedText.length > 4296) {
      errors.push("Text exceeds maximum QR code capacity (4296 characters)");
    }
  }

  // Validate size
  if (options.size !== undefined) {
    if (!validateQRSize(options.size)) {
      errors.push("Size must be between 128 and 2048 pixels");
    }
  }

  // Validate margin
  if (options.margin !== undefined) {
    if (!validateQRMargin(options.margin)) {
      errors.push("Margin must be between 0 and 20");
    }
  }

  // Validate error correction level
  if (options.errorCorrectionLevel !== undefined) {
    const validLevels: QRErrorCorrectionLevel[] = ["L", "M", "Q", "H"];
    if (!validLevels.includes(options.errorCorrectionLevel)) {
      errors.push("Invalid error correction level");
    }
  }

  // Validate colors
  if (options.foreground !== undefined) {
    if (!validateHexColor(options.foreground)) {
      errors.push("Invalid foreground color format");
    }
  }

  if (options.background !== undefined) {
    if (!validateHexColor(options.background)) {
      errors.push("Invalid background color format");
    }
  }

  // Validate format
  if (options.format !== undefined) {
    const validFormats: QRImageFormat[] = ["png", "jpeg", "webp"];
    if (!validFormats.includes(options.format)) {
      errors.push("Invalid image format");
    }
  }

  // Validate logo URL
  if (options.logoUrl?.trim()) {
    const sanitizedUrl = sanitizeUrl(options.logoUrl);
    if (!sanitizedUrl) {
      errors.push("Invalid logo URL");
    } else if (sanitizedUrl !== options.logoUrl) {
      warnings.push("Logo URL was sanitized");
    }
  }

  // Validate logo size
  if (options.logoSize !== undefined) {
    if (
      typeof options.logoSize !== "number" ||
      options.logoSize < 20 ||
      options.logoSize > 200
    ) {
      errors.push("Logo size must be between 20 and 200 pixels");
    }
  }

  // Validate PDF password
  if (options.enablePdfPassword && options.pdfPassword) {
    const passwordValidation = validatePassword(options.pdfPassword);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  // Create sanitized options
  const sanitizedOptions: QROptions = {
    text: options.text ? sanitizeText(options.text) : "",
    size: options.size || 512,
    margin: options.margin || 4,
    errorCorrectionLevel: options.errorCorrectionLevel || "M",
    foreground: options.foreground || "#000000",
    background: options.background || "#ffffff",
    format: options.format || "png",
    logoUrl: options.logoUrl ? sanitizeUrl(options.logoUrl) || "" : "",
    logoSize: options.logoSize || 60,
    logoBackground: options.logoBackground || false,
    pdfPassword: options.pdfPassword || "",
    enablePdfPassword: options.enablePdfPassword || false,
  };

  return {
    isValid: errors.length === 0,
    data: sanitizedOptions,
    errors,
    warnings,
  };
}

/**
 * Validates PDF generation options
 */
export function validatePDFOptions(
  options: Partial<PDFGenerationOptions>,
): ValidationResult<PDFGenerationOptions> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate title
  if (options.title !== undefined) {
    if (typeof options.title !== "string") {
      errors.push("Title must be a string");
    } else if (options.title.length > 100) {
      errors.push("Title must be less than 100 characters");
    } else {
      const sanitized = sanitizeText(options.title);
      if (sanitized !== options.title) {
        warnings.push("Title was sanitized for security");
      }
    }
  }

  // Validate author
  if (options.author !== undefined) {
    if (typeof options.author !== "string") {
      errors.push("Author must be a string");
    } else if (options.author.length > 100) {
      errors.push("Author must be less than 100 characters");
    } else {
      const sanitized = sanitizeText(options.author);
      if (sanitized !== options.author) {
        warnings.push("Author was sanitized for security");
      }
    }
  }

  // Validate subject
  if (options.subject !== undefined) {
    if (typeof options.subject !== "string") {
      errors.push("Subject must be a string");
    } else if (options.subject.length > 200) {
      errors.push("Subject must be less than 200 characters");
    }
  }

  // Validate keywords
  if (options.keywords !== undefined) {
    if (!Array.isArray(options.keywords)) {
      errors.push("Keywords must be an array");
    } else if (options.keywords.length > 10) {
      errors.push("Maximum 10 keywords allowed");
    } else {
      for (const keyword of options.keywords) {
        if (typeof keyword !== "string" || keyword.length > 50) {
          errors.push(
            "Each keyword must be a string with less than 50 characters",
          );
          break;
        }
      }
    }
  }

  // Validate password
  if (options.password?.trim()) {
    const passwordValidation = validatePassword(options.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  // Validate page size
  if (options.pageSize !== undefined) {
    const validSizes = ["a4", "letter", "legal"];
    if (!validSizes.includes(options.pageSize)) {
      errors.push("Invalid page size");
    }
  }

  // Validate orientation
  if (options.orientation !== undefined) {
    const validOrientations = ["portrait", "landscape"];
    if (!validOrientations.includes(options.orientation)) {
      errors.push("Invalid orientation");
    }
  }

  // Validate margins
  if (options.margins !== undefined) {
    const { top, right, bottom, left } = options.margins;
    if (typeof top !== "number" || top < 0 || top > 50) {
      errors.push("Top margin must be between 0 and 50mm");
    }
    if (typeof right !== "number" || right < 0 || right > 50) {
      errors.push("Right margin must be between 0 and 50mm");
    }
    if (typeof bottom !== "number" || bottom < 0 || bottom > 50) {
      errors.push("Bottom margin must be between 0 and 50mm");
    }
    if (typeof left !== "number" || left < 0 || left > 50) {
      errors.push("Left margin must be between 0 and 50mm");
    }
  }

  const sanitizedOptions: PDFGenerationOptions = {
    title: options.title ? sanitizeText(options.title) : undefined,
    author: options.author ? sanitizeText(options.author) : undefined,
    subject: options.subject ? sanitizeText(options.subject) : undefined,
    keywords: options.keywords?.map((k) => sanitizeText(k)) || undefined,
    password: options.password || undefined,
    permissions: options.permissions || undefined,
    pageSize: options.pageSize || "a4",
    orientation: options.orientation || "portrait",
    margins: options.margins || { top: 20, right: 20, bottom: 20, left: 20 },
  };

  return {
    isValid: errors.length === 0,
    data: sanitizedOptions,
    errors,
    warnings,
  };
}

/**
 * Validates file upload configuration
 */
export function validateFileUpload(
  file: File,
  config: FileUploadConfig,
): ValidationResult<File> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate file name
  if (!validateFileName(file.name)) {
    errors.push("Invalid file name");
  }

  // Validate file type
  if (!validateFileType(file.type, config.allowedTypes)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Validate file size
  if (!validateFileSize(file.size, config.maxSize)) {
    errors.push(
      `File size exceeds maximum allowed size of ${Math.round(config.maxSize / 1024 / 1024)}MB`,
    );
  }

  // Check for empty file
  if (file.size === 0) {
    errors.push("File is empty");
  }

  // Additional security checks
  if (file.name.length > 255) {
    errors.push("File name is too long");
  }

  return {
    isValid: errors.length === 0,
    data: file,
    errors,
    warnings,
  };
}

/**
 * Validates preset name
 */
export function validatePresetName(name: string): ValidationResult<string> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof name !== "string") {
    errors.push("Preset name must be a string");
    return { isValid: false, errors, warnings };
  }

  const sanitized = sanitizeText(name);

  if (sanitized !== name) {
    warnings.push("Preset name was sanitized");
  }

  if (sanitized.length === 0) {
    errors.push("Preset name cannot be empty");
  }

  if (sanitized.length > 50) {
    errors.push("Preset name must be less than 50 characters");
  }

  return {
    isValid: errors.length === 0,
    data: sanitized,
    errors,
    warnings,
  };
}
