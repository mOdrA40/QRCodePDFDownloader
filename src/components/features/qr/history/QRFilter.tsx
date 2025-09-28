/**
 * QR Filter Component
 * Advanced filtering options for QR history list
 */

"use client";

import { Calendar, Filter, Image, Settings, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface QRFilterOptions {
  formats: string[];
  dateRange: "all" | "today" | "week" | "month" | "year";
}

interface QRFilterProps {
  onFilterChange: (filters: QRFilterOptions) => void;
  totalItems: number;
  filteredItems: number;
}

const DEFAULT_FILTERS: QRFilterOptions = {
  formats: [],
  dateRange: "all",
};

// Available filter options based on QR data structure
const AVAILABLE_FORMATS = ["png", "jpeg", "webp", "svg"];

export function QRFilter({ onFilterChange, totalItems, filteredItems }: QRFilterProps) {
  const [filters, setFilters] = useState<QRFilterOptions>(DEFAULT_FILTERS);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [availableHeight, setAvailableHeight] = useState<number>(400);

  const updateFilters = useCallback(
    (newFilters: Partial<QRFilterOptions>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      onFilterChange(updatedFilters);
    },
    [filters, onFilterChange]
  );

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
  }, [onFilterChange]);

  // Calculate available height for dropdown when it opens
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const minHeight = 200;
      const maxHeight = Math.max(minHeight, spaceBelow - 20);

      setAvailableHeight(maxHeight);
    }
  }, [isOpen]);

  // Enhanced scroll handling for dropdown
  useEffect(() => {
    if (isOpen) {
      // Comprehensive scroll lock prevention
      const html = document.documentElement;
      const body = document.body;

      // Store original values
      const originalHtmlOverflow = html.style.overflow;
      const originalBodyOverflow = body.style.overflow;
      const originalHtmlOverflowY = html.style.overflowY;
      const originalBodyOverflowY = body.style.overflowY;
      const originalBodyPaddingRight = body.style.paddingRight;

      // Force enable scrolling on both html and body
      html.style.overflow = "visible";
      html.style.overflowY = "auto";
      body.style.overflow = "visible";
      body.style.overflowY = "auto";
      body.style.paddingRight = originalBodyPaddingRight;

      // Additional safety: remove any scroll-lock classes that might be applied
      body.classList.remove("overflow-hidden");
      html.classList.remove("overflow-hidden");

      // Enhanced global scroll handling for dropdown that extends beyond viewport
      const handleGlobalWheel = (e: WheelEvent) => {
        const target = e.target as Element;
        const dropdownContent = target.closest("[data-radix-dropdown-menu-content]");
        const dropdownScrollArea = target.closest(".overflow-y-auto");

        // If scrolling within dropdown's scroll area, let it handle internally
        if (dropdownScrollArea && dropdownContent?.contains(dropdownScrollArea)) {
          return; // Let dropdown handle its own scrolling
        }

        // If not scrolling within dropdown, ensure page can scroll
        if (!dropdownContent) {
          // Force enable page scroll
          e.stopPropagation();

          // Additional safety: ensure body can scroll
          if (document.body.style.overflow === "hidden") {
            document.body.style.overflow = "auto";
          }
        }
      };

      // Add passive wheel listener for better performance
      document.addEventListener("wheel", handleGlobalWheel, { passive: true });

      // Additional: Handle touch scroll for mobile devices
      const handleTouchMove = (e: TouchEvent) => {
        const target = e.target as Element;
        const dropdownContent = target.closest("[data-radix-dropdown-menu-content]");

        // Allow page scroll on touch devices when not in dropdown
        if (!dropdownContent) {
          e.stopPropagation();
        }
      };

      document.addEventListener("touchmove", handleTouchMove, { passive: true });

      return () => {
        // Restore all original styles
        html.style.overflow = originalHtmlOverflow;
        html.style.overflowY = originalHtmlOverflowY;
        body.style.overflow = originalBodyOverflow;
        body.style.overflowY = originalBodyOverflowY;
        body.style.paddingRight = originalBodyPaddingRight;

        // Remove all event listeners
        document.removeEventListener("wheel", handleGlobalWheel);
        document.removeEventListener("touchmove", handleTouchMove);
      };
    }

    return undefined;
  }, [isOpen]);

  const hasActiveFilters = filters.formats.length > 0 || filters.dateRange !== "all";

  const activeFilterCount = filters.formats.length + (filters.dateRange !== "all" ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      {/* Filter Results Badge */}
      {hasActiveFilters && (
        <Badge variant="secondary" className="text-xs">
          {filteredItems} of {totalItems}
        </Badge>
      )}

      {/* Filter Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenuTrigger asChild={true}>
          <Button ref={triggerRef} variant="outline" size="sm" className="relative">
            <Settings className="h-4 w-4 mr-2" />
            Filter
            {activeFilterCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-72 sm:w-80 md:w-96 min-w-[280px] z-50"
          align="end"
          side="bottom"
          sideOffset={8}
          alignOffset={0}
          avoidCollisions={false}
          collisionPadding={0}
          style={{
            // Dynamic max-height based on available space below trigger
            maxHeight: `${availableHeight}px`,
            // Ensure dropdown can extend beyond viewport if needed for global scroll
            minHeight: "200px",
          }}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            setIsOpen(false);
          }}
          onPointerDownOutside={(e) => {
            // Enhanced outside click handling for better scroll behavior
            const target = e.target as Element;

            // Don't close dropdown if interacting with scroll elements or page scroll
            if (
              target.closest("[data-radix-scroll-area-viewport]") ||
              target.closest("[data-radix-scroll-area-scrollbar]") ||
              target.closest("[data-radix-dropdown-menu-content]") ||
              target.tagName === "HTML" ||
              target.tagName === "BODY" ||
              // Allow scrollbar interactions
              target.closest("::-webkit-scrollbar") ||
              // Check if it's a scroll event on the page
              target === document.documentElement ||
              target === document.body
            ) {
              e.preventDefault();
              return;
            }

            // Close dropdown for genuine outside clicks
            setIsOpen(false);
          }}
          onInteractOutside={(e) => {
            // Additional handler for interaction outside
            const target = e.target as Element;

            // Prevent closing on scroll interactions
            if (
              target.tagName === "HTML" ||
              target.tagName === "BODY" ||
              target.closest("[data-radix-scroll-area-viewport]")
            ) {
              e.preventDefault();
            }
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 pb-2">
            <DropdownMenuLabel className="flex items-center gap-2 text-sm font-semibold">
              <Filter className="h-4 w-4" />
              Filter QR Codes
            </DropdownMenuLabel>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <DropdownMenuSeparator />

          {/* Scrollable Content with dynamic height calculation */}
          <div
            className="overflow-y-auto overflow-x-hidden"
            style={{
              // Use calculated available height minus header space
              maxHeight: `${Math.max(150, availableHeight - 80)}px`,
              // Ensure smooth scrolling within dropdown
              scrollBehavior: "smooth",
              // Prevent scroll from bubbling to parent
              overscrollBehavior: "contain",
            }}
          >
            <div className="p-1">
              {/* Date Range Filter */}
              <div className="px-2 py-3">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Date Range</span>
                </div>
                <DropdownMenuRadioGroup
                  value={filters.dateRange}
                  onValueChange={(value) =>
                    updateFilters({
                      dateRange: value as "all" | "today" | "week" | "month" | "year",
                    })
                  }
                >
                  <DropdownMenuRadioItem value="all" className="cursor-pointer">
                    All Time
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="today" className="cursor-pointer">
                    Today
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="week" className="cursor-pointer">
                    This Week
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="month" className="cursor-pointer">
                    This Month
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="year" className="cursor-pointer">
                    This Year
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </div>

              <DropdownMenuSeparator />

              {/* Format Filter */}
              <div className="px-2 py-3">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Format</span>
                </div>
                <div className="space-y-1">
                  {AVAILABLE_FORMATS.map((format) => (
                    <DropdownMenuCheckboxItem
                      key={format}
                      checked={filters.formats.includes(format)}
                      onCheckedChange={(checked) => {
                        const newFormats = checked
                          ? [...filters.formats, format]
                          : filters.formats.filter((f) => f !== format);
                        updateFilters({ formats: newFormats });
                      }}
                      className="cursor-pointer"
                    >
                      {format.toUpperCase()}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
