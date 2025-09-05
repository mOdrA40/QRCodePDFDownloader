export interface SecurityValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedInput?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface SecurityConfig {
  maxInputLength: number;
  allowedProtocols: string[];
  blockedDomains: string[];
  maxFileSize: number;
  enableContentSanitization: boolean;
}

export class SecurityService {
  private static instance: SecurityService;
  
  private readonly defaultConfig: SecurityConfig = {
    maxInputLength: 4000, // Maximum QR code capacity
    allowedProtocols: ['http:', 'https:', 'mailto:', 'tel:', 'sms:', 'geo:'],
    blockedDomains: [
      'malware.com',
      'phishing.com',
      'suspicious.net',
      // Add more known malicious domains
    ],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    enableContentSanitization: true
  };

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Validates input for security vulnerabilities and potential threats
   */
  public validateInput(input: string, type?: string): SecurityValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    // Input length validation
    if (input.length > this.defaultConfig.maxInputLength) {
      errors.push(`Input exceeds maximum length of ${this.defaultConfig.maxInputLength} characters`);
      riskLevel = 'high';
    }

    // Check for potential XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        errors.push('Input contains potentially malicious script content');
        riskLevel = 'high';
        break;
      }
    }

    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /('|(\\')|(;)|(--)|(\|)|(\*)|(%)|(\+))/g
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        warnings.push('Input contains SQL-like patterns that might be suspicious');
        if (riskLevel === 'low') riskLevel = 'medium';
        break;
      }
    }

    // URL-specific validation
    if (type === 'url' || input.match(/^https?:\/\//)) {
      const urlValidation = this.validateURL(input);
      errors.push(...urlValidation.errors);
      warnings.push(...urlValidation.warnings);
      if (urlValidation.riskLevel === 'high') riskLevel = 'high';
      else if (urlValidation.riskLevel === 'medium' && riskLevel === 'low') riskLevel = 'medium';
    }

    // Email-specific validation
    if (type === 'email' || input.startsWith('mailto:')) {
      const emailValidation = this.validateEmail(input);
      errors.push(...emailValidation.errors);
      warnings.push(...emailValidation.warnings);
    }

    // Check for suspicious file extensions in URLs
    const suspiciousExtensions = /\.(exe|bat|cmd|scr|pif|com|vbs|js|jar|app|dmg)(\?|$)/gi;
    if (suspiciousExtensions.test(input)) {
      warnings.push('Input contains potentially dangerous file extensions');
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    // Sanitize input if enabled
    let sanitizedInput = input;
    if (this.defaultConfig.enableContentSanitization) {
      sanitizedInput = this.sanitizeInput(input);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedInput,
      riskLevel
    };
  }

  /**
   * Validates URLs for security threats
   */
  private validateURL(url: string): SecurityValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    try {
      const urlObj = new URL(url);
      
      // Check protocol
      if (!this.defaultConfig.allowedProtocols.includes(urlObj.protocol)) {
        errors.push(`Protocol ${urlObj.protocol} is not allowed`);
        riskLevel = 'high';
      }

      // Check for blocked domains
      if (this.defaultConfig.blockedDomains.includes(urlObj.hostname)) {
        errors.push('Domain is in the blocked list');
        riskLevel = 'high';
      }

      // Check for suspicious patterns in hostname
      const suspiciousPatterns = [
        /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP addresses
        /[a-z0-9]+-[a-z0-9]+-[a-z0-9]+\.(tk|ml|ga|cf)$/i, // Suspicious TLDs
        /bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly/i // URL shorteners
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(urlObj.hostname)) {
          warnings.push('URL contains potentially suspicious patterns');
          if (riskLevel === 'low') riskLevel = 'medium';
          break;
        }
      }

      // Check for non-standard ports
      if (urlObj.port && !['80', '443', '8080', '8443'].includes(urlObj.port)) {
        warnings.push('URL uses non-standard port');
        if (riskLevel === 'low') riskLevel = 'medium';
      }

    } catch {
      errors.push('Invalid URL format');
      riskLevel = 'high';
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskLevel
    };
  }

  /**
   * Validates email addresses for security threats
   */
  private validateEmail(email: string): SecurityValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    try {
      const url = new URL(email);
      const emailAddress = url.pathname;
      
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailAddress)) {
        errors.push('Invalid email format');
        riskLevel = 'high';
      }

      // Check for suspicious email patterns
      const suspiciousPatterns = [
        /noreply|no-reply|donotreply/i,
        /admin|administrator|root|system/i,
        /[0-9]{10,}@/i // Long numeric prefixes
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(emailAddress)) {
          warnings.push('Email address contains potentially suspicious patterns');
          if (riskLevel === 'low') riskLevel = 'medium';
          break;
        }
      }

      // Check email parameters for XSS
      const subject = url.searchParams.get('subject');
      const body = url.searchParams.get('body');
      
      if (subject && this.containsXSS(subject)) {
        errors.push('Email subject contains potentially malicious content');
        riskLevel = 'high';
      }
      
      if (body && this.containsXSS(body)) {
        errors.push('Email body contains potentially malicious content');
        riskLevel = 'high';
      }

    } catch {
      errors.push('Invalid mailto URL format');
      riskLevel = 'high';
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskLevel
    };
  }

  /**
   * Checks for XSS patterns in text
   */
  private containsXSS(text: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /data:text\/html/gi
    ];

    return xssPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Sanitizes input by removing potentially dangerous content
   */
  private sanitizeInput(input: string): string {
    let sanitized = input;
    
    // Remove script tags
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
    
    // Remove javascript: protocols
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    
    // Remove iframe tags
    sanitized = sanitized.replace(/<iframe[^>]*>/gi, '');
    
    // Limit length
    if (sanitized.length > this.defaultConfig.maxInputLength) {
      sanitized = sanitized.substring(0, this.defaultConfig.maxInputLength);
    }
    
    return sanitized;
  }

  /**
   * Validates file uploads for security
   */
  public validateFile(file: File): SecurityValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check file size
    if (file.size > this.defaultConfig.maxFileSize) {
      errors.push(`File size exceeds maximum of ${this.defaultConfig.maxFileSize / (1024 * 1024)}MB`);
      riskLevel = 'high';
    }

    // Check file type
    const allowedTypes = ['text/plain', 'application/json', 'text/csv', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type is not allowed');
      riskLevel = 'high';
    }

    // Check filename for suspicious patterns
    const suspiciousFilenames = /\.(exe|bat|cmd|scr|pif|com|vbs|js|jar)$/i;
    if (suspiciousFilenames.test(file.name)) {
      errors.push('Filename contains suspicious extension');
      riskLevel = 'high';
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskLevel
    };
  }

  /**
   * Rate limiting check (simple implementation)
   */
  public checkRateLimit(identifier: string): boolean {
    // In a real implementation, this would use Redis or similar
    // For now, we'll use a simple in-memory approach
    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    
    // This is a simplified implementation
    // In production, implement proper rate limiting with Redis
    return true;
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance();
