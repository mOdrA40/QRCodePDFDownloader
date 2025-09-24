/**
 * QR Generator Main Component
 * Orchestrates all QR-related components
 */

"use client";

import { QrCode } from "lucide-react";
import { QuickActions } from "@/components/quick-actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButton } from "@/components/auth/AuthButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UsageStats } from "@/components/usage-stats";
import { useQRContext } from "@/contexts";
import { QRControls } from "./QRControls";
import { QRExport } from "./QRExport";
import { QRPreview } from "./QRPreview";
import { QRSettings } from "./QRSettings";

interface QRGeneratorProps {
  className?: string;
}

export function QRGenerator({ className }: QRGeneratorProps) {
  const { updateOption } = useQRContext();

  const handleQuickAction = (text: string) => {
    updateOption("text", text);
  };

  return (
    <TooltipProvider>
      <div
        className={`bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen py-4 px-4 ${className}`}
      >
        <div className="max-w-7xl mx-auto space-y-8 pb-8">
          {/* Header with Theme Toggle and Auth Button */}
          <div className="flex justify-end items-center gap-3 mb-4">
            <AuthButton />
            <ThemeToggle />
          </div>

          {/* Header */}
          <div className="text-center mb-8 pt-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <QrCode className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
                QR PDF Downloader
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create stunning QR codes and download them as beautiful PDFs with
              advanced customization options
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Panel - Controls */}
            <div className="space-y-6">
              <QRControls />
              <QRSettings />
              <QuickActions onQuickAction={handleQuickAction} />
            </div>

            {/* Right Panel - Preview and Actions */}
            <div className="space-y-6">
              <QRPreview />
              <QRExport />
              <UsageStats />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
