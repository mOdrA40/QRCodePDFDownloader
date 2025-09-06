/**
 * Usage statistics and analytics type definitions
 */

// Usage statistics interface
export interface UsageStats {
  totalGenerated: number;
  todayGenerated: number;
  favoriteFormat: string;
  averageSize: number;
  lastUsed: string;
  formatUsage: Record<string, number>;
  sizeDistribution: Record<string, number>;
  dailyUsage: Record<string, number>;
}

// Usage event for tracking
export interface UsageEvent {
  type:
    | "qr_generated"
    | "pdf_downloaded"
    | "image_downloaded"
    | "preset_saved"
    | "preset_loaded";
  timestamp: Date;
  metadata: {
    format?: string;
    size?: number;
    errorCorrectionLevel?: string;
    hasLogo?: boolean;
    textLength?: number;
  };
}

// Usage analytics summary
export interface UsageAnalytics {
  totalEvents: number;
  uniqueDays: number;
  averagePerDay: number;
  mostUsedFormat: string;
  mostUsedSize: number;
  peakUsageDay: string;
  trends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
}

// Usage preferences derived from statistics
export interface UsagePreferences {
  preferredFormat: string;
  preferredSize: number;
  preferredErrorCorrection: string;
  preferredColors: {
    foreground: string;
    background: string;
  };
  frequentTexts: string[];
}
