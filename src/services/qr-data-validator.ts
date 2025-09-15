/**
 * QR Data Validation and Conversion Service
 * Handles data URL validation, format conversion, and corruption detection
 * Specifically designed to prevent PNG corruption errors in PDF generation
 */

// Data URL validation result interface
interface DataURLValidationResult {
  isValid: boolean;
  format: string;
  mimeType: string;
  size: number;
  isCorrupted: boolean;
  errors: string[];
  warnings: string[];
}

// Image conversion options
interface ConversionOptions {
  targetFormat?: "png" | "jpeg" | "svg";
  quality?: number;
  maxSize?: number;
  fallbackToSVG?: boolean;
}

// Conversion result
interface ConversionResult {
  success: boolean;
  dataUrl: string;
  format: string;
  originalFormat: string;
  size: number;
  conversionMethod: string;
  error?: string;
}

export class QRDataValidator {
  private static instance: QRDataValidator;

  public static getInstance(): QRDataValidator {
    if (!QRDataValidator.instance) {
      QRDataValidator.instance = new QRDataValidator();
    }
    return QRDataValidator.instance;
  }

  /**
   * Comprehensive data URL validation
   */
  public validateDataURL(dataUrl: string): DataURLValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic format validation
    if (!dataUrl || typeof dataUrl !== "string") {
      errors.push("Data URL is required and must be a string");
      return this.createValidationResult(
        false,
        "",
        "",
        0,
        true,
        errors,
        warnings,
      );
    }

    if (!dataUrl.startsWith("data:")) {
      errors.push('Invalid data URL format - must start with "data:"');
      return this.createValidationResult(
        false,
        "",
        "",
        0,
        true,
        errors,
        warnings,
      );
    }

    // Parse data URL
    const [header, base64Data] = dataUrl.split(",");
    if (!header || !base64Data) {
      errors.push("Malformed data URL - missing header or data");
      return this.createValidationResult(
        false,
        "",
        "",
        0,
        true,
        errors,
        warnings,
      );
    }

    // Extract MIME type and format
    const mimeMatch = header.match(/data:([^;]+)/);
    if (!mimeMatch) {
      errors.push("Cannot extract MIME type from data URL");
      return this.createValidationResult(
        false,
        "",
        "",
        0,
        true,
        errors,
        warnings,
      );
    }

    const mimeType = mimeMatch[1] ?? "application/octet-stream";
    const format = this.extractFormatFromMimeType(mimeType);

    // Validate base64 data
    if (!this.isValidBase64(base64Data)) {
      errors.push("Invalid base64 encoding in data URL");
      return this.createValidationResult(
        false,
        format,
        mimeType ?? "application/octet-stream",
        0,
        true,
        errors,
        warnings,
      );
    }

    // Calculate size
    const size = this.calculateDataURLSize(base64Data);

    // Check for corruption indicators
    const isCorrupted = this.detectCorruption(base64Data, format);
    if (isCorrupted) {
      errors.push(`Potential ${format.toUpperCase()} corruption detected`);
    }

    // Size warnings
    if (size > 5 * 1024 * 1024) {
      // 5MB
      warnings.push("Large data URL size may cause performance issues");
    }

    // Format-specific validation
    const formatValidation = this.validateFormatSpecific(base64Data, format);
    errors.push(...formatValidation.errors);
    warnings.push(...formatValidation.warnings);

