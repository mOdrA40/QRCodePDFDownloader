/**
 * Enhanced QR Code Generation Service
 * Handles all QR code generation logic with server-side support, browser compatibility,
 * and proper error handling for LibreWolf and other privacy-focused browsers
 */

import QRCode from "qrcode";
import type {
  QRGenerationConfig,
  QRGenerationResult,
  QRImageFormat,
  QRMetadata,
  QROptions,
  QRValidationResult,
} from "@/types";
import { QRGenerationMethod, simpleBrowserDetectionService } from "./browser-detection-simple";

// Browser capability detection interface
interface BrowserCapabilities {
  supportsCanvas: boolean;
  supportsWebGL: boolean;
  isPrivacyBrowser: boolean;
  devicePixelRatio: number;
  userAgent: string;
}

export class QRService {
  private static instance: QRService;
  private browserCapabilities: BrowserCapabilities | null = null;
  private qrCache: Map<string, { result: QRGenerationResult; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

  public static getInstance(): QRService {
    if (!QRService.instance) {
      QRService.instance = new QRService();
    }
    return QRService.instance;
  }

  /**
   * Determine the best QR generation method
   */
  private determineBestMethod(): QRGenerationMethod {
    const capabilities = simpleBrowserDetectionService.detectCapabilities();

    console.log("Browser capabilities:", simpleBrowserDetectionService.getCapabilitySummary());

    return capabilities.recommendedMethod;
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
   * Enhanced QR code generation with caching and automatic method selection
   * Supports server-side generation for maximum browser compatibility
   */
  public async generateQRCode(
    text: string,
    options: QRGenerationConfig = {},
    useCache = true
  ): Promise<QRGenerationResult> {
    try {
      // Validate input
      const validation = this.validateQRInput(text, options);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const config = this.buildQRConfig(options);

      // Generate cache key
      const cacheKey = this.generateCacheKey(text, config);

      // Check cache first if enabled
      if (useCache) {
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
          console.log("Using cached QR result");
          return cached;
        }
      }

      const method = this.determineBestMethod();
      console.log(`Using QR generation method: ${method}`);

      let result: QRGenerationResult;

      switch (method) {
        case QRGenerationMethod.SERVER_SIDE:
          result = await this.generateServerSide(text, config);
          break;
        case QRGenerationMethod.CLIENT_CANVAS:
          result = await this.generateWithCanvas(text, config);
          break;
        default:
          result = await this.generateFallback(text, config);
          break;
      }

      const finalResult = {
        ...result,
        method,
        browserInfo: this.browserCapabilities?.userAgent || "unknown",
      };

      // Cache the result if enabled
      if (useCache) {
        this.setCachedResult(cacheKey, finalResult);
      }

      return finalResult;
    } catch (error) {
      console.error("Primary QR generation failed, trying fallback:", error);

      // Try fallback method if primary fails
      try {
        const fallbackResult = await this.generateFallback(text, this.buildQRConfig(options));
        return {
          ...fallbackResult,
          method: QRGenerationMethod.FALLBACK,
          browserInfo: this.browserCapabilities?.userAgent || "unknown",
          warning: "Used fallback method due to primary generation failure",
        };
      } catch (_fallbackError) {
        throw new Error(
          `QR generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
  }

  /**
   * Server-side QR generation using Next.js API route
   * Most reliable method for privacy browsers like LibreWolf
   */
  private async generateServerSide(
    text: string,
    config: QRGenerationConfig
  ): Promise<QRGenerationResult> {
    try {
      const response = await fetch("/api/qr/server-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          options: {
            size: config.size,
            margin: config.margin,
            errorCorrectionLevel: config.errorCorrectionLevel,
            foreground: config.color?.dark,
            background: config.color?.light,
            format: config.format,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server responded with ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Server-side generation failed");
      }

      return {
        dataUrl: result.dataUrl,
        format: (config.format || "png") as QRImageFormat,
        size: result.size || config.size || 512,
        timestamp: result.timestamp || Date.now(),
        method: result.method || "server-side-api",
        browserInfo: "server-generated",
      };
    } catch (error) {
      throw new Error(
        `Server-side generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Fallback generation method using pure QRCode library
   */
  private async generateFallback(
    text: string,
    config: QRGenerationConfig
  ): Promise<QRGenerationResult> {
    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: config.size || 512,
        margin: config.margin || 4,
        errorCorrectionLevel: config.errorCorrectionLevel || "M",
        color: {
          dark: config.color?.dark || "#000000",
          light: config.color?.light || "#ffffff",
        },
      });

      return {
        dataUrl,
        format: config.format || "png",
        size: config.size || 512,
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(
        `Fallback generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Generates QR code using canvas with proper DPI scaling
   */
  private generateWithCanvas(
    text: string,
    config: QRGenerationConfig
  ): Promise<QRGenerationResult> {
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

            resolve({
              dataUrl,
              format: config.format || "png",
              size: config.size || 512,
              timestamp: Date.now(),
              method: "client-canvas",
            });
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
   * Generate cache key for QR generation
   */
  private generateCacheKey(text: string, config: QRGenerationConfig): string {
    const keyData = {
      text,
      size: config.size,
      margin: config.margin,
      errorCorrectionLevel: config.errorCorrectionLevel,
      format: config.format,
      foreground: config.color?.dark,
      background: config.color?.light,
    };
    return btoa(JSON.stringify(keyData)).replace(/[+/=]/g, "");
  }

  /**
   * Get cached QR result if valid
   */
  private getCachedResult(cacheKey: string): QRGenerationResult | null {
    const cached = this.qrCache.get(cacheKey);
    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.qrCache.delete(cacheKey);
      return null;
    }

    return cached.result;
  }

  /**
   * Set cached QR result
   */
  private setCachedResult(cacheKey: string, result: QRGenerationResult): void {
    // Clean old cache entries periodically
    if (this.qrCache.size > 50) {
      const now = Date.now();
      for (const [key, value] of this.qrCache.entries()) {
        if (now - value.timestamp > this.CACHE_TTL) {
          this.qrCache.delete(key);
        }
      }
    }

    this.qrCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
    });
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
    return Math.round(((base64?.length ?? 0) * 3) / 4);
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
