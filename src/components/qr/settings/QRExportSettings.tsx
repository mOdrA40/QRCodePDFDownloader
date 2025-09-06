/**
 * QR Export Settings Component
 * Export format and PDF options
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQRContext, useSettingsContext } from "@/contexts";
import { browserDetectionService } from "@/services/browser-detection-service";
import type { BrowserCapabilities } from "@/services/browser-detection-service";
import type { QRImageFormat } from "@/types";
import { useEffect, useState } from "react";

export function QRExportSettings() {
  const { state, updateOption } = useQRContext();
  const { state: settingsState, setPreviewMode } = useSettingsContext();
  const { options } = state;

  const [browserCapabilities, setBrowserCapabilities] =
    useState<BrowserCapabilities | null>(null);
  const [availableFormats, setAvailableFormats] = useState<QRImageFormat[]>([
    "png",
    "jpeg",
    "webp",
    "svg",
  ]);

  // Detect browser capabilities and adjust available formats
  useEffect(() => {
    if (typeof window !== "undefined") {
      const capabilities = browserDetectionService.detectCapabilities();
      setBrowserCapabilities(capabilities);

      // Determine available formats based on browser capabilities
      let formats: QRImageFormat[] = [];

      if (capabilities.isPrivacyBrowser || !capabilities.supportsCanvas) {
        // For privacy browsers or when canvas is blocked, only offer SVG
        formats = ["svg"];

        // Auto-switch to SVG if current format is not supported
        if (options.format !== "svg") {
          updateOption("format", "svg");
        }
      } else {
        // For compatible browsers, offer all formats
        formats = ["png", "jpeg", "webp", "svg"];
      }

      setAvailableFormats(formats);
    }
  }, [options.format, updateOption]);

  // Get format display info
  const getFormatInfo = (format: QRImageFormat) => {
    const info = {
      png: {
        label: "PNG",
        description: "Recommended for quality",
        badge: null,
      },
      jpeg: { label: "JPEG", description: "Smaller file size", badge: null },
      webp: { label: "WebP", description: "Modern format", badge: null },
      svg: {
        label: "SVG",
        description: browserCapabilities?.isPrivacyBrowser
          ? "Optimized for your browser"
          : "Vector format",
        badge: browserCapabilities?.isPrivacyBrowser ? "Recommended" : null,
      },
    };

    return info[format];
  };

  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="format" className="text-sm font-medium">
            Image Format
          </Label>
          {browserCapabilities?.isPrivacyBrowser && (
            <Badge variant="secondary" className="text-xs">
              Auto-optimized
            </Badge>
          )}
        </div>
        <Select
          value={options.format}
          onValueChange={(value: QRImageFormat) =>
            updateOption("format", value)
          }
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableFormats.map((format) => {
              const formatInfo = getFormatInfo(format);
              return (
                <SelectItem key={format} value={format}>
                  <div className="flex items-center gap-2">
                    <span>{formatInfo.label}</span>
                    {formatInfo.badge && (
                      <Badge variant="outline" className="text-xs">
                        {formatInfo.badge}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          {browserCapabilities?.isPrivacyBrowser
            ? "SVG format automatically selected for optimal compatibility with your privacy browser."
            : "PNG provides the best quality. SVG is recommended for LibreWolf and privacy browsers."}
        </p>

        {/* Browser-specific notice */}
        {browserCapabilities?.isPrivacyBrowser && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              🛡️ Privacy browser detected: Only compatible formats are shown for
              optimal performance.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="preview-mode"
          checked={settingsState.previewMode}
          onCheckedChange={setPreviewMode}
        />
        <Label htmlFor="preview-mode" className="text-sm font-medium">
          Live Preview Mode
        </Label>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Automatically generate QR code as you type
      </p>

      <div className="flex items-center space-x-2">
        <Switch
          id="enable-pdf-password"
          checked={options.enablePdfPassword}
          onCheckedChange={(checked) =>
            updateOption("enablePdfPassword", checked)
          }
        />
        <Label htmlFor="enable-pdf-password" className="text-sm font-medium">
          Password Protect PDF
        </Label>
      </div>

      {options.enablePdfPassword && (
        <div>
          <Label htmlFor="pdf-password" className="text-sm font-medium">
            PDF Password
          </Label>
          <Input
            id="pdf-password"
            type="password"
            placeholder="Enter password for PDF..."
            value={options.pdfPassword}
            onChange={(e) => updateOption("pdfPassword", e.target.value)}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Password must be at least 4 characters long
          </p>
        </div>
      )}

      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium mb-2">Export Quality</h4>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>PNG:</span>
            <span>Lossless, best quality</span>
          </div>
          <div className="flex justify-between">
            <span>JPEG:</span>
            <span>Smaller file, slight compression</span>
          </div>
          <div className="flex justify-between">
            <span>WebP:</span>
            <span>Modern format, good compression</span>
          </div>
        </div>
      </div>
    </>
  );
}
