/**
 * Duplicate Warning Component
 * Shows warning when user tries to generate duplicate QR code
 */

"use client";

import { AlertTriangle, Clock, Copy } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Doc } from "@/convex/_generated/dataModel";

interface DuplicateWarningProps {
  existingQR: Doc<"qrHistory">;
  onProceedAnyway: () => void;
  onCancel: () => void;
}

export function DuplicateWarning({ existingQR, onProceedAnyway, onCancel }: DuplicateWarningProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">QR Code Sudah Ada</AlertTitle>
      <AlertDescription className="space-y-4">
        <p className="text-amber-700 dark:text-amber-300">
          QR code dengan konten yang sama sudah pernah dibuat sebelumnya.
        </p>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div
                className="w-12 h-12 rounded border-2 flex items-center justify-center text-xs font-mono"
                style={{
                  backgroundColor: existingQR.qrSettings.background,
                  borderColor: existingQR.qrSettings.foreground,
                  color: existingQR.qrSettings.foreground,
                }}
              >
                QR
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {existingQR.qrSettings.format.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {existingQR.qrSettings.size}px
                </Badge>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                {existingQR.textContent}
              </p>

              <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 dark:text-slate-500">
                <Clock className="h-3 w-3" />
                Dibuat: {formatDate(existingQR.createdAt)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">
            <Copy className="h-4 w-4 mr-2" />
            Gunakan yang Lama
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onProceedAnyway}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Buat Ulang
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
