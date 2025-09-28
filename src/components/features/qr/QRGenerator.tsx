/**
 * QR Generator Main Component
 * Orchestrates all QR-related components
 * @deprecated Use HomeContent, HomeHeader, HomeNavigation components instead
 */

"use client";

import { HomeContent, HomeHeader, HomeNavigation } from "@/components/features/home";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useHomeLayout } from "@/hooks/home";

interface QRGeneratorProps {
  className?: string;
}

export function QRGenerator({ className }: QRGeneratorProps) {
  const { containerClass } = useHomeLayout();

  return (
    <TooltipProvider>
      <div
        className={`bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen py-4 px-4 ${className}`}
      >
        <div className={containerClass}>
          <HomeNavigation />
          <HomeHeader />
          <HomeContent />
        </div>
      </div>
    </TooltipProvider>
  );
}
