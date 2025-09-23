/**
 * QR Filter Component
 * Advanced filtering options for QR history list
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Filter,
  X,
  Calendar,
  Image
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

export interface QRFilterOptions {
  formats: string[];
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
}

interface QRFilterProps {
  onFilterChange: (filters: QRFilterOptions) => void;
  totalItems: number;
  filteredItems: number;
}

const DEFAULT_FILTERS: QRFilterOptions = {
  formats: [],
  dateRange: 'all',
};

// Available filter options based on QR data structure
const AVAILABLE_FORMATS = ['png', 'jpeg', 'webp', 'svg'];

export function QRFilter({ onFilterChange, totalItems, filteredItems }: QRFilterProps) {
  const [filters, setFilters] = useState<QRFilterOptions>(DEFAULT_FILTERS);
  const [isOpen, setIsOpen] = useState(false);

  const updateFilters = useCallback((newFilters: Partial<QRFilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  }, [filters, onFilterChange]);

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
  }, [onFilterChange]);

  // Allow global scroll when dropdown is open
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll lock that might be applied by Radix
      const body = document.body;
      const originalOverflow = body.style.overflow;
      const originalPaddingRight = body.style.paddingRight;

      // Ensure body can scroll
      body.style.overflow = 'auto';
      body.style.paddingRight = originalPaddingRight;

      return () => {
        // Restore original styles when dropdown closes
        body.style.overflow = originalOverflow;
        body.style.paddingRight = originalPaddingRight;
      };
    }

    return undefined;
  }, [isOpen]);

  const hasActiveFilters =
    filters.formats.length > 0 ||
    filters.dateRange !== 'all';

  const activeFilterCount =
    filters.formats.length +
    (filters.dateRange !== 'all' ? 1 : 0);

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
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
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
          className="w-[calc(100vw-2rem)] sm:w-80 md:w-96 max-h-[80vh] sm:max-h-[85vh] min-w-[280px] z-50 mx-4 sm:mx-0"
          align="end"
          side="bottom"
          sideOffset={12}
          alignOffset={0}
          avoidCollisions={false}
          collisionPadding={8}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            setIsOpen(false);
          }}
          onPointerDownOutside={(e) => {
            // Allow scrolling outside the dropdown without closing it
            const target = e.target as Element;

            // Don't close dropdown if clicking on scrollbar or scroll area
            if (target.closest('[data-radix-scroll-area-viewport]') ||
                target.closest('[data-radix-scroll-area-scrollbar]') ||
                target.tagName === 'HTML' ||
                target.tagName === 'BODY') {
              e.preventDefault();
              return;
            }

            // Close dropdown for other outside clicks
            setIsOpen(false);
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

          {/* Scrollable Content */}
          <div className="max-h-[60vh] sm:max-h-[65vh] md:max-h-[70vh] overflow-y-auto overflow-x-hidden">
            <div className="p-1">

              {/* Date Range Filter */}
              <div className="px-2 py-3">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Date Range</span>
                </div>
                <DropdownMenuRadioGroup
                  value={filters.dateRange}
                  onValueChange={(value) => updateFilters({ dateRange: value as 'all' | 'today' | 'week' | 'month' | 'year' })}
                >
                  <DropdownMenuRadioItem value="all" className="cursor-pointer">All Time</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="today" className="cursor-pointer">Today</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="week" className="cursor-pointer">This Week</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="month" className="cursor-pointer">This Month</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="year" className="cursor-pointer">This Year</DropdownMenuRadioItem>
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
                          : filters.formats.filter(f => f !== format);
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
