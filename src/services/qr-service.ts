/**
 * Enhanced QR Code Generation Service
 * Handles all QR code generation logic with server-side support, browser compatibility,
 * and proper error handling for LibreWolf and other privacy-focused browsers
 */

import type {
  QRGenerationConfig,
  QRGenerationResult,
  QRMetadata,
  QROptions,
  QRValidationResult,
} from "@/types";
import QRCode from "qrcode";
import {
  RecommendedMethod,
  browserDetectionService,
} from "./browser-detection-service";
import { svgQRService } from "./svg-qr-service";

// Enhanced generation methods enum
enum QRGenerationMethod {
  SERVER_SIDE = "server-side",
  CLIENT_CANVAS = "client-canvas",
  CLIENT_SVG = "client-svg",
  FALLBACK = "fallback",
}

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
  private preferredMethod: QRGenerationMethod = QRGenerationMethod.SERVER_SIDE;

  public static getInstance(): QRService {
    if (!QRService.instance) {
      QRService.instance = new QRService();
    }
    return QRService.instance;
  }

  /**
   * Initialize browser capabilities detection
   */
  private initializeBrowserCapabilities(): BrowserCapabilities {
    if (typeof window === "undefined") {
      return {
        supportsCanvas: false,
        supportsWebGL: false,
        isPrivacyBrowser: false,
        devicePixelRatio: 1,
        userAgent: "server",
      };
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const webglCtx =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    // Detect privacy-focused browsers
    const userAgent = navigator.userAgent.toLowerCase();
    const isPrivacyBrowser =
      userAgent.includes("librewolf") ||
      userAgent.includes("tor") ||
      userAgent.includes("brave") ||
      (userAgent.includes("firefox") && navigator.doNotTrack === "1");

    return {
      supportsCanvas: !!ctx,
      supportsWebGL: !!webglCtx,
      isPrivacyBrowser,
      devicePixelRatio: window.devicePixelRatio || 1,
      userAgent: navigator.userAgent,
    };
  }

  /**
   * Determine the best QR generation method using advanced browser detection
   */
  private determineBestMethod(): QRGenerationMethod {
    // Use advanced browser detection service
    const capabilities = browserDetectionService.detectCapabilities();

    console.log(
      "Browser capabilities:",
      browserDetectionService.getCapabilitySummary(),
    );

    // Map recommended method to our internal enum
    switch (capabilities.recommendedMethod) {
      case RecommendedMethod.SERVER_SIDE:
        return QRGenerationMethod.SERVER_SIDE;
      case RecommendedMethod.SVG_PURE:
        return QRGenerationMethod.CLIENT_SVG;
      case RecommendedMethod.CANVAS_ENHANCED:
      case RecommendedMethod.CANVAS_BASIC:
        return QRGenerationMethod.CLIENT_CANVAS;
      default:
        return QRGenerationMethod.FALLBACK;
    }
  }

  /**
   * Validates QR code input and configuration
   */
  public validateQRInput(
    text: string,
    options?: Partial<QROptions>,
  ): QRValidationResult {
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
   * Enhanced QR code generation with automatic method selection
   * Supports server-side generation for maximum browser compatibility
   */
  public async generateQRCode(
    text: string,
    options: QRGenerationConfig = {},
  ): Promise<QRGenerationResult> {
    try {
      // Validate input
      const validation = this.validateQRInput(text, options);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const config = this.buildQRConfig(options);
      const method = this.determineBestMethod();

      console.log(`Using QR generation method: ${method}`);

      let result: QRGenerationResult;

      switch (method) {
        case QRGenerationMethod.SERVER_SIDE:
          result = await this.generateServerSide(text, config);
          break;
        case QRGenerationMethod.CLIENT_SVG:
          result = await this.generateWithSVG(text, config);
          break;
        case QRGenerationMethod.CLIENT_CANVAS:
          result = await this.generateWithCanvas(text, config);
          break;
        default:
          result = await this.generateFallback(text, config);
          break;
      }

      return {
        ...result,
        method,
        browserInfo: this.browserCapabilities?.userAgent || "unknown",
      };
    } catch (error) {
      console.error("Primary QR generation failed, trying fallback:", error);

      // Try fallback method if primary fails
      try {
        const fallbackResult = await this.generateFallback(
          text,
          this.buildQRConfig(options),
        );
        return {
          ...fallbackResult,
          method: QRGenerationMethod.FALLBACK,
          browserInfo: this.browserCapabilities?.userAgent || "unknown",
          warning: "Used fallback method due to primary generation failure",
        };
      } catch (fallbackError) {
        throw new Error(
          `QR generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
  }

  /**
   * Server-side QR generation via API endpoint
   * Most reliable method for privacy browsers like LibreWolf
   */
  private async generateServerSide(
    text: string,
    config: QRGenerationConfig,
  ): Promise<QRGenerationResult> {
    try {
      const response = await fetch("/api/qr/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          size: config.size,
          margin: config.margin,
          errorCorrectionLevel: config.errorCorrectionLevel,
          format: config.format,
          color: config.color,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Server responded with ${response.status}: ${response.statusText}`,
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Server-side generation failed");
      }

      return {
        dataUrl: result.dataUrl || result.svgString,
        format: result.format,
        size: result.size,
        timestamp: result.timestamp,
      };
    } catch (error) {
      throw new Error(
        `Server-side generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Client-side SVG generation (browser-independent)
   * Uses dedicated SVG service for maximum compatibility with privacy browsers
   */
  private async generateWithSVG(
    text: string,
    config: QRGenerationConfig,
  ): Promise<QRGenerationResult> {
    try {
      // Use dedicated SVG service for better compatibility
      return await svgQRService.generateSVGQR(text, config);
    } catch (error) {
      // Fallback to basic SVG generation if dedicated service fails
      try {
        const svgString = await QRCode.toString(text, {
          type: "svg",
          width: config.size || 512,
          margin: config.margin || 4,
          errorCorrectionLevel: config.errorCorrectionLevel || "M",
          color: {
            dark: config.color?.dark || "#000000",
            light: config.color?.light || "#ffffff",
          },
        });

        // Convert SVG to data URL with proper encoding
        const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;

        return {
          dataUrl,
          format: "svg",
          size: config.size || 512,
          timestamp: Date.now(),
          method: "basic-svg-fallback",
        };
      } catch (fallbackError) {
        throw new Error(
          `SVG generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
  }

  /**
   * Fallback generation method using pure QRCode library
   */
  private async generateFallback(
    text: string,
    config: QRGenerationConfig,
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
        `Fallback generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Generates QR code using canvas with proper DPI scaling
   */
  private async generateWithCanvas(
    text: string,
    config: QRGenerationConfig,
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
