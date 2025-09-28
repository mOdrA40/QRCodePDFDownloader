/**
 * PDF Validation Utilities
 * Validation functions specific to PDF generation
 */

import type { PDFGenerationOptions } from "@/types";
import { sanitizeText } from "../security/sanitization";
import { validatePassword } from "../security/validation";
import type { ValidationResult } from "./schemas";

/**
 * Validates PDF generation options
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Comprehensive PDF validation requires extensive checks
export function validatePDFOptions(
  options: Partial<PDFGenerationOptions>
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
          errors.push("Each keyword must be a string with less than 50 characters");
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
    ...(options.title && { title: sanitizeText(options.title) }),
    ...(options.author && { author: sanitizeText(options.author) }),
    ...(options.subject && { subject: sanitizeText(options.subject) }),
    ...(options.keywords && {
      keywords: options.keywords.map((k) => sanitizeText(k)),
    }),
    ...(options.password && { password: options.password }),
    ...(options.permissions && { permissions: options.permissions }),
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
