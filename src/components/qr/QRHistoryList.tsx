/**
 * QR History List Component
 * Displays virtualized list of user's QR codes with real-time search and optimized performance
 */

"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  QrCode,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { QRCard } from "./QRCard";
import { QRFilter, type QRFilterOptions } from "./QRFilter";
import { applyQRFilters, type QRHistoryItem } from "@/utils/qr-filter-utils";

export function QRHistoryList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<QRFilterOptions>({
    formats: [],
    dateRange: 'all',
  });
  const parentRef = useRef<HTMLDivElement>(null);

  // Debounce search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Use search query when search term exists, otherwise get all history
  const allQRHistory = useQuery(api.qrHistory.getUserQRHistory, { limit: 1000 }) || [];
  const searchResults = useQuery(
    api.qrHistory.searchQRHistory,
    debouncedSearchTerm.trim() ? { searchTerm: debouncedSearchTerm.trim(), limit: 500 } : "skip"
  ) || [];

  // Determine which data to use based on search state and apply filters
  const qrHistory = useMemo(() => {
    let data: QRHistoryItem[];

    if (debouncedSearchTerm.trim()) {
      data = searchResults as QRHistoryItem[];
    } else {
      data = allQRHistory as QRHistoryItem[];
    }

    // Apply filters to the data
    return applyQRFilters(data, filters);
  }, [debouncedSearchTerm, searchResults, allQRHistory, filters]);

  // Loading states
  const isLoadingAll = allQRHistory === undefined;
  const isLoadingSearch = debouncedSearchTerm.trim() && searchResults === undefined;
  const isLoading = isLoadingAll || isLoadingSearch;

  const deleteQR = useMutation(api.qrHistory.deleteQRFromHistory);

  // Setup virtualizer for performance optimization
  const rowVirtualizer = useVirtualizer({
    count: qrHistory.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, 
    overscan: 5, 
  });

  // Memoized handlers to prevent unnecessary re-renders
  const handleDelete = useCallback(async (qrId: string) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: Convex ID type conversion needed
      await deleteQR({ qrId: qrId as any });
      toast.success("QR code deleted successfully");
    } catch (error) {
      toast.error("Failed to delete QR code");
      console.error("Delete error:", error);
    }
  }, [deleteQR]);

  const handleCopyText = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Text copied to clipboard");
  }, []);

  const handleDownloadQR = useCallback((_dataUrl: string, _filename: string) => {
    toast.info("Download feature coming soon");
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleFilterChange = useCallback((newFilters: QRFilterOptions) => {
    setFilters(newFilters);
  }, []);

  // Get original data count for filter display
  const originalDataCount = useMemo(() => {
    if (debouncedSearchTerm.trim()) {
      return searchResults?.length || 0;
    }
    return allQRHistory?.length || 0;
  }, [debouncedSearchTerm, searchResults, allQRHistory]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
        {Array.from({ length: 5 }, (_, i) => i).map((index) => (
          <Card key={`skeleton-${index}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Enhanced Search Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your QR codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <QRFilter
          onFilterChange={handleFilterChange}
          totalItems={originalDataCount}
          filteredItems={qrHistory.length}
        />
      </div>

      {/* QR History List with Virtualization */}
      {qrHistory.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {debouncedSearchTerm ? "No matching QR codes found" : "No QR codes yet"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {debouncedSearchTerm
                ? "Try adjusting your search terms or create a new QR code"
                : "Start creating QR codes to see them here"
              }
            </p>
            <Button asChild>
              <a href="/">Create Your First QR Code</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          ref={parentRef}
          className="h-[600px] overflow-auto"
          style={{
            contain: 'strict',
          }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const qr = qrHistory[virtualItem.index];
              if (!qr) return null;

              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className="px-0 pb-3"
                >
                  <QRCard
                    qr={qr}
                    onCopyText={handleCopyText}
                    onDownload={handleDownloadQR}
                    onDelete={handleDelete}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
