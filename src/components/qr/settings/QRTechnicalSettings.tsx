/**
 * QR Technical Settings Component
 * Size, margin, error correction and technical options
 */

"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useQRContext } from "@/contexts";
import type { QRErrorCorrectionLevel } from "@/types";

export function QRTechnicalSettings() {
  const { state, updateOption } = useQRContext();
  const { options } = state;
  const logoBackgroundId = useId();

  const handleSizePresetClick = (size: number) => {
    updateOption("size", size);
  };

  const getSizeLabel = (size: number): string => {
    if (size <= 416) return "Small";
    if (size <= 600) return "Medium";
    if (size <= 800) return "Large";
    return "Extra Large";
  };

  return (
    <>
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Size: {options.size}px
          <span className="text-xs text-muted-foreground ml-2">
            ({getSizeLabel(options.size)})
          </span>
        </Label>
        <Slider
          value={[options.size]}
          onValueChange={(value) => updateOption("size", value[0] ?? 256)}
          max={1024}
          min={128}
          step={16}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>128px</span>
          <span>416px</span>
          <span>600px</span>
          <span>800px</span>
          <span>1024px</span>
        </div>

        {/* Quick Size Presets */}
        <div className="flex gap-2 mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSizePresetClick(256)}
            className={
              options.size === 256 ? "bg-primary text-primary-foreground" : ""
            }
          >
            Small
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSizePresetClick(512)}
            className={
              options.size === 512 ? "bg-primary text-primary-foreground" : ""
            }
          >
            Medium
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSizePresetClick(768)}
            className={
              options.size === 768 ? "bg-primary text-primary-foreground" : ""
            }
          >
            Large
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSizePresetClick(1024)}
            className={
              options.size === 1024 ? "bg-primary text-primary-foreground" : ""
            }
          >
            XL
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">
          Margin: {options.margin}
        </Label>
        <Slider
          value={[options.margin]}
          onValueChange={(value) => updateOption("margin", value[0] ?? 4)}
          max={10}
          min={0}
          step={1}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="error-correction" className="text-sm font-medium">
          Error Correction Level
        </Label>
        <Select
          value={options.errorCorrectionLevel}
          onValueChange={(value: QRErrorCorrectionLevel) =>
            updateOption("errorCorrectionLevel", value)
          }
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="L">Low (7%)</SelectItem>
            <SelectItem value="M">Medium (15%)</SelectItem>
            <SelectItem value="Q">Quartile (25%)</SelectItem>
            <SelectItem value="H">High (30%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">
          Logo Size: {options.logoSize}px
        </Label>
        <Slider
          value={[options.logoSize || 60]}
          onValueChange={(value) => updateOption("logoSize", value[0])}
          max={120}
          min={20}
          step={10}
          className="w-full"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id={logoBackgroundId}
          checked={options.logoBackground ?? false}
          onCheckedChange={(checked) => updateOption("logoBackground", checked)}
        />
        <Label htmlFor={logoBackgroundId} className="text-sm font-medium">
          White Background for Logo
        </Label>
      </div>
    </>
  );
}