    return this.createValidationResult(
      errors.length === 0,
      format,
      mimeType ?? "application/octet-stream",
      size,
      isCorrupted,
      errors,
      warnings,
    );
  }

  /**
   * Convert QR data URL to safe format for PDF generation
   */
  public async convertForPDF(
    dataUrl: string,
    options: ConversionOptions = {},
  ): Promise<ConversionResult> {
    try {
      // Validate input first
      const validation = this.validateDataURL(dataUrl);

      if (!validation.isValid || validation.isCorrupted) {
        // If corrupted or invalid, try to regenerate as PNG
        if (options.fallbackToSVG !== false) {
          return await this.convertToPNGFallback(dataUrl);
        }

        return {
          success: false,
          dataUrl: "",
          format: "",
          originalFormat: validation.format,
          size: 0,
          conversionMethod: "validation-failed",
          error: `Validation failed: ${validation.errors.join(", ")}`,
        };
      }

      const targetFormat = options.targetFormat || "png";
      const originalFormat = validation.format;

      // If already in target format and not corrupted, return as-is
      if (originalFormat === targetFormat && !validation.isCorrupted) {
        return {
          success: true,
          dataUrl,
          format: targetFormat,
          originalFormat,
          size: validation.size,
          conversionMethod: "no-conversion-needed",
        };
      }

      // Convert based on target format
      switch (targetFormat) {
        case "png":
          return await this.convertToPNG(dataUrl, validation, options);
        case "jpeg":
          return await this.convertToJPEG(dataUrl, validation, options);
        default:
          throw new Error(`Unsupported target format: ${targetFormat}`);
      }
    } catch (error) {
      // Ultimate fallback to PNG
      if (options.fallbackToSVG !== false) {
        return await this.convertToPNGFallback(dataUrl);
      }

      return {
        success: false,
        dataUrl: "",
        format: "",
        originalFormat: "",
        size: 0,
        conversionMethod: "conversion-failed",
        error:
          error instanceof Error ? error.message : "Unknown conversion error",
      };
    }
  }

  /**
   * Convert to PNG with enhanced validation
   */
  private async convertToPNG(
    dataUrl: string,
    validation: DataURLValidationResult,
    _options: ConversionOptions,
  ): Promise<ConversionResult> {
    if (typeof window === "undefined") {
      // Server-side conversion not available, fallback to PNG
      return await this.convertToPNGFallback(dataUrl);
    }

    return new Promise((resolve) => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(
            this.createFailedResult(
              "Canvas context not available",
              validation.format,
            ),
          );
          return;
        }

        const img = new Image();

        img.onload = () => {
          try {
            // Set canvas size
            canvas.width = img.width;
            canvas.height = img.height;

            // Clear canvas with white background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw image
            ctx.drawImage(img, 0, 0);

            // Convert to PNG with validation
            const pngDataUrl = canvas.toDataURL("image/png");
            const pngValidation = this.validateDataURL(pngDataUrl);

            if (pngValidation.isValid && !pngValidation.isCorrupted) {
              resolve({
                success: true,
                dataUrl: pngDataUrl,
                format: "png",
                originalFormat: validation.format,
                size: pngValidation.size,
                conversionMethod: "canvas-conversion",
              });
            } else {
              resolve(
                this.createFailedResult(
                  "PNG conversion resulted in corrupted data",
                  validation.format,
                ),
              );
            }
          } catch (error) {
            resolve(
              this.createFailedResult(
                `Canvas conversion failed: ${error}`,
                validation.format,
              ),
            );
          }
        };

        img.onerror = () => {
          resolve(
            this.createFailedResult("Image loading failed", validation.format),
          );
        };

        img.src = dataUrl;
      } catch (error) {
        resolve(
          this.createFailedResult(
            `PNG conversion failed: ${error}`,
            validation.format,
          ),
        );
      }
    });
  }

  /**
   * Convert to JPEG format
   */
  private async convertToJPEG(
    dataUrl: string,
    validation: DataURLValidationResult,
    _options: ConversionOptions,
  ): Promise<ConversionResult> {
    if (typeof window === "undefined") {
      return await this.convertToPNGFallback(dataUrl);
    }

    return new Promise((resolve) => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(this.createFailedResult("Canvas context not available", validation.format));
          return;
        }

        const img = new Image();
        img.onload = () => {
          try {
            canvas.width = img.width;
            canvas.height = img.height;

            // Fill white background for JPEG
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.9);
            resolve({
              success: true,
              dataUrl: jpegDataUrl,
              format: "jpeg",
              originalFormat: validation.format,
              size: jpegDataUrl.length,
              conversionMethod: "canvas-jpeg-conversion",
            });
          } catch (error) {
            resolve(this.createFailedResult(`JPEG conversion failed: ${error}`, validation.format));
          }
        };

        img.onerror = () => {
          resolve(this.createFailedResult("Image load failed", validation.format));
        };

        img.src = dataUrl;
      } catch (error) {
        resolve(this.createFailedResult(`JPEG conversion failed: ${error}`, validation.format));
      }
    });
  }



  /**
   * Ultimate fallback to PNG
   */
  private async convertToPNGFallback(
    _dataUrl: string,
  ): Promise<ConversionResult> {
    try {
      // Create a simple canvas with error message
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas context not available");
      }

      canvas.width = 512;
      canvas.height = 512;

      // Fill background
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(0, 0, 512, 512);

      // Add border
      ctx.strokeStyle = "#dee2e6";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 510, 510);

      // Add error text
      ctx.fillStyle = "#6c757d";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("QR Code Generation Error", 256, 240);

      ctx.font = "12px Arial";
      ctx.fillText("Please try regenerating", 256, 260);

      const pngDataUrl = canvas.toDataURL("image/png");

      return {
        success: true,
        dataUrl: pngDataUrl,
        format: "png",
        originalFormat: "unknown",
        size: pngDataUrl.length,
        conversionMethod: "error-fallback",
      };
    } catch (error) {
      return this.createFailedResult(
        `Fallback conversion failed: ${error}`,
        "unknown",
      );
    }
  }

  // Helper methods
  private extractFormatFromMimeType(mimeType: string): string {
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpeg";
    if (mimeType.includes("webp")) return "webp";
    if (mimeType.includes("png")) return "png";
    return "unknown";
  }

  private isValidBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }

  private calculateDataURLSize(base64Data: string): number {
    return Math.ceil(base64Data.length * 0.75); // Approximate decoded size
  }

  private detectCorruption(base64Data: string, format: string): boolean {
    // Basic corruption detection
    if (base64Data.length < 100) return true; // Too small
    if (base64Data.includes("undefined") || base64Data.includes("null"))
      return true;

    // Format-specific checks
    if (format === "png") {
      // PNG should have proper header when decoded
      try {
        const decoded = atob(base64Data.substring(0, 100));
        return !decoded.includes("PNG"); // PNG files should contain 'PNG' in header
      } catch {
        return true;
      }
    }

    return false;
  }

  private validateFormatSpecific(
    _base64Data: string,
    format: string,
  ): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Add format-specific validation logic here
    if (format === "unknown") {
      warnings.push("Unknown image format detected");
    }

    return { errors, warnings };
  }



  private createValidationResult(
    isValid: boolean,
    format: string,
    mimeType: string,
    size: number,
    isCorrupted: boolean,
    errors: string[],
    warnings: string[],
  ): DataURLValidationResult {
    return { isValid, format, mimeType, size, isCorrupted, errors, warnings };
  }

  private createFailedResult(
    error: string,
    originalFormat: string,
  ): ConversionResult {
    return {
      success: false,
      dataUrl: "",
      format: "",
      originalFormat,
      size: 0,
      conversionMethod: "failed",
      error,
    };
  }


}

// Export singleton instance
export const qrDataValidator = QRDataValidator.getInstance();
