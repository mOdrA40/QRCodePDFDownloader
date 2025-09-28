/**
 * QR History List Component
 * Displays virtualized list of user's QR codes with real-time search and optimized performance
 */

"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useMutation, useQuery } from "convex/react";
import { QrCode, Search, X } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useDebounce } from "@/hooks/useDebounce";
import { applyQRFilters, type QRHistoryItem } from "@/utils/qr-filter-utils";
import { QRCard } from "./QRCard";
import { QRFilter, type QRFilterOptions } from "./QRFilter";

// Type for delete response
interface DeleteQRResponse {
  success: boolean;
  message: string;
  alreadyDeleted: boolean;
}

export function QRHistoryList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<QRFilterOptions>({
    formats: [],
    dateRange: "all",
  });
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const parentRef = useRef<HTMLDivElement>(null);

  // Debounce search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Use search query when search term exists, otherwise get all history
  const allQRHistory = useQuery(api.qrHistory.getUserQRHistory, { limit: 1000 }) || [];
  const searchResults =
    useQuery(
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

    // Apply filters and remove items being deleted (optimistic update)
    const filteredData = applyQRFilters(data, filters);
    return filteredData.filter((qr) => !deletingIds.has(qr._id));
  }, [debouncedSearchTerm, searchResults, allQRHistory, filters, deletingIds]);

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
  const handleDelete = useCallback(
    async (qrId: string) => {
      // Prevent multiple delete operations on same item
      if (deletingIds.has(qrId)) {
        return;
      }

      try {
        // Optimistic update - immediately hide from UI
        setDeletingIds((prev) => new Set(prev).add(qrId));

        // Show loading toast
        const loadingToast = toast.loading("Deleting QR code...");

        // Proper type conversion for Convex ID
        const result = (await deleteQR({
          qrId: qrId as Id<"qrHistory">,
        })) as DeleteQRResponse | null;

        // Dismiss loading toast
        toast.dismiss(loadingToast);

        // Defensive programming - handle null/undefined result
        if (!result) {
          console.warn("Delete operation returned null result");
          toast.success("QR code deleted successfully");
          return;
        }

        // Handle different response types
        if (result.alreadyDeleted) {
          toast.success("QR code was already deleted");
        } else {
          toast.success(result.message || "QR code deleted successfully");
        }
      } catch (error) {
        // Revert optimistic update on error
        setDeletingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(qrId);
          return newSet;
        });

        // Dismiss loading toast
        toast.dismiss();

        // Show specific error message
        const errorMessage = error instanceof Error ? error.message : "Failed to delete QR code";

        toast.error(errorMessage);
        console.error("Delete error:", error);
      } finally {
        // Clean up deleting state after a delay to allow for UI updates
        setTimeout(() => {
          setDeletingIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(qrId);
            return newSet;
          });
        }, 1000);
      }
    },
    [deleteQR, deletingIds]
  );

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
                : "Start creating QR codes to see them here"}
            </p>
            <Button asChild={true}>
              <a href="/">Create Your First QR Code</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          ref={parentRef}
          className="h-[600px] overflow-auto"
          style={{
            contain: "strict",
          }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const qr = qrHistory[virtualItem.index];
              if (!qr) return null;

              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
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
                    isDeleting={deletingIds.has(qr._id)}
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
