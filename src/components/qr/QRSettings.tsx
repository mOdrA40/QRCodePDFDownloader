/**
 * QR Settings Component
 * Advanced QR code configuration options
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Palette, Settings, Star } from "lucide-react";
import React from "react";
import { QRAppearanceSettings } from "./settings/QRAppearanceSettings";
import { QRExportSettings } from "./settings/QRExportSettings";
import { QRPresetSettings } from "./settings/QRPresetSettings";
import { QRTechnicalSettings } from "./settings/QRTechnicalSettings";

interface QRSettingsProps {
  className?: string;
}

export function QRSettings({ className }: QRSettingsProps) {
  return (
    <Card
      className={`shadow-xl bg-card/80 backdrop-blur border-border ${className}`}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          Advanced Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance" className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              Style
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              Technical
            </TabsTrigger>
            <TabsTrigger value="presets" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Presets
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <QRAppearanceSettings />
          </TabsContent>

          <TabsContent value="technical" className="space-y-4 mt-4">
            <QRTechnicalSettings />
          </TabsContent>

          <TabsContent value="presets" className="space-y-4 mt-4">
            <QRPresetSettings />
          </TabsContent>

          <TabsContent value="export" className="space-y-4 mt-4">
            <QRExportSettings />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
