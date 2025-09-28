/**
 * Validation Schemas and Interfaces
 * Common validation interfaces and result types
 */

// Validation result interface
export interface ValidationResult<T = unknown> {
  isValid: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
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

  // Import sanitizeText dynamically to avoid circular dependency
  const sanitized = name.trim();

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
