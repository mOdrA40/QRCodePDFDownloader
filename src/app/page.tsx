/**
 * QR PDF Downloader Homepage
 * Main landing page with QR code generation functionality
 */

"use client";

import { HomeContent, HomeHeader, HomeNavigation } from "@/components/features/home";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProviders } from "@/contexts";
import { useHomeLayout } from "@/hooks";

export default function QRCodePDFDownloader() {
  const { containerClass } = useHomeLayout();

  return (
    <AppProviders>
      <TooltipProvider>
        <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen py-4 px-4">
          <div className={containerClass}>
            <HomeNavigation />
            <HomeHeader />
            <HomeContent />
          </div>
        </div>
      </TooltipProvider>
    </AppProviders>
  );
}
