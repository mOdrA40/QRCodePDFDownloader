/**
 * Lazy Image Component
 * Optimized image loading with intersection observer
 */

"use client";

import type React from "react";
import { memo, useState, type RefObject } from "react";
import { useIntersectionObserver } from "@/lib/performance";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  placeholder?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const LazyImage = memo(function LazyImage({
  src,
  alt,
  fallback = "/placeholder.svg",
  placeholder,
  className,
  containerClassName,
  ...props
}: LazyImageProps) {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px",
  }) as [RefObject<HTMLDivElement>, boolean];
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden bg-muted",
        containerClassName
      )}
    >
      {isIntersecting && (
        <img
          src={hasError ? fallback : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...props}
        />
      )}
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          {placeholder || (
            <div className="animate-pulse bg-muted-foreground/20 w-full h-full" />
          )}
        </div>
      )}
    </div>
  );
});
