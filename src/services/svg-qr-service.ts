/**
 * Pure SVG QR Code Generation Service
 * Browser-independent QR generation using pure SVG without Canvas API
 * Perfect for LibreWolf and other privacy-focused browsers
 */

import type { QRGenerationConfig, QRGenerationResult } from "@/types";

// QR Code matrix generation interface
interface QRMatrix {
  modules: boolean[][];
  size: number;
}

// SVG generation options
interface SVGQROptions {
  size: number;
  margin: number;
  darkColor: string;
  lightColor: string;
  moduleSize: number;
}

export class SVGQRService {
  private static instance: SVGQRService;

  public static getInstance(): SVGQRService {
    if (!SVGQRService.instance) {
      SVGQRService.instance = new SVGQRService();
    }
    return SVGQRService.instance;
  }

  /**
   * Generate QR code as pure SVG string
   * This method is completely browser-independent and works in all environments
   */
  public async generateSVGQR(
    text: string,
    config: QRGenerationConfig = {},
  ): Promise<QRGenerationResult> {
    try {
      // Use dynamic import to load QR code library only when needed
      const QRCode = await import("qrcode");

      const options = this.buildSVGOptions(config);

      // Generate SVG string using qrcode library
      const svgString = await QRCode.toString(text, {
        type: "svg",
        width: options.size,
        margin: options.margin,
        errorCorrectionLevel: config.errorCorrectionLevel || "M",
        color: {
          dark: options.darkColor,
          light: options.lightColor,
        },
      });

      // Enhance SVG with better styling and accessibility
      const enhancedSVG = this.enhanceSVG(svgString, options);

      // Convert to data URL
      const dataUrl = this.svgToDataURL(enhancedSVG);

      return {
        dataUrl,
        format: "svg",
        size: options.size,
        timestamp: Date.now(),
        method: "pure-svg",
      };
    } catch (error) {
      throw new Error(
        `SVG QR generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Generate QR code matrix for custom rendering
   * Useful for creating custom SVG or other formats
   */
  public async generateQRMatrix(
    text: string,
    errorCorrectionLevel: "L" | "M" | "Q" | "H" = "M",
  ): Promise<QRMatrix> {
    try {
      // Use qrcode-generator for matrix generation
      const qrGenerator = await import("qrcode-generator");

      // Determine type number based on text length
      const typeNumber = this.getOptimalTypeNumber(text.length);

      const qr = qrGenerator.default(
        typeNumber as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        errorCorrectionLevel,
      );
      qr.addData(text);
      qr.make();

      const moduleCount = qr.getModuleCount();
      const modules: boolean[][] = [];

      for (let row = 0; row < moduleCount; row++) {
        modules[row] = [];
        for (let col = 0; col < moduleCount; col++) {
          modules[row][col] = qr.isDark(row, col);
        }
      }

      return {
        modules,
        size: moduleCount,
      };
    } catch (error) {
      throw new Error(
        `QR matrix generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Create custom SVG from QR matrix
   * Provides full control over SVG generation
   */
  public createCustomSVG(matrix: QRMatrix, options: SVGQROptions): string {
    const { size, margin, darkColor, lightColor, moduleSize } = options;
    const totalSize = size;
    const actualMargin = (margin / 100) * totalSize;
    const qrSize = totalSize - actualMargin * 2;
    const cellSize = qrSize / matrix.size;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">`;

    // Background
    svgContent += `<rect width="${totalSize}" height="${totalSize}" fill="${lightColor}"/>`;

    // QR modules
    for (let row = 0; row < matrix.size; row++) {
      for (let col = 0; col < matrix.size; col++) {
        if (matrix.modules[row][col]) {
          const x = actualMargin + col * cellSize;
          const y = actualMargin + row * cellSize;
          svgContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${darkColor}"/>`;
        }
      }
    }

    svgContent += "</svg>";
    return svgContent;
  }

  /**
   * Convert SVG to data URL
   */
  private svgToDataURL(svgString: string): string {
    // Clean and encode SVG
    const cleanSVG = svgString.replace(/\n/g, "").replace(/\s+/g, " ").trim();

    // Use base64 encoding for better compatibility
    const base64 = btoa(unescape(encodeURIComponent(cleanSVG)));
    return `data:image/svg+xml;base64,${base64}`;
  }

  /**
   * Enhance SVG with better styling and accessibility
   */
  private enhanceSVG(svgString: string, options: SVGQROptions): string {
    // Add accessibility attributes and better styling
    return svgString
      .replace("<svg", `<svg role="img" aria-label="QR Code"`)
      .replace(/style="[^"]*"/, "") // Remove inline styles
      .replace("</svg>", "<title>QR Code</title></svg>");
  }

  /**
   * Build SVG options from QR generation config
   */
  private buildSVGOptions(config: QRGenerationConfig): SVGQROptions {
    return {
      size: config.size || 512,
      margin: config.margin || 4,
      darkColor: config.color?.dark || "#000000",
      lightColor: config.color?.light || "#ffffff",
      moduleSize: 1,
    };
  }

  /**
   * Determine optimal QR type number based on text length
   */
  private getOptimalTypeNumber(textLength: number): number {
    if (textLength <= 25) return 1;
    if (textLength <= 47) return 2;
    if (textLength <= 77) return 3;
    if (textLength <= 114) return 4;
    if (textLength <= 154) return 5;
    if (textLength <= 195) return 6;
    if (textLength <= 224) return 7;
    if (textLength <= 279) return 8;
    if (textLength <= 335) return 9;
    return 10; // Maximum for most use cases
  }

  /**
   * Validate SVG generation capabilities
   */
  public static isSupported(): boolean {
    // SVG is supported in all modern browsers and Node.js environments
    return true;
  }

  /**
   * Get SVG generation info
   */
  public getGenerationInfo(): object {
    return {
      method: "pure-svg",
      browserIndependent: true,
      canvasRequired: false,
      supportedFormats: ["svg"],
      compatibility: "universal",
    };
  }
}

// Export singleton instance
export const svgQRService = SVGQRService.getInstance();
