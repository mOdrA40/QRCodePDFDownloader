/**
 * Home Header Component
 * Main title and description section
 */

"use client";

import { QrCode } from "lucide-react";

export function HomeHeader() {
  return (
    <div className="text-center mb-8 pt-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <QrCode className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
          QR PDF Downloader
        </h1>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Create stunning QR codes and download them as beautiful PDFs with advanced customization
        options
      </p>
    </div>
  );
}
