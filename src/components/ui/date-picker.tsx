"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Simple date formatter with responsive format
const formatDate = (date: Date): string => {
  // Check if mobile screen
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  if (isMobile) {
    // Shorter format for mobile
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  } else {
    // Full format for desktop
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }
};

interface DatePickerProps {
  date?: Date | undefined;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Handle click outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Don't close if clicking on Select dropdown elements
      if (target.closest('[data-radix-select-content]') ||
          target.closest('[data-radix-select-trigger]') ||
          target.closest('[data-radix-select-item]') ||
          target.closest('[data-radix-popper-content-wrapper]')) {
        return;
      }

      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }

    return undefined;
  }, [open]);

  return (
    <div ref={containerRef}>
      <Popover
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            setTimeout(() => {
              const activeElement = document.activeElement;
              const isSelectInteraction = activeElement?.closest('[data-radix-select-content]') ||
                                        activeElement?.closest('[data-radix-select-trigger]') ||
                                        document.querySelector('[data-radix-select-content][data-state="open"]');

              if (!isSelectInteraction) {
                setOpen(false);
              }
            }, 50);
          } else {
            setOpen(true);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? formatDate(date) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 max-w-[95vw]" align="center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              onDateChange?.(selectedDate);
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
