/**
 * Browser Detection Service
 * Lightweight browser capability detection for QR generation
 */

export enum QRGenerationMethod {
  SERVER_SIDE = "server-side",
  CLIENT_CANVAS = "client-canvas",
  FALLBACK = "fallback",
}

export interface SimpleBrowserCapabilities {
  supportsCanvas: boolean;
  isPrivacyBrowser: boolean;
  recommendedMethod: QRGenerationMethod;
  userAgent: string;
}

class SimpleBrowserDetectionService {
  private capabilities: SimpleBrowserCapabilities | null = null;

  /**
   * Detect browser capabilities with minimal overhead
   */
  detectCapabilities(): SimpleBrowserCapabilities {
    if (this.capabilities) {
      return this.capabilities;
    }

    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const supportsCanvas = this.checkCanvasSupport();
    const isPrivacyBrowser = this.detectPrivacyBrowser(userAgent);

    const recommendedMethod = this.getRecommendedMethod(supportsCanvas, isPrivacyBrowser);

    this.capabilities = {
      supportsCanvas,
      isPrivacyBrowser,
      recommendedMethod,
      userAgent,
    };

    return this.capabilities;
  }

  /**
   * Simple canvas support check
   */
  private checkCanvasSupport(): boolean {
    if (typeof document === "undefined") return false;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      return !!ctx;
    } catch {
      return false;
    }
  }

  /**
   * Detect privacy-focused browsers
   */
  private detectPrivacyBrowser(userAgent: string): boolean {
    const privacyBrowsers = ["librewolf", "tor browser", "brave", "duckduckgo"];

    const lowerUA = userAgent.toLowerCase();
    return privacyBrowsers.some((browser) => lowerUA.includes(browser));
  }

  /**
   * Get recommended QR generation method with performance optimization
   */
  private getRecommendedMethod(
    supportsCanvas: boolean,
    isPrivacyBrowser: boolean
  ): QRGenerationMethod {
    // For privacy browsers, prefer server-side but allow client-side for better performance
    if (isPrivacyBrowser) {
      // Use client-side if canvas is supported for better performance
      // Server-side only if canvas is not supported
      return supportsCanvas ? QRGenerationMethod.CLIENT_CANVAS : QRGenerationMethod.SERVER_SIDE;
    }

    // For regular browsers, prefer client-side canvas for better performance
    return supportsCanvas ? QRGenerationMethod.CLIENT_CANVAS : QRGenerationMethod.SERVER_SIDE;
  }

  /**
   * Get capability summary for debugging
   */
  getCapabilitySummary(): string {
    const caps = this.detectCapabilities();
    return `Canvas: ${caps.supportsCanvas}, Privacy: ${caps.isPrivacyBrowser}, Method: ${caps.recommendedMethod}`;
  }

  /**
   * Reset cached capabilities (useful for testing)
   */
  reset(): void {
    this.capabilities = null;
  }
}

// Export singleton instance
export const simpleBrowserDetectionService = new SimpleBrowserDetectionService();

// Backward compatibility exports
export const browserDetectionService = simpleBrowserDetectionService;
export const BrowserDetectionService = SimpleBrowserDetectionService;

// Re-export for compatibility
export const RecommendedMethod = QRGenerationMethod;
