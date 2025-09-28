/**
 * QR Code Validation Utilities
 * Validation functions specific to QR code generation
 */

import type { QRErrorCorrectionLevel, QRImageFormat, QROptions } from "@/types";
import { sanitizeText, sanitizeUrl } from "../security/sanitization";
import {
  validateHexColor,
  validatePassword,
  validateQRMargin,
  validateQRSize,
} from "../security/validation";
import type { ValidationResult } from "./schemas";

/**
 * Validates QR options comprehensively
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Comprehensive validation requires extensive checks
export function validateQROptions(options: Partial<QROptions>): ValidationResult<QROptions> {
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
    if (typeof options.logoSize !== "number" || options.logoSize < 20 || options.logoSize > 200) {
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
    logoBackground: options.logoBackground ?? false,
    pdfPassword: options.pdfPassword || "",
    enablePdfPassword: options.enablePdfPassword ?? false,
  };

  return {
    isValid: errors.length === 0,
    data: sanitizedOptions,
    errors,
    warnings,
  };
}
