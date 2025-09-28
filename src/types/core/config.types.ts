/**
 * Core Configuration Types
 * Application configuration and settings types
 */

// Main application configuration
export interface AppConfig {
  maxFileSize: number;
  supportedFormats: string[];
  defaultQRSize: number;
  defaultErrorCorrection: "L" | "M" | "Q" | "H";
  enableAnalytics: boolean;
  enableLocalStorage: boolean;
  previewMode?: boolean;
  autoGenerate?: boolean;
}

// Environment configuration
export interface EnvironmentConfig {
  nodeEnv: "development" | "production" | "test";
  apiUrl: string;
  convexUrl: string;
  auth0Domain: string;
  auth0ClientId: string;
  enableDebug: boolean;
  enableLogging: boolean;
}

// Feature flags configuration
export interface FeatureFlags {
  enableQRHistory: boolean;
  enableAdvancedExport: boolean;
  enableSocialSharing: boolean;
  enableAnalytics: boolean;
  enableOfflineMode: boolean;
  enableBetaFeatures: boolean;
}

// Performance configuration
export interface PerformanceConfig {
  enableLazyLoading: boolean;
  enableCodeSplitting: boolean;
  enableServiceWorker: boolean;
  cacheStrategy: "aggressive" | "conservative" | "disabled";
  maxConcurrentRequests: number;
}

// Security configuration
export interface SecurityConfig {
  enableCSP: boolean;
  enableCORS: boolean;
  maxRequestSize: number;
  rateLimitRequests: number;
  rateLimitWindow: number; // in seconds
  enableInputSanitization: boolean;
}
