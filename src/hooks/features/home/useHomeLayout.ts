/**
 * Home Layout Hook
 * Manages layout state and responsive behavior for homepage
 */

"use client";

import { useCallback, useEffect, useState } from "react";

export interface HomeLayoutState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  containerClass: string;
  panelClass: string;
}

export function useHomeLayout(): HomeLayoutState {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const updateLayout = useCallback(() => {
    const width = window.innerWidth;
    setIsMobile(width < 768);
    setIsTablet(width >= 768 && width < 1280);
    setIsDesktop(width >= 1280);
  }, []);

  useEffect(() => {
    // Initial check
    updateLayout();

    // Add resize listener
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [updateLayout]);

  const containerClass = "max-w-7xl mx-auto space-y-8 pb-8";
  const panelClass = isMobile ? "space-y-4" : isTablet ? "space-y-5" : "space-y-6";

  return {
    isMobile,
    isTablet,
    isDesktop,
    containerClass,
    panelClass,
  };
}
