"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CalendarProps {
  mode?: "single";
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
  initialFocus?: boolean;
  className?: string;
}

function Calendar({ selected, onSelect, className }: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(selected || new Date());

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays = [];

  // Previous month's trailing days
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const prevDate = new Date(currentYear, currentMonth, -i);
    calendarDays.push({ date: prevDate, isCurrentMonth: false });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    calendarDays.push({ date, isCurrentMonth: true });
  }

  // Next month's leading days
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    const nextDate = new Date(currentYear, currentMonth + 1, day);
    calendarDays.push({ date: nextDate, isCurrentMonth: false });
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleMonthChange = (monthIndex: string) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(Number.parseInt(monthIndex, 10));
      return newDate;
    });
  };

  const handleYearChange = (year: string) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(Number.parseInt(year, 10));
      return newDate;
    });
  };

  const handleDateSelect = (date: Date) => {
    onSelect?.(date);
  };

  const isSelected = (date: Date) => {
    return (
      selected &&
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Generate year options (current year ± 50 years)
  const currentYearForOptions = new Date().getFullYear();
  const yearOptions = Array.from({ length: 101 }, (_, i) => currentYearForOptions - 50 + i);

  return (
    <div className={cn("p-3 w-[320px] max-w-[95vw]", className)}>
      {/* Header with separate month and year selectors */}
      <div className="flex justify-between items-center mb-4 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigateMonth("prev")}
          className="h-8 w-8 p-0 shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 flex-1 justify-center">
          {/* Month Selector */}
          <Select
            value={currentMonth.toString()}
            onValueChange={handleMonthChange}
            onOpenChange={(isOpen) => {
              if (isOpen) {
                // Add a small delay to prevent immediate closure
                setTimeout(() => {
                  // Small delay to prevent immediate closure
                }, 100);
              }
            }}
          >
            <SelectTrigger
              className="w-auto h-8 text-sm font-medium border-none shadow-none focus:ring-0 px-2 min-w-[90px]"
              onMouseDown={(e) => {
                // Prevent event bubbling that might close the calendar
                e.stopPropagation();
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className="z-[200]"
              position="popper"
              side="bottom"
              align="center"
              sideOffset={4}
              avoidCollisions={true}
              collisionPadding={8}
              onCloseAutoFocus={(e) => {
                // Prevent auto focus that might close the calendar
                e.preventDefault();
              }}
            >
              {monthNames.map((month, index) => (
                <SelectItem
                  key={month}
                  value={index.toString()}
                  onSelect={(e) => {
                    // Prevent event bubbling
                    e?.stopPropagation?.();
                  }}
                >
                  <span className="text-sm">{month}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year Selector */}
          <Select
            value={currentYear.toString()}
            onValueChange={handleYearChange}
            onOpenChange={(isOpen) => {
              if (isOpen) {
                setTimeout(() => {
                  // Small delay to prevent immediate closure
                }, 100);
              }
            }}
          >
            <SelectTrigger
              className="w-auto h-8 text-sm font-medium border-none shadow-none focus:ring-0 px-2 min-w-[70px]"
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className="max-h-[200px] z-[200]"
              position="popper"
              side="bottom"
              align="center"
              sideOffset={4}
              avoidCollisions={true}
              collisionPadding={8}
              onCloseAutoFocus={(e) => {
                e.preventDefault();
              }}
            >
              {yearOptions.map((year) => (
                <SelectItem
                  key={year}
                  value={year.toString()}
                  onSelect={(e) => {
                    e?.stopPropagation?.();
                  }}
                >
                  <span className="text-sm">{year}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigateMonth("next")}
          className="h-8 w-8 p-0 shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs sm:text-sm font-medium text-muted-foreground p-1 sm:p-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayInfo) => {
          const { date, isCurrentMonth } = dayInfo;
          const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          return (
            <Button
              key={dateKey}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDateSelect(date)}
              className={cn(
                "h-8 w-8 sm:h-9 sm:w-9 p-0 font-normal text-xs sm:text-sm",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isSelected(date) &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isToday(date) && !isSelected(date) && "bg-accent text-accent-foreground",
                "hover:bg-accent hover:text-accent-foreground transition-colors"
              )}
            >
              {date.getDate()}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
