/**
 * Local Storage Service
 * Manages localStorage operations with error handling and data validation
 */

import type {
  QRPreset,
  UsageStats,
  UsageEvent,
  AppConfig,
} from "@/types";

export class StorageService {
  private static instance: StorageService;
  private readonly prefix = "qr-app-";

  // Storage keys
  private readonly keys = {
    presets: `${this.prefix}presets`,
    usageStats: `${this.prefix}usage-stats`,
    usageEvents: `${this.prefix}usage-events`,
    settings: `${this.prefix}settings`,
    theme: `${this.prefix}theme`,
  } as const;

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Checks if localStorage is available (SSR-safe)
   */
  private isStorageAvailable(): boolean {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return false;
    }

    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Safely gets item from localStorage with error handling
   */
  private getItem<T>(key: string, defaultValue: T): T {
    if (!this.isStorageAvailable()) {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Failed to parse localStorage item "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Safely sets item in localStorage with error handling
   */
  private setItem<T>(key: string, value: T): boolean {
    if (!this.isStorageAvailable()) {
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to save to localStorage "${key}":`, error);
      return false;
    }
  }

  /**
   * Removes item from localStorage
   */
  private removeItem(key: string): boolean {
    if (!this.isStorageAvailable()) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove from localStorage "${key}":`, error);
      return false;
    }
  }

  // === QR Presets Management ===

  /**
   * Gets all saved QR presets
   */
  public getPresets(): QRPreset[] {
    return this.getItem(this.keys.presets, []);
  }

  /**
   * Saves a new QR preset
   */
  public savePreset(preset: Omit<QRPreset, "id" | "createdAt" | "updatedAt">): boolean {
    const presets = this.getPresets();
    const newPreset: QRPreset = {
      ...preset,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    presets.push(newPreset);
    return this.setItem(this.keys.presets, presets);
  }

  /**
   * Updates an existing preset
   */
  public updatePreset(id: string, updates: Partial<Omit<QRPreset, "id" | "createdAt">>): boolean {
    const presets = this.getPresets();
    const index = presets.findIndex(p => p.id === id);
    
    if (index === -1) {
      return false;
    }

    presets[index] = {
      ...presets[index],
      ...updates,
      updatedAt: new Date(),
    };

    return this.setItem(this.keys.presets, presets);
  }

  /**
   * Deletes a preset by ID
   */
  public deletePreset(id: string): boolean {
    const presets = this.getPresets();
    const filtered = presets.filter(p => p.id !== id);
    return this.setItem(this.keys.presets, filtered);
  }

  // === Usage Statistics Management ===

  /**
   * Gets usage statistics
   */
  public getUsageStats(): UsageStats {
    return this.getItem(this.keys.usageStats, {
      totalGenerated: 0,
      todayGenerated: 0,
      favoriteFormat: "png",
      averageSize: 512,
      lastUsed: "Never",
      formatUsage: {},
      sizeDistribution: {},
      dailyUsage: {},
    });
  }

  /**
   * Updates usage statistics
   */
  public updateUsageStats(stats: Partial<UsageStats>): boolean {
    const currentStats = this.getUsageStats();
    const updatedStats = { ...currentStats, ...stats };
    return this.setItem(this.keys.usageStats, updatedStats);
  }

  /**
   * Records a usage event
   */
  public recordUsageEvent(event: Omit<UsageEvent, "timestamp">): boolean {
    const events = this.getUsageEvents();
    const newEvent: UsageEvent = {
      ...event,
      timestamp: new Date(),
    };

    events.push(newEvent);

    // Keep only last 1000 events to prevent storage bloat
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }

    return this.setItem(this.keys.usageEvents, events);
  }

  /**
   * Gets usage events
   */
  public getUsageEvents(): UsageEvent[] {
    return this.getItem(this.keys.usageEvents, []);
  }

  /**
   * Clears old usage events (older than specified days)
   */
  public clearOldEvents(daysToKeep = 30): boolean {
    const events = this.getUsageEvents();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const filteredEvents = events.filter(
      event => new Date(event.timestamp) > cutoffDate
    );

    return this.setItem(this.keys.usageEvents, filteredEvents);
  }

  // === Settings Management ===

  /**
   * Gets app settings
   */
  public getSettings(): Partial<AppConfig> {
    return this.getItem(this.keys.settings, {});
  }

  /**
   * Updates app settings
   */
  public updateSettings(settings: Partial<AppConfig>): boolean {
    const currentSettings = this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    return this.setItem(this.keys.settings, updatedSettings);
  }

  /**
   * Gets theme preference
   */
  public getTheme(): string {
    return this.getItem(this.keys.theme, "system");
  }

  /**
   * Sets theme preference
   */
  public setTheme(theme: string): boolean {
    return this.setItem(this.keys.theme, theme);
  }

  // === Utility Methods ===

  /**
   * Clears all app data from localStorage
   */
  public clearAllData(): boolean {
    try {
      for (const key of Object.values(this.keys)) {
        this.removeItem(key);
      }
      return true;
    } catch (error) {
      console.error("Failed to clear all data:", error);
      return false;
    }
  }

  /**
   * Gets storage usage information
   */
  public getStorageInfo(): { used: number; available: number; percentage: number } {
    if (!this.isStorageAvailable()) {
      return { used: 0, available: 0, percentage: 0 };
    }

    try {
      let used = 0;
      for (const key in localStorage) {
        if (Object.hasOwn(localStorage, key) && key.startsWith(this.prefix)) {
          used += localStorage[key].length;
        }
      }

      // Estimate available space (most browsers have ~5-10MB limit)
      const estimated = 5 * 1024 * 1024; // 5MB
      const available = Math.max(0, estimated - used);
      const percentage = (used / estimated) * 100;

      return { used, available, percentage };
    } catch {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Generates a unique ID for presets
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();
