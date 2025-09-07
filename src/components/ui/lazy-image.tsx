/**
 * Lazy Image Component
 * Optimized image loading with intersection observer
 */

"use client";

import Image from "next/image";
import { memo, type RefObject, useState } from "react";
import { useIntersectionObserver } from "@/lib/performance";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fallback?: string;
  placeholder?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

export const LazyImage = memo(function LazyImage({
  src,
  alt,
  width = 500,
  height = 300,
  fallback = "/placeholder.svg",
  placeholder,
  className,
  containerClassName,
  priority = false,
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
      className={cn("relative overflow-hidden bg-muted", containerClassName)}
    >
      {isIntersecting && (
        <Image
          src={hasError ? fallback : src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className,
          )}
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
