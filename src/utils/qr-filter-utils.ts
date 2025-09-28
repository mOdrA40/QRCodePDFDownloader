/**
 * QR Filter Utilities
 * Helper functions for filtering QR history data
 */

import type { QRFilterOptions } from "@/components/features/qr/history/QRFilter";

export interface QRHistoryItem {
  _id: string;
  textContent: string;
  qrSettings: {
    format: string;
    size: number;
    errorCorrectionLevel: string;
    foreground: string;
    background: string;
    margin: number;
    logoUrl?: string;
    logoSize?: number;
    logoBackground?: boolean;
  };
  generationMethod?: string;
  browserInfo?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Applies all filters to QR history data
 */
export function applyQRFilters(
  qrHistory: QRHistoryItem[],
  filters: QRFilterOptions
): QRHistoryItem[] {
  let filteredData = [...qrHistory];

  // Apply date range filter
  filteredData = filterByDateRange(filteredData, filters.dateRange);

  // Apply format filter
  if (filters.formats.length > 0) {
    filteredData = filteredData.filter((qr) =>
      filters.formats.includes(qr.qrSettings.format.toLowerCase())
    );
  }

  return filteredData;
}

/**
 * Filters QR history by date range
 */
export function filterByDateRange(
  qrHistory: QRHistoryItem[],
  dateRange: "all" | "today" | "week" | "month" | "year"
): QRHistoryItem[] {
  if (dateRange === "all") {
    return qrHistory;
  }

  const now = new Date();
  let startDate: Date;

  switch (dateRange) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week": {
      const dayOfWeek = now.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as start of week
      startDate = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
    }
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      return qrHistory;
  }

  const startTimestamp = startDate.getTime();

  return qrHistory.filter((qr) => qr.createdAt >= startTimestamp);
}

/**
 * Gets filter statistics for display
 */
export function getFilterStats(
  originalData: QRHistoryItem[],
  filteredData: QRHistoryItem[]
): {
  total: number;
  filtered: number;
  formatBreakdown: Record<string, number>;
} {
  const formatBreakdown: Record<string, number> = {};

  filteredData.forEach((qr) => {
    // Format breakdown
    const format = qr.qrSettings.format.toLowerCase();
    formatBreakdown[format] = (formatBreakdown[format] || 0) + 1;
  });

  return {
    total: originalData.length,
    filtered: filteredData.length,
    formatBreakdown,
  };
}

/**
 * Sorts QR history data
 */
export function sortQRHistory(
  qrHistory: QRHistoryItem[],
  sortBy: "date" | "format" | "size" | "content",
  sortOrder: "asc" | "desc" = "desc"
): QRHistoryItem[] {
  const sorted = [...qrHistory].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison = a.createdAt - b.createdAt;
        break;
      case "format":
        comparison = a.qrSettings.format.localeCompare(b.qrSettings.format);
        break;
      case "size":
        comparison = a.qrSettings.size - b.qrSettings.size;
        break;
      case "content":
        comparison = a.textContent.localeCompare(b.textContent);
        break;
      default:
        comparison = a.createdAt - b.createdAt;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Searches QR history with advanced options
 */
export function searchQRHistory(
  qrHistory: QRHistoryItem[],
  searchTerm: string,
  searchFields: ("content" | "format" | "errorLevel")[] = ["content"]
): QRHistoryItem[] {
  if (!searchTerm.trim()) {
    return qrHistory;
  }

  const term = searchTerm.toLowerCase().trim();

  return qrHistory.filter((qr) => {
    return searchFields.some((field) => {
      switch (field) {
        case "content":
          return qr.textContent.toLowerCase().includes(term);
        case "format":
          return qr.qrSettings.format.toLowerCase().includes(term);
        case "errorLevel":
          return qr.qrSettings.errorCorrectionLevel.toLowerCase().includes(term);
        default:
          return false;
      }
    });
  });
}
