/**
 * Usage Statistics Hook
 * Manages usage tracking and analytics
 */

import { useState, useEffect, useCallback } from "react";
import { storageService } from "@/services";
import type {
  UsageStats,
  UsageEvent,
  UsageAnalytics,
  QRImageFormat,
  QRErrorCorrectionLevel,
} from "@/types";

interface UseUsageStatsReturn {
  stats: UsageStats;
  analytics: UsageAnalytics;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  recordQRGeneration: (metadata: {
    format: QRImageFormat;
    size: number;
    errorCorrectionLevel: QRErrorCorrectionLevel;
    hasLogo?: boolean;
    textLength: number;
  }) => void;
  recordDownload: (type: "pdf" | "image", format?: string) => void;
  recordPresetAction: (action: "saved" | "loaded") => void;
  clearStats: () => void;
  refreshStats: () => void;
}

export function useUsageStats(): UseUsageStatsReturn {
  const [stats, setStats] = useState<UsageStats>(storageService.getUsageStats());
  const [analytics, setAnalytics] = useState<UsageAnalytics>({
    totalEvents: 0,
    uniqueDays: 0,
    averagePerDay: 0,
    mostUsedFormat: "png",
    mostUsedSize: 512,
    peakUsageDay: "",
    trends: {
      daily: [],
      weekly: [],
      monthly: [],
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculates analytics from usage events
   */
  const calculateAnalytics = useCallback((): UsageAnalytics => {
    const events = storageService.getUsageEvents();
    
    if (events.length === 0) {
      return {
        totalEvents: 0,
        uniqueDays: 0,
        averagePerDay: 0,
        mostUsedFormat: "png",
        mostUsedSize: 512,
        peakUsageDay: "",
        trends: { daily: [], weekly: [], monthly: [] },
      };
    }

    // Calculate basic metrics
    const totalEvents = events.length;
    const uniqueDays = new Set(
      events.map(e => new Date(e.timestamp).toDateString())
    ).size;
    const averagePerDay = uniqueDays > 0 ? totalEvents / uniqueDays : 0;

    // Find most used format
    const formatCounts = events.reduce((acc, event) => {
      const format = event.metadata.format || "png";
      acc[format] = (acc[format] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedFormat = Object.entries(formatCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "png";

    // Find most used size
    const sizeCounts = events.reduce((acc, event) => {
      const size = event.metadata.size || 512;
      acc[size] = (acc[size] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const mostUsedSize = Number(Object.entries(sizeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0]) || 512;

    // Find peak usage day
    const dailyCounts = events.reduce((acc, event) => {
      const day = new Date(event.timestamp).toDateString();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const peakUsageDay = Object.entries(dailyCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "";

    // Calculate trends (simplified)
    const now = new Date();
    const daily = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayString = date.toDateString();
      return dailyCounts[dayString] || 0;
    }).reverse();

    return {
      totalEvents,
      uniqueDays,
      averagePerDay,
      mostUsedFormat,
      mostUsedSize,
      peakUsageDay,
      trends: {
        daily,
        weekly: [], // Could be implemented later
        monthly: [], // Could be implemented later
      },
    };
  }, []);

  /**
   * Records QR code generation event
   */
  const recordQRGeneration = useCallback((metadata: {
    format: QRImageFormat;
    size: number;
    errorCorrectionLevel: QRErrorCorrectionLevel;
    hasLogo?: boolean;
    textLength: number;
  }) => {
    try {
      setError(null);
      
      // Record event
      storageService.recordUsageEvent({
        type: "qr_generated",
        metadata,
      });

      // Update stats
      const currentStats = storageService.getUsageStats();
      const today = new Date().toDateString();
      
      const updatedStats: UsageStats = {
        ...currentStats,
        totalGenerated: currentStats.totalGenerated + 1,
        todayGenerated: currentStats.lastUsed.includes(today) 
          ? currentStats.todayGenerated + 1 
          : 1,
        favoriteFormat: metadata.format,
        averageSize: Math.round((currentStats.averageSize + metadata.size) / 2),
        lastUsed: new Date().toLocaleString(),
        formatUsage: {
          ...currentStats.formatUsage,
          [metadata.format]: (currentStats.formatUsage[metadata.format] || 0) + 1,
        },
        sizeDistribution: {
          ...currentStats.sizeDistribution,
          [metadata.size]: (currentStats.sizeDistribution[metadata.size] || 0) + 1,
        },
        dailyUsage: {
          ...currentStats.dailyUsage,
          [today]: (currentStats.dailyUsage[today] || 0) + 1,
        },
      };

      storageService.updateUsageStats(updatedStats);
      setStats(updatedStats);
      setAnalytics(calculateAnalytics());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record QR generation");
    }
  }, [calculateAnalytics]);

  /**
   * Records download event
   */
  const recordDownload = useCallback((type: "pdf" | "image", format?: string) => {
    try {
      setError(null);
      
      storageService.recordUsageEvent({
        type: type === "pdf" ? "pdf_downloaded" : "image_downloaded",
        metadata: { format },
      });

      setAnalytics(calculateAnalytics());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record download");
    }
  }, [calculateAnalytics]);

  /**
   * Records preset action
   */
  const recordPresetAction = useCallback((action: "saved" | "loaded") => {
    try {
      setError(null);
      
      storageService.recordUsageEvent({
        type: action === "saved" ? "preset_saved" : "preset_loaded",
        metadata: {},
      });

      setAnalytics(calculateAnalytics());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record preset action");
    }
  }, [calculateAnalytics]);

  /**
   * Clears all usage statistics
   */
  const clearStats = useCallback(() => {
    try {
      setError(null);
      setIsLoading(true);
      
      const defaultStats: UsageStats = {
        totalGenerated: 0,
        todayGenerated: 0,
        favoriteFormat: "png",
        averageSize: 512,
        lastUsed: "Never",
        formatUsage: {},
        sizeDistribution: {},
        dailyUsage: {},
      };

      storageService.updateUsageStats(defaultStats);
      setStats(defaultStats);
      setAnalytics(calculateAnalytics());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear stats");
    } finally {
      setIsLoading(false);
    }
  }, [calculateAnalytics]);

  /**
   * Refreshes stats from storage
   */
  const refreshStats = useCallback(() => {
    try {
      setError(null);
      setIsLoading(true);
      
      const currentStats = storageService.getUsageStats();
      setStats(currentStats);
      setAnalytics(calculateAnalytics());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh stats");
    } finally {
      setIsLoading(false);
    }
  }, [calculateAnalytics]);

  // Initialize analytics on mount
  useEffect(() => {
    setAnalytics(calculateAnalytics());
  }, [calculateAnalytics]);

  // Clean up old events periodically
  useEffect(() => {
    const cleanup = () => {
      storageService.clearOldEvents(30); // Keep 30 days
    };

    // Run cleanup on mount and then daily
    cleanup();
    const interval = setInterval(cleanup, 24 * 60 * 60 * 1000); // 24 hours

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    analytics,
    isLoading,
    error,
    recordQRGeneration,
    recordDownload,
    recordPresetAction,
    clearStats,
    refreshStats,
  };
}
