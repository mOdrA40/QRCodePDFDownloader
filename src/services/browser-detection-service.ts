/**
 * Browser Detection and Capability Service
 * Detects browser capabilities and recommends optimal QR generation methods
 * Specifically handles LibreWolf and other privacy-focused browsers
 */

// Browser types and their characteristics
export enum BrowserType {
  LIBREWOLF = "librewolf",
  FIREFOX = "firefox",
  CHROME = "chrome",
  SAFARI = "safari",
  EDGE = "edge",
  BRAVE = "brave",
  TOR = "tor",
  UNKNOWN = "unknown",
}

// Privacy level indicators
export enum PrivacyLevel {
  HIGH = "high", // LibreWolf, Tor Browser
  MEDIUM = "medium", // Brave, Firefox with strict settings
  LOW = "low", // Standard browsers
  UNKNOWN = "unknown",
}

// QR generation method recommendations
export enum RecommendedMethod {
  SERVER_SIDE = "server-side",
  SVG_PURE = "svg-pure",
  CANVAS_ENHANCED = "canvas-enhanced",
  CANVAS_BASIC = "canvas-basic",
  FALLBACK = "fallback",
}

// Browser capability interface
export interface BrowserCapabilities {
  type: BrowserType;
  version: string;
  privacyLevel: PrivacyLevel;
  supportsCanvas: boolean;
  supportsWebGL: boolean;
  supportsOffscreenCanvas: boolean;
  devicePixelRatio: number;
  isPrivacyBrowser: boolean;
  hasStrictCSP: boolean;
  recommendedMethod: RecommendedMethod;
  features: {
    canvasFingerprinting: boolean;
    webglFingerprinting: boolean;
    cookiesEnabled: boolean;
    localStorageEnabled: boolean;
  };
}

export class BrowserDetectionService {
  private static instance: BrowserDetectionService;
  private capabilities: BrowserCapabilities | null = null;

  public static getInstance(): BrowserDetectionService {
    if (!BrowserDetectionService.instance) {
      BrowserDetectionService.instance = new BrowserDetectionService();
    }
    return BrowserDetectionService.instance;
  }

