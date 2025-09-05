/**
 * QR Generator Main Component
 * Orchestrates all QR-related components
 */

"use client";

import React from "react";
import { QrCode, Sparkles, Zap, Star, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { QRControls } from "./QRControls";
import { QRPreview } from "./QRPreview";
import { QRSettings } from "./QRSettings";
import { QRExport } from "./QRExport";
import { QuickActions } from "@/components/quick-actions";
import { UsageStats } from "@/components/usage-stats";
import { useQRContext } from "@/contexts";

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
      <div className={`bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen py-4 px-4 ${className}`}>
        <div className="max-w-7xl mx-auto space-y-8 pb-8">
          {/* Theme Toggle */}
          <div className="fixed right-4 top-4 z-50">
            <ThemeToggle />
          </div>
          
          {/* Header */}
          <div className="text-center mb-8 pt-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QR PDF Generator
              </h1>
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create stunning QR codes and download them as beautiful PDFs with
              advanced customization options
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" />
                Lightning Fast
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" />
                Premium Quality
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Heart className="h-3 w-3 text-red-500" />
                Ultra Beautiful
              </Badge>
            </div>
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
