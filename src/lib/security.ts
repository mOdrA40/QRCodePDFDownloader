/**
 * Security utilities for input validation and sanitization
 * Implements comprehensive security measures to prevent XSS, injection attacks, and other vulnerabilities
 */

// Dangerous patterns that should be blocked
const DANGEROUS_PATTERNS = [
  // Script injection patterns
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /onmouseover\s*=/gi,

  // Data URI with executable content
  /data:text\/html/gi,
  /data:application\/javascript/gi,

  // SQL injection patterns
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,

  // Command injection patterns
  /(\||&|;|\$\(|\`)/g,

  // Path traversal
  /\.\.\//g,
  /\.\.\\/g,
];

// Allowed URL schemes
const ALLOWED_URL_SCHEMES = [
  "http:",
  "https:",
  "mailto:",
  "tel:",
  "sms:",
  "ftp:",
];

/**
 * Sanitizes text input to prevent XSS and injection attacks
 */
export function sanitizeText(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  let sanitized = input;

  // Remove dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }

  // Remove control characters except newlines and tabs
  sanitized = sanitized
    .split("")
    .filter((char) => {
      const code = char.charCodeAt(0);
      // Allow newline (10), tab (9), and printable characters (32-126)
      return (
        code === 9 || code === 10 || (code >= 32 && code <= 126) || code > 127
      );
    })
    .join("");

  // Limit length to prevent DoS
  sanitized = sanitized.slice(0, 10000);

  return sanitized.trim();
}

/**
 * Validates and sanitizes URL input
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== "string" || !url.trim()) {
    return null;
  }

  try {
    const parsedUrl = new URL(url.trim());

    // Check if scheme is allowed
    if (!ALLOWED_URL_SCHEMES.includes(parsedUrl.protocol)) {
      return null;
    }

    // Additional validation for specific schemes
    if (
      parsedUrl.protocol === "javascript:" ||
      parsedUrl.protocol === "data:"
    ) {
      return null;
    }

    // Validate hostname for http/https
    if (["http:", "https:"].includes(parsedUrl.protocol)) {
      if (!parsedUrl.hostname || parsedUrl.hostname.length > 253) {
        return null;
      }
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

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
export function validateFileType(
  fileType: string,
  allowedTypes: string[],
): boolean {
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

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 10, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const validAttempts = attempts.filter((time) => now - time < this.windowMs);

    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);

    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Content Security Policy helpers
 */
export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'"],
  fontSrc: ["'self'"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'none'"],
} as const;

/**
 * Generates a Content Security Policy string
 */
export function generateCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
    .join("; ");
}
