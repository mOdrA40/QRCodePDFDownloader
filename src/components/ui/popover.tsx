"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface PopoverContentProps {
  className?: string;
  align?: "start" | "center" | "end";
  children: React.ReactNode;
}

const Popover = ({ open, onOpenChange, children }: PopoverProps) => {
  const contextValue = React.useMemo(() => ({ open, onOpenChange }), [open, onOpenChange]);

  return (
    <PopoverContext.Provider value={contextValue}>
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

const PopoverContext = React.createContext<{
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
}>({});

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  }
>(({ className, children, asChild, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(PopoverContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>, {
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        onOpenChange?.(!open);
        const childProps = (children as React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>).props;
        if (childProps && typeof childProps.onClick === 'function') {
          childProps.onClick(e);
        }
      },
      ...props,
    });
  }

  return (
    <button
      ref={ref}
      className={className}
      onClick={() => onOpenChange?.(!open)}
      {...props}
    >
      {children}
    </button>
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  PopoverContentProps
>(({ className, align = "center", children, ...props }, ref) => {
  const { open } = React.useContext(PopoverContext);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-[60] w-auto max-w-[95vw] rounded-md border bg-popover p-0 text-popover-foreground shadow-lg outline-none overflow-visible",
        align === "start" && "left-0",
        align === "center" && "left-1/2 transform -translate-x-1/2",
        align === "end" && "right-0",
        "top-full mt-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
