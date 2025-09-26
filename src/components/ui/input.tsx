import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles with enhanced border contrast for dark theme
          "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors",
          // Theme-aware border colors for better contrast
          "border-gray-300 dark:border-gray-600",
          // Enhanced focus states with better visibility
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "focus-visible:border-gray-400 dark:focus-visible:border-gray-500",
          // Hover states for better UX
          "hover:border-gray-400 dark:hover:border-gray-500",
          // File input and placeholder styles
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Responsive text sizing
          "md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
