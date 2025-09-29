/**
 * QR Export Component
 * Download and sharing options for QR codes
 */

"use client";

import { Download, FileText, Image, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQRContext } from "@/contexts";
import { useUsageStats } from "@/hooks";
import { fileService, pdfService, qrService } from "@/services";
import { ShareOptions } from "./share-options";

interface QRExportProps {
  className?: string;
}

export function QRExport({ className }: QRExportProps) {
  const { state } = useQRContext();
  const { qrDataUrl, options } = state;

  const { recordDownload } = useUsageStats();

  // Fix hydration mismatch by initializing state after mount
  const [selectedTheme, setSelectedTheme] = useState<"modern" | "elegant" | "professional" | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const themes = [
    {
      value: "modern",
      label: "Modern",
      description: "Clean blue design",
      color: "bg-blue-500",
    },
    {
      value: "elegant",
      label: "Elegant",
      description: "Purple gradient",
      color: "bg-purple-500",
    },
    {
      value: "professional",
      label: "Professional",
      description: "Green corporate",
      color: "bg-green-500",
    },
  ] as const;

  // Initialize theme after component mounts to prevent hydration mismatch
  useEffect(() => {
    setSelectedTheme("modern");
    setIsMounted(true);
  }, []);

  const ensureQrDataUrl = async (forPdf: boolean): Promise<string | null> => {
    if (qrDataUrl) return qrDataUrl;
    if (!options.text.trim()) return null;
    try {
      const result = await qrService.generateQRCode(
        options.text,
        {
          size: options.size,
          margin: options.margin,
          errorCorrectionLevel: options.errorCorrectionLevel,
          color: { dark: options.foreground, light: options.background },
          format: forPdf ? "png" : options.format,
        },
        false
      );
      return result.dataUrl;
    } catch (_e) {
      toast.error("Failed to generate QR for download");
      return null;
    }
  };

  const downloadPDF = async (theme: "modern" | "elegant" | "professional" = "modern") => {
    // Always proceed with PDF download - no browser restrictions
    await performPDFDownload(theme);
  };

  const performPDFDownload = async (theme: "modern" | "elegant" | "professional") => {
    try {
      const dataUrl = await ensureQrDataUrl(true);
      if (!dataUrl) {
        return;
      }
      const pdfOptions: {
        title: string;
        author: string;
        subject: string;
        theme: "modern" | "elegant" | "professional";
        password?: string;
      } = {
        title: "QR Code Document",
        author: "QR PDF Generator Pro",
        subject: "Generated QR Code with Enhanced Design",
        theme,
      };

      if (options.enablePdfPassword && options.pdfPassword) {
        pdfOptions.password = options.pdfPassword;
      }

      const result = await pdfService.generatePDF(dataUrl, options.text, pdfOptions);

      if (result.success) {
        toast.success("PDF generated successfully!", {
          description: `Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)} | Type: ${result.contentType || "Unknown"}`,
          duration: 4000,
        });
        // Track usage in guest mode via localStorage
        recordDownload("pdf", "pdf", options.size);
      } else {
        toast.error(result.error || "Failed to generate PDF");
      }
    } catch (_error) {
      toast.error("Failed to generate PDF");
    }
  };

  const downloadImage = async () => {
    if (!options.text.trim()) {
      toast.error("Please enter text to generate QR first");
      return;
    }

    const dataUrl = await ensureQrDataUrl(false);
    if (!dataUrl) return;

    const result = fileService.downloadFile(dataUrl, {
      filename: `qr-code-${Date.now()}`,
      format: options.format,
    });

    if (result.success) {
      // Track usage in guest mode via localStorage
      recordDownload("image", options.format, options.size);
    } else {
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
        <CardDescription>Export your QR code in different formats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-purple-600" />
            <label className="text-sm font-medium">PDF Theme</label>
          </div>
          {isMounted ? (
            <Select
              value={selectedTheme || "modern"}
              onValueChange={(value: "modern" | "elegant" | "professional") =>
                setSelectedTheme(value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {themes.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${theme.color}`} />
                      <div>
                        <div className="font-medium">{theme.label}</div>
                        <div className="text-xs text-muted-foreground">{theme.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="w-full h-10 bg-muted/50 rounded-md animate-pulse" />
          )}
        </div>

        {/* Download Options */}
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={() => downloadPDF(selectedTheme || "modern")}
            disabled={!(options.text.trim() && isMounted)}
            className="h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white cursor-pointer relative z-10"
            type="button"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Download as PDF</span>
              {options.enablePdfPassword && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded">🔒 Protected</span>
              )}
            </div>
          </Button>

          <Button
            onClick={downloadImage}
            disabled={!options.text.trim()}
            variant="outline"
            className="h-14 border-2 cursor-pointer relative z-10"
            type="button"
          >
            <Image className="h-5 w-5 mr-2" />
            Download as {options.format.toUpperCase()}
          </Button>
        </div>

        <ShareOptions qrDataUrl={qrDataUrl} qrText={options.text} />

        {/* Download Info */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Format:</span>
              <span className="font-medium">{options.format.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Size:</span>
              <span className="font-medium">
                {options.size}×{options.size}px
              </span>
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
