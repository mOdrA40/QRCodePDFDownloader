/**
 * File Validation Utilities
 * Validation functions for file uploads and operations
 */

import type { FileUploadConfig } from "@/types";
import { validateFileName, validateFileSize, validateFileType } from "../security/validation";
import type { ValidationResult } from "./schemas";

/**
 * Validates file upload configuration
 */
export function validateFileUpload(file: File, config: FileUploadConfig): ValidationResult<File> {
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
      `File size exceeds maximum allowed size of ${Math.round(config.maxSize / 1024 / 1024)}MB`
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
