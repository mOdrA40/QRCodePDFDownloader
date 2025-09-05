/**
 * QR Code Generation Service
 * Handles all QR code generation logic with proper error handling and validation
 */

import QRCode from "qrcode";
import type {
  QROptions,
  QRGenerationConfig,
  QRGenerationResult,
  QRValidationResult,
  QRMetadata,
} from "@/types";

export class QRService {
  private static instance: QRService;

  public static getInstance(): QRService {
    if (!QRService.instance) {
      QRService.instance = new QRService();
    }
    return QRService.instance;
  }

  /**
   * Validates QR code input and configuration
   */
  public validateQRInput(text: string, options?: Partial<QROptions>): QRValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Text validation
    if (!text || text.trim().length === 0) {
      errors.push("Text content is required");
    }

    if (text.length > 4296) {
      errors.push("Text content exceeds maximum length (4296 characters)");
    }

    // Size validation
    if (options?.size) {
      if (options.size < 128 || options.size > 2048) {
        errors.push("Size must be between 128 and 2048 pixels");
      }
    }

    // Margin validation
    if (options?.margin !== undefined) {
      if (options.margin < 0 || options.margin > 20) {
        errors.push("Margin must be between 0 and 20");
      }
    }

    // Color validation
    if (options?.foreground && !this.isValidHexColor(options.foreground)) {
      errors.push("Invalid foreground color format");
    }

    if (options?.background && !this.isValidHexColor(options.background)) {
      errors.push("Invalid background color format");
    }

    // Logo validation
    if (options?.logoUrl) {
      if (!this.isValidUrl(options.logoUrl)) {
        warnings.push("Logo URL may not be valid");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generates QR code with proper DPI handling and error management
   */
  public async generateQRCode(
    text: string,
    options: QRGenerationConfig = {}
  ): Promise<QRGenerationResult> {
    try {
      // Validate input
      const validation = this.validateQRInput(text, options);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const config = this.buildQRConfig(options);
      const dataUrl = await this.generateWithCanvas(text, config);

      return {
        dataUrl,
        format: config.format || "png",
        size: config.size || 512,
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(`QR generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Generates QR code using canvas with proper DPI scaling
   */
  private async generateWithCanvas(
    text: string,
    config: QRGenerationConfig
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        const size = config.size || 512;
        const dpr = window.devicePixelRatio || 1;
        const format = config.format || "png";

        // Set canvas size with DPI scaling
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;

        // Scale context for DPI
        ctx.scale(dpr, dpr);

        // Generate QR code
        QRCode.toCanvas(canvas, text, {
          width: size,
          margin: config.margin || 4,
          errorCorrectionLevel: "M",
          color: {
            dark: config.color?.dark || "#000000",
            light: config.color?.light || "#ffffff",
          },
        })
          .then(() => {
            const quality = 0.95;
            let dataUrl: string;

            switch (format) {
              case "jpeg":
                dataUrl = canvas.toDataURL("image/jpeg", quality);
                break;
              case "webp":
                dataUrl = canvas.toDataURL("image/webp", quality);
                break;
              default:
                dataUrl = canvas.toDataURL("image/png");
                break;
            }

            resolve(dataUrl);
          })
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Builds QR configuration from options
   */
  private buildQRConfig(options: QRGenerationConfig): QRGenerationConfig {
    return {
      size: options.size || 512,
      margin: options.margin || 4,
      errorCorrectionLevel: options.errorCorrectionLevel || "M",
      format: options.format || "png",
      color: {
        dark: options.color?.dark || "#000000",
        light: options.color?.light || "#ffffff",
      },
    };
  }

  /**
   * Extracts metadata from QR generation result
   */
  public extractMetadata(text: string, result: QRGenerationResult): QRMetadata {
    return {
      text,
      size: result.size,
      format: result.format,
      errorCorrectionLevel: "M", // Default for now
      generatedAt: new Date(result.timestamp),
      fileSize: this.estimateFileSize(result.dataUrl),
    };
  }

  /**
   * Estimates file size from data URL
   */
  private estimateFileSize(dataUrl: string): number {
    const base64 = dataUrl.split(",")[1];
    return Math.round((base64.length * 3) / 4);
  }

  /**
   * Validates hex color format
   */
  private isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  /**
   * Validates URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const qrService = QRService.getInstance();
