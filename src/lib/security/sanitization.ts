/**
 * Input Sanitization Utilities
 * Functions for sanitizing user input to prevent XSS and injection attacks
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
  /(\||&|;|\$\(|`)/g,

  // Path traversal
  /\.\.\//g,
  /\.\.\\/g,
];

// Allowed URL schemes
const ALLOWED_URL_SCHEMES = ["http:", "https:", "mailto:", "tel:", "sms:", "ftp:"];

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
      return code === 9 || code === 10 || (code >= 32 && code <= 126) || code > 127;
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
    if (parsedUrl.protocol === "javascript:" || parsedUrl.protocol === "data:") {
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
