/**
 * Preferences Tab Component
 * QR code default preferences settings
 */

"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface PreferencesTabProps {
  preferences: {
    defaultQRSize: number;
    defaultErrorCorrection: string;
    autoSaveHistory: boolean;
  };
  onPreferencesChange: (preferences: any) => void;
}

export const PreferencesTab = memo(function PreferencesTab({
  preferences,
  onPreferencesChange,
}: PreferencesTabProps) {
  const updatePreference = (key: string, value: any) => {
    onPreferencesChange({ ...preferences, [key]: value });
  };

  return (
    <Card className="shadow-lg border border-border">
      <CardHeader>
        <CardTitle>QR Code Defaults</CardTitle>
        <p className="text-sm text-muted-foreground">
          Set your default preferences for QR code generation
        </p>
      </CardHeader>
      <CardContent className="space-y-4 xs:space-y-6">
        {/* Default QR Size */}
        <div className="space-y-2">
          <Label>Default QR Size: {preferences.defaultQRSize}px</Label>
          <Slider
            value={[preferences.defaultQRSize]}
            onValueChange={(value) => updatePreference("defaultQRSize", value[0] || 512)}
            max={1024}
            min={128}
            step={64}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>128px</span>
            <span>1024px</span>
          </div>
        </div>

        <Separator />

        {/* Error Correction Level */}
        <div className="space-y-2">
          <Label>Default Error Correction Level</Label>
          <Select
            value={preferences.defaultErrorCorrection}
            onValueChange={(value) => updatePreference("defaultErrorCorrection", value)}
          >
            <SelectTrigger>
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

        <Separator />

        {/* Auto Save History */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Auto-save QR History</Label>
            <p className="text-sm text-muted-foreground">
              Automatically save generated QR codes to your history
            </p>
          </div>
          <Switch
            checked={preferences.autoSaveHistory}
            onCheckedChange={(checked) => updatePreference("autoSaveHistory", checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
});
