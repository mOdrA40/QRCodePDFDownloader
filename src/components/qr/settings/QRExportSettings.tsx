/**
 * QR Export Settings Component
 * Export format and PDF options
 */

"use client";

import { useId } from "react";
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
import { QR_FORMAT_INFO } from "@/utils/qr-content-utils";
import type { QRImageFormat } from "@/types";

export function QRExportSettings() {
  const { state, updateOption } = useQRContext();
  const { state: settingsState, setPreviewMode } = useSettingsContext();
  const { options } = state;
  const previewModeId = useId();
  const enablePdfPasswordId = useId();
  const pdfPasswordId = useId();

  const availableFormats: QRImageFormat[] = ["png", "jpeg", "webp"];

  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="format" className="text-sm font-medium">
            Image Format
          </Label>
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
              const info = QR_FORMAT_INFO[format];
              return (
                <SelectItem key={format} value={format}>
                  <div className="flex items-center gap-2">
                    <span>{info.label}</span>
                    {info.badge && (
                      <Badge variant="outline" className="text-xs">
                        {info.badge}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          PNG provides the best quality for most use cases.
        </p>


      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id={previewModeId}
          checked={settingsState.previewMode}
          onCheckedChange={setPreviewMode}
        />
        <Label htmlFor={previewModeId} className="text-sm font-medium">
          Live Preview Mode
        </Label>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Automatically generate QR code as you type
      </p>

      <div className="flex items-center space-x-2">
        <Switch
          id={enablePdfPasswordId}
          checked={options.enablePdfPassword ?? false}
          onCheckedChange={(checked) =>
            updateOption("enablePdfPassword", checked)
          }
        />
        <Label htmlFor={enablePdfPasswordId} className="text-sm font-medium">
          Password Protect PDF
        </Label>
      </div>

      {options.enablePdfPassword && (
        <div>
          <Label htmlFor={pdfPasswordId} className="text-sm font-medium">
            PDF Password
          </Label>
          <Input
            id={pdfPasswordId}
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
