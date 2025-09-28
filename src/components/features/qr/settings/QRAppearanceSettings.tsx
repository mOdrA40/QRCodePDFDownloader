/**
 * QR Appearance Settings Component
 * Color and visual customization options
 */

"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getColorThemes, useQRContext } from "@/contexts";

export function QRAppearanceSettings() {
  const { state, updateOption } = useQRContext();
  const { options } = state;
  const presetColors = getColorThemes();
  const foregroundId = useId();
  const backgroundId = useId();

  const handleColorPresetClick = (foreground: string, background: string) => {
    updateOption("foreground", foreground);
    updateOption("background", background);
  };

  return (
    <>
      <div>
        <Label className="text-sm font-medium mb-3 block">Color Presets</Label>
        <div className="grid grid-cols-3 gap-2">
          {presetColors.map((preset) => (
            <Tooltip key={preset.name}>
              <TooltipTrigger asChild={true}>
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
          <Label htmlFor={foregroundId} className="text-sm font-medium">
            Foreground Color
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id={foregroundId}
              type="color"
              value={options.foreground}
              onChange={(e) => updateOption("foreground", e.target.value)}
              className="w-12 h-10 p-1 border rounded"
              suppressHydrationWarning={true}
            />
            <Input
              value={options.foreground}
              onChange={(e) => updateOption("foreground", e.target.value)}
              className="flex-1"
              placeholder="#000000"
              suppressHydrationWarning={true}
            />
          </div>
        </div>

        <div>
          <Label htmlFor={backgroundId} className="text-sm font-medium">
            Background Color
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id={backgroundId}
              type="color"
              value={options.background}
              onChange={(e) => updateOption("background", e.target.value)}
              className="w-12 h-10 p-1 border rounded"
              suppressHydrationWarning={true}
            />
            <Input
              value={options.background}
              onChange={(e) => updateOption("background", e.target.value)}
              className="flex-1"
              placeholder="#ffffff"
              suppressHydrationWarning={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}
