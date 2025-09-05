/**
 * QR Export Component
 * Download and sharing options for QR codes
 */

"use client";

import React from "react";
import { Download, FileText, Image, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShareOptions } from "@/components/share-options";
import { useQRContext, useSettingsContext } from "@/contexts";
import { pdfService, fileService } from "@/services";
import { toast } from "sonner";

interface QRExportProps {
  className?: string;
}

export function QRExport({ className }: QRExportProps) {
  const { state, generateQRCode } = useQRContext();
  const { state: settingsState } = useSettingsContext();
  const { qrDataUrl, options, isGenerating } = state;

  const downloadPDF = async () => {
    if (!qrDataUrl) {
      toast.error("Please generate a QR code first");
      return;
    }

    try {
      const result = await pdfService.generatePDF(
        qrDataUrl,
        options.text,
        {
          title: "QR Code Document",
          author: "QR PDF Generator",
          subject: "Generated QR Code",
          password: options.enablePdfPassword ? options.pdfPassword : undefined,
        }
      );

      if (!result.success) {
        toast.error(result.error || "Failed to generate PDF");
      }
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  const downloadImage = () => {
    if (!qrDataUrl) {
      toast.error("Please generate a QR code first");
      return;
    }

    const result = fileService.downloadFile(qrDataUrl, {
      filename: `qr-code-${Date.now()}`,
      format: options.format,
    });

    if (!result.success) {
      toast.error(result.error || "Failed to download image");
    }
  };

  return (
    <Card className={`shadow-xl bg-card/80 backdrop-blur border-border ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-purple-600" />
          Download Options
        </CardTitle>
        <CardDescription>
          Export your QR code in different formats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={downloadPDF}
            disabled={!qrDataUrl}
            className="h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white cursor-pointer relative z-10"
            type="button"
          >
            <FileText className="h-5 w-5 mr-2" />
            Download as PDF
            {options.enablePdfPassword && (
              <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                🔒 Protected
              </span>
            )}
          </Button>

          <Button
            onClick={downloadImage}
            disabled={!qrDataUrl}
            variant="outline"
            className="h-14 border-2 cursor-pointer relative z-10"
            type="button"
          >
            <Image className="h-5 w-5 mr-2" />
            Download as {options.format.toUpperCase()}
          </Button>
        </div>

        <ShareOptions qrDataUrl={qrDataUrl} qrText={options.text} />

        {!settingsState.previewMode && (
          <Button
            onClick={generateQRCode}
            disabled={!options.text.trim() || isGenerating}
            className="w-full h-12"
            variant="secondary"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate QR Code
              </>
            )}
          </Button>
        )}

        {/* Download Info */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Format:</span>
              <span className="font-medium">{options.format.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Size:</span>
              <span className="font-medium">{options.size}×{options.size}px</span>
            </div>
            <div className="flex justify-between">
              <span>Error Correction:</span>
              <span className="font-medium">{options.errorCorrectionLevel}</span>
            </div>
            {qrDataUrl && (
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium text-green-600">Ready to download</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
