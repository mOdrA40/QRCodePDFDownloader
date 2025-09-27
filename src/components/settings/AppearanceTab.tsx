/**
 * Appearance Tab Component
 * Theme and appearance settings
 */

"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
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

interface AppearanceTabProps {
  theme: string | undefined;
  onThemeChange: (theme: string) => void;
  favoriteColors: string[];
}

export const AppearanceTab = memo(function AppearanceTab({
  theme,
  onThemeChange,
  favoriteColors,
}: AppearanceTabProps) {
  return (
    <Card className="shadow-lg border border-border">
      <CardHeader>
        <CardTitle>Theme & Appearance</CardTitle>
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of the application
        </p>
      </CardHeader>
      <CardContent className="space-y-4 xs:space-y-6">
        {/* Theme Selection */}
        <div className="space-y-2">
          <Label>Theme</Label>
          <Select value={theme || "system"} onValueChange={onThemeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Favorite Colors */}
        <div className="space-y-2">
          <Label>Favorite Colors</Label>
          <div className="flex gap-2">
            {favoriteColors.map((color) => (
              <div
                key={color}
                className="w-8 h-8 rounded border-2 border-border"
                style={{ backgroundColor: color }}
              />
            ))}
            <Badge variant="outline" className="text-xs">
              {favoriteColors.length} colors
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
