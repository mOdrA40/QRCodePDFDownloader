export interface QRFormatValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  optimizedFormat?: string;
}

export interface QRFormatOptions {
  type:
    | "wifi"
    | "email"
    | "phone"
    | "url"
    | "vcard"
    | "event"
    | "location"
    | "sms"
    | "text";
  data: Record<string, unknown>;
}

export class QRFormatService {
  private static instance: QRFormatService;

  public static getInstance(): QRFormatService {
    if (!QRFormatService.instance) {
      QRFormatService.instance = new QRFormatService();
    }
    return QRFormatService.instance;
  }

  /**
   * Validates and optimizes QR format for maximum compatibility
   */
  public validateAndOptimize(
    format: string,
    type?: string,
  ): QRFormatValidation {
    // Detect type if not provided
    const detectedType = type || this.detectQRType(format);

    switch (detectedType) {
      case "wifi":
        return this.validateWiFiFormat(format);
      case "email":
        return this.validateEmailFormat(format);
      case "phone":
        return this.validatePhoneFormat(format);
      case "url":
        return this.validateUrlFormat(format);
      case "vcard":
        return this.validateVCardFormat(format);
      case "event":
        return this.validateEventFormat(format);
      case "location":
        return this.validateLocationFormat(format);
      case "sms":
        return this.validateSMSFormat(format);
      default:
        return this.validateTextFormat(format);
    }
  }

  /**
   * Detects QR code type from format string
   */
  private detectQRType(format: string): string {
    if (format.startsWith("WIFI:")) return "wifi";
    if (format.startsWith("mailto:")) return "email";
    if (format.startsWith("tel:")) return "phone";
    if (format.startsWith("sms:")) return "sms";
    if (format.startsWith("BEGIN:VCARD")) return "vcard";
    if (format.startsWith("BEGIN:VEVENT")) return "event";
    if (format.startsWith("geo:")) return "location";
    if (format.match(/^https?:\/\//)) return "url";
    return "text";
  }

  /**
   * Validates WiFi QR format for optimal compatibility
   */
  private validateWiFiFormat(format: string): QRFormatValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check basic format
    if (!format.startsWith("WIFI:")) {
      errors.push('WiFi format must start with "WIFI:"');
    }

    // Parse WiFi parameters
    const params = this.parseWiFiParams(format);

    // Validate required fields
    if (!params.S) {
      errors.push("SSID (S parameter) is required");
    }

    // Validate security type
    if (params.T && !["WPA", "WEP", "nopass", ""].includes(params.T)) {
      warnings.push(
        "Security type should be WPA, WEP, or nopass for best compatibility",
      );
    }

    // Validate hidden parameter
    if (params.H && !["true", "false", ""].includes(params.H)) {
      warnings.push("Hidden parameter should be true or false");
    }

    // Generate optimized format
    let optimizedFormat = "WIFI:";
    optimizedFormat += `T:${params.T || "WPA"};`;
    optimizedFormat += `S:${this.escapeWiFiValue(params.S || "")};`;
    if (params.P) optimizedFormat += `P:${this.escapeWiFiValue(params.P)};`;
    if (params.H) optimizedFormat += `H:${params.H};`;
    optimizedFormat += ";";

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      optimizedFormat,
    };
  }

  /**
   * Validates email QR format
   */
  private validateEmailFormat(format: string): QRFormatValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const url = new URL(format);

      if (url.protocol !== "mailto:") {
        errors.push("Email format must use mailto: protocol");
      }

      // Validate email address
      const email = url.pathname;
      if (!this.isValidEmail(email)) {
        errors.push("Invalid email address format");
      }

      // Check for proper encoding
      const subject = url.searchParams.get("subject");
      const body = url.searchParams.get("body");

      let optimizedFormat = `mailto:${email}`;
      const params: string[] = [];

      if (subject) {
        params.push(`subject=${encodeURIComponent(subject)}`);
      }
      if (body) {
        params.push(`body=${encodeURIComponent(body)}`);
      }