  /**
   * Detect browser capabilities and return comprehensive information
   */
  public detectCapabilities(): BrowserCapabilities {
    if (this.capabilities) {
      return this.capabilities;
    }

    // Server-side detection
    if (typeof window === "undefined") {
      this.capabilities = this.getServerSideCapabilities();
      return this.capabilities;
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const browserType = this.detectBrowserType(userAgent);
    const version = this.extractVersion(userAgent, browserType);
    const privacyLevel = this.detectPrivacyLevel(browserType, userAgent);

    // Test canvas capabilities
    const canvasSupport = this.testCanvasSupport();
    const webglSupport = this.testWebGLSupport();
    const offscreenCanvasSupport = this.testOffscreenCanvasSupport();

    // Test privacy features
    const features = this.testPrivacyFeatures();

    // Determine if this is a privacy-focused browser
    const isPrivacyBrowser =
      privacyLevel === PrivacyLevel.HIGH ||
      privacyLevel === PrivacyLevel.MEDIUM ||
      browserType === BrowserType.LIBREWOLF ||
      browserType === BrowserType.TOR ||
      browserType === BrowserType.BRAVE;

    // Check for strict CSP
    const hasStrictCSP = this.detectStrictCSP();

    // Recommend optimal method
    const recommendedMethod = this.recommendOptimalMethod({
      type: browserType,
      privacyLevel,
      supportsCanvas: canvasSupport,
      isPrivacyBrowser,
      hasStrictCSP,
    });

    this.capabilities = {
      type: browserType,
      version,
      privacyLevel,
      supportsCanvas: canvasSupport,
      supportsWebGL: webglSupport,
      supportsOffscreenCanvas: offscreenCanvasSupport,
      devicePixelRatio: window.devicePixelRatio || 1,
      isPrivacyBrowser,
      hasStrictCSP,
      recommendedMethod,
      features,
    };

    return this.capabilities;
  }

  /**
   * Detect browser type from user agent
   */
  private detectBrowserType(userAgent: string): BrowserType {
    if (userAgent.includes("librewolf")) return BrowserType.LIBREWOLF;
    if (userAgent.includes("tor")) return BrowserType.TOR;
    if (userAgent.includes("brave")) return BrowserType.BRAVE;
    if (userAgent.includes("edg/")) return BrowserType.EDGE;
    if (userAgent.includes("chrome") && !userAgent.includes("edg/"))
      return BrowserType.CHROME;
    if (userAgent.includes("firefox")) return BrowserType.FIREFOX;
    if (userAgent.includes("safari") && !userAgent.includes("chrome"))
      return BrowserType.SAFARI;

    return BrowserType.UNKNOWN;
  }

  /**
   * Extract browser version
   */
  private extractVersion(userAgent: string, browserType: BrowserType): string {
    let versionRegex: RegExp;

    switch (browserType) {
      case BrowserType.LIBREWOLF:
        versionRegex = /librewolf\/([0-9.]+)/;
        break;
      case BrowserType.FIREFOX:
        versionRegex = /firefox\/([0-9.]+)/;
        break;
      case BrowserType.CHROME:
        versionRegex = /chrome\/([0-9.]+)/;
        break;
      case BrowserType.SAFARI:
        versionRegex = /version\/([0-9.]+)/;
        break;
      case BrowserType.EDGE:
        versionRegex = /edg\/([0-9.]+)/;
        break;
      default:
        return "unknown";
    }

    const match = userAgent.match(versionRegex);
    return match ? (match[1] ?? "unknown") : "unknown";
  }

  /**
   * Detect privacy level based on browser and settings
   */
  private detectPrivacyLevel(
    browserType: BrowserType,
    _userAgent: string,
  ): PrivacyLevel {
    switch (browserType) {
      case BrowserType.LIBREWOLF:
      case BrowserType.TOR:
        return PrivacyLevel.HIGH;
      case BrowserType.BRAVE:
        return PrivacyLevel.MEDIUM;
      case BrowserType.FIREFOX:
        // Check for strict privacy settings
        return navigator.doNotTrack === "1"
          ? PrivacyLevel.MEDIUM
          : PrivacyLevel.LOW;
      default:
        return PrivacyLevel.LOW;
    }
  }

  /**
   * Test canvas support and reliability
   */
  private testCanvasSupport(): boolean {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return false;

      // Test basic canvas operations
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 1, 1);

      // Test if canvas data can be extracted (privacy browsers may block this)
      try {
        canvas.toDataURL();
        return true;
      } catch (e) {
        // Canvas fingerprinting protection detected
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  /**
   * Test WebGL support
   */
  private testWebGLSupport(): boolean {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  /**
   * Test OffscreenCanvas support
   */
  private testOffscreenCanvasSupport(): boolean {
    return typeof OffscreenCanvas !== "undefined";
  }

  /**
   * Test privacy-related features
   */
  private testPrivacyFeatures(): BrowserCapabilities["features"] {
    return {
      canvasFingerprinting: this.testCanvasFingerprinting(),
      webglFingerprinting: this.testWebGLFingerprinting(),
      cookiesEnabled: navigator.cookieEnabled,
      localStorageEnabled: this.testLocalStorage(),
    };
  }

  /**
   * Test if canvas fingerprinting is blocked
   */
  private testCanvasFingerprinting(): boolean {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;

      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("Privacy test", 2, 2);

      return canvas.toDataURL().length > 100;
    } catch (e) {
      return false;
    }
  }

  /**
   * Test if WebGL fingerprinting is blocked
   */
  private testWebGLFingerprinting(): boolean {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl");
      if (!gl) return false;

      const renderer = gl.getParameter(gl.RENDERER);
      return renderer !== "WebKit WebGL" && renderer !== "";
    } catch (e) {
      return false;
    }
  }

  /**
   * Test localStorage availability
   */
  private testLocalStorage(): boolean {
    try {
      const test = "test";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Detect strict Content Security Policy
   */
  private detectStrictCSP(): boolean {
    // This is a simplified check - in reality, CSP detection is more complex
    try {
      // Try to create a data URL and see if it's blocked
      const img = new Image();
      img.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      return false;
    } catch (e) {
      return true;
    }
  }

  /**
   * Recommend optimal QR generation method
   */
  private recommendOptimalMethod(params: {
    type: BrowserType;
    privacyLevel: PrivacyLevel;
    supportsCanvas: boolean;
    isPrivacyBrowser: boolean;
    hasStrictCSP: boolean;
  }): RecommendedMethod {
    const {
      type,
      privacyLevel,
      supportsCanvas,
      isPrivacyBrowser,
      hasStrictCSP,
    } = params;

    // For LibreWolf and high-privacy browsers, always prefer server-side or SVG
    if (type === BrowserType.LIBREWOLF || privacyLevel === PrivacyLevel.HIGH) {
      return RecommendedMethod.SERVER_SIDE;
    }

    // If canvas is blocked or unreliable, use SVG
    if (!supportsCanvas || isPrivacyBrowser) {
      return RecommendedMethod.SVG_PURE;
    }

    // For strict CSP environments, prefer server-side
    if (hasStrictCSP) {
      return RecommendedMethod.SERVER_SIDE;
    }

    // For modern browsers with good canvas support
    if (supportsCanvas && !isPrivacyBrowser) {
      return RecommendedMethod.CANVAS_ENHANCED;
    }

    // Default fallback
    return RecommendedMethod.FALLBACK;
  }

  /**
   * Get server-side capabilities (when running on server)
   */
  private getServerSideCapabilities(): BrowserCapabilities {
    return {
      type: BrowserType.UNKNOWN,
      version: "server",
      privacyLevel: PrivacyLevel.UNKNOWN,
      supportsCanvas: false,
      supportsWebGL: false,
      supportsOffscreenCanvas: false,
      devicePixelRatio: 1,
      isPrivacyBrowser: false,
      hasStrictCSP: false,
      recommendedMethod: RecommendedMethod.SERVER_SIDE,
      features: {
        canvasFingerprinting: false,
        webglFingerprinting: false,
        cookiesEnabled: false,
        localStorageEnabled: false,
      },
    };
  }

  /**
   * Get human-readable capability summary
   */
  public getCapabilitySummary(): string {
    const caps = this.detectCapabilities();

    return `Browser: ${caps.type} ${caps.version} | Privacy: ${caps.privacyLevel} | Canvas: ${caps.supportsCanvas ? "Yes" : "No"} | Recommended: ${caps.recommendedMethod}`;
  }

  /**
   * Check if current browser is LibreWolf specifically
   */
  public isLibreWolf(): boolean {
    const caps = this.detectCapabilities();
    return caps.type === BrowserType.LIBREWOLF;
  }

  /**
   * Get optimization recommendations for current browser
   */
  public getOptimizationRecommendations(): string[] {
    const caps = this.detectCapabilities();
    const recommendations: string[] = [];

    if (caps.type === BrowserType.LIBREWOLF) {
      recommendations.push("Use SVG format for best compatibility");
      recommendations.push("Server-side generation recommended");
      recommendations.push("Avoid canvas-based operations");
    }

    if (caps.isPrivacyBrowser) {
      recommendations.push(
        "Privacy browser detected - using enhanced compatibility mode",
      );
    }

    if (!caps.supportsCanvas) {
      recommendations.push("Canvas not available - using SVG fallback");
    }

    return recommendations;
  }
}

// Export singleton instance
export const browserDetectionService = BrowserDetectionService.getInstance();
