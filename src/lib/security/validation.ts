/**
 * Security Validation Utilities
 * Functions for validating input security and preventing attacks
 */

/**
 * Validates file name to prevent path traversal and malicious names
 */
export function validateFileName(fileName: string): boolean {
  if (typeof fileName !== "string" || !fileName.trim()) {
    return false;
  }

  // Check for dangerous patterns
  const dangerousFilePatterns = [
    /\.\./,
    /[<>:"|?*]/,
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i,
    /\.(exe|bat|cmd|scr|pif|com|dll|vbs|js|jar|app|deb|rpm)$/i,
  ];

  return !dangerousFilePatterns.some((pattern) => pattern.test(fileName));
}

/**
 * Validates file type against allowed types
 */
export function validateFileType(fileType: string, allowedTypes: string[]): boolean {
  if (typeof fileType !== "string" || !Array.isArray(allowedTypes)) {
    return false;
  }

  return allowedTypes.includes(fileType.toLowerCase());
}

/**
 * Validates file size
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return typeof size === "number" && size > 0 && size <= maxSize;
}

/**
 * Validates hex color format
 */
export function validateHexColor(color: string): boolean {
  if (typeof color !== "string") {
    return false;
  }
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validates QR code size
 */
export function validateQRSize(size: number): boolean {
  return typeof size === "number" && size >= 128 && size <= 2048;
}

/**
 * Validates QR code margin
 */
export function validateQRMargin(margin: number): boolean {
  return typeof margin === "number" && margin >= 0 && margin <= 20;
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof password !== "string") {
    errors.push("Password must be a string");
    return { isValid: false, errors };
  }

  if (password.length < 4) {
    errors.push("Password must be at least 4 characters long");
  }

  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }

  // Check for common weak passwords
  const weakPasswords = ["password", "123456", "qwerty", "admin", "guest"];
  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
