/**
 * QR Appearance Settings Component
 * Color and visual customization options
 */

"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQRContext } from "@/contexts";
import { getColorThemes } from "@/contexts";

export function QRAppearanceSettings() {
  const { state, updateOption } = useQRContext();
  const { options } = state;
  const presetColors = getColorThemes();

  const handleColorPresetClick = (foreground: string, background: string) => {
    updateOption("foreground", foreground);
    updateOption("background", background);
  };

  return (
    <>
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Color Presets
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {presetColors.map((preset) => (
            <Tooltip key={preset.name}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleColorPresetClick(preset.foreground, preset.background)}
                  className="h-12 p-1"
                >
                  <div
                    className="w-full h-full rounded border-2 flex items-center justify-center text-xs font-medium"
                    style={{
                      backgroundColor: preset.background,
                      color: preset.foreground,
                      borderColor: preset.foreground,
                    }}
                  >
                    {preset.name}
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{preset.name} theme</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="foreground"
            className="text-sm font-medium"
          >
            Foreground Color
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="foreground"
              type="color"
              value={options.foreground}
              onChange={(e) => updateOption("foreground", e.target.value)}
              className="w-12 h-10 p-1 border rounded"
              suppressHydrationWarning
            />
            <Input
              value={options.foreground}
              onChange={(e) => updateOption("foreground", e.target.value)}
              className="flex-1"
              placeholder="#000000"
              suppressHydrationWarning
            />
          </div>
        </div>

        <div>
          <Label
            htmlFor="background"
            className="text-sm font-medium"
          >
            Background Color
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="background"
              type="color"
              value={options.background}
              onChange={(e) => updateOption("background", e.target.value)}
              className="w-12 h-10 p-1 border rounded"
              suppressHydrationWarning
            />
            <Input
              value={options.background}
              onChange={(e) => updateOption("background", e.target.value)}
              className="flex-1"
              placeholder="#ffffff"
              suppressHydrationWarning
            />
          </div>
        </div>
      </div>
    </>
  );
}
