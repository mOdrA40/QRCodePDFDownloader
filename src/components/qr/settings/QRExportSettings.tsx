/**
 * QR Export Settings Component
 * Export format and PDF options
 */

"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQRContext, useSettingsContext } from "@/contexts";
import type { QRImageFormat } from "@/types";

export function QRExportSettings() {
  const { state, updateOption } = useQRContext();
  const { state: settingsState, setPreviewMode } = useSettingsContext();
  const { options } = state;

  return (
    <>
      <div>
        <Label htmlFor="format" className="text-sm font-medium">
          Image Format
        </Label>
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
            <SelectItem value="png">
              PNG (Recommended)
            </SelectItem>
            <SelectItem value="jpeg">JPEG</SelectItem>
            <SelectItem value="webp">WebP</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          PNG provides the best quality for QR codes
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="preview-mode"
          checked={settingsState.previewMode}
          onCheckedChange={setPreviewMode}
        />
        <Label
          htmlFor="preview-mode"
          className="text-sm font-medium"
        >
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
            onChange={(e) =>
              updateOption("pdfPassword", e.target.value)
            }
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