      if (params.length > 0) {
        optimizedFormat += `?${params.join("&")}`;
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        optimizedFormat,
      };
    } catch {
      errors.push("Invalid mailto URL format");
      return { isValid: false, errors, warnings };
    }
  }

  /**
   * Validates phone QR format
   */
  private validatePhoneFormat(format: string): QRFormatValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!format.startsWith("tel:")) {
      errors.push('Phone format must start with "tel:"');
    }

    const phoneNumber = format.replace("tel:", "");

    // Validate phone number format
    if (!this.isValidPhoneNumber(phoneNumber)) {
      errors.push("Invalid phone number format");
    }

    // Generate optimized format (clean phone number)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");
    const optimizedFormat = `tel:${cleanPhone}`;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      optimizedFormat,
    };
  }

  /**
   * Validates URL QR format
   */
  private validateUrlFormat(format: string): QRFormatValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const url = new URL(format);

      if (!["http:", "https:"].includes(url.protocol)) {
        warnings.push("Consider using HTTPS for better security");
      }

      return {
        isValid: true,
        errors,
        warnings,
        optimizedFormat: format,
      };
    } catch {
      errors.push("Invalid URL format");
      return { isValid: false, errors, warnings };
    }
  }

  /**
   * Validates vCard QR format
   */
  private validateVCardFormat(format: string): QRFormatValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!format.startsWith("BEGIN:VCARD")) {
      errors.push('vCard must start with "BEGIN:VCARD"');
    }

    if (!format.includes("END:VCARD")) {
      errors.push('vCard must end with "END:VCARD"');
    }

    if (!format.includes("VERSION:")) {
      warnings.push(
        "vCard should include VERSION field for better compatibility",
      );
    }

    if (!format.includes("FN:")) {
      warnings.push("vCard should include FN (Full Name) field");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      optimizedFormat: format,
    };
  }

  /**
   * Validates event QR format
   */
  private validateEventFormat(format: string): QRFormatValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!format.startsWith("BEGIN:VEVENT")) {
      errors.push('Event must start with "BEGIN:VEVENT"');
    }

    if (!format.includes("END:VEVENT")) {
      errors.push('Event must end with "END:VEVENT"');
    }

    if (!format.includes("SUMMARY:")) {
      warnings.push("Event should include SUMMARY field");
    }

    if (!format.includes("DTSTART:")) {
      warnings.push("Event should include DTSTART field");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      optimizedFormat: format,
    };
  }

  /**
   * Validates location QR format
   */
  private validateLocationFormat(format: string): QRFormatValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!format.startsWith("geo:")) {
      errors.push('Location format must start with "geo:"');
    }

    try {
      const url = new URL(format);
      const query = url.searchParams.get("q");

      if (!query) {
        warnings.push(
          "Location should include query parameter for better compatibility",
        );
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        optimizedFormat: format,
      };
    } catch {
      errors.push("Invalid geo URL format");
      return { isValid: false, errors, warnings };
    }
  }

  /**
   * Validates SMS QR format
   */
  private validateSMSFormat(format: string): QRFormatValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!format.startsWith("sms:")) {
      errors.push('SMS format must start with "sms:"');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      optimizedFormat: format,
    };
  }

  /**
   * Validates text QR format
   */
  private validateTextFormat(format: string): QRFormatValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for optimal text length
    if (format.length > 2000) {
      warnings.push(
        "Text content is very long, consider shortening for better scanning",
      );
    }

    // Check for special characters that might cause issues
    // biome-ignore lint/suspicious/noControlCharactersInRegex: Need to check for control characters
    const problematicChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
    if (problematicChars.test(format)) {
      warnings.push(
        "Text contains control characters that might cause scanning issues",
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      optimizedFormat: format,
    };
  }

  // Helper methods
  private parseWiFiParams(format: string): Record<string, string> {
    const params: Record<string, string> = {};
    const parts = format.split(";");

    for (const part of parts) {
      const [key, value] = part.split(":");
      if (key && value !== undefined) {
        params[key] = value;
      }
    }

    return params;
  }

  private escapeWiFiValue(value: string): string {
    return value.replace(/[";,\\]/g, "\\$&");
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,}$/;
    return phoneRegex.test(phone);
  }
}

// Export singleton instance
export const qrFormatService = QRFormatService.getInstance();
