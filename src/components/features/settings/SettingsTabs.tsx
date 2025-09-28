/**
 * Settings Tabs Component
 * Navigation tabs for settings page with responsive design
 */

"use client";

import { Database, Palette, Settings, Shield } from "lucide-react";
import { memo } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export const SettingsTabs = memo(function SettingsTabs() {
  return (
    <TabsList className="grid grid-cols-2 gap-1 w-full bg-muted rounded-lg p-1 h-auto justify-stretch sm:grid-cols-4">
      <TabsTrigger
        value="preferences"
        className="flex items-center justify-center gap-1 xs:gap-2 px-2 xs:px-3 py-2 xs:py-3 text-xs xs:text-sm font-medium rounded-md transition-all duration-200 min-h-9 xs:min-h-10 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:text-foreground hover:data-[state=inactive]:bg-muted/50"
      >
        <Settings className="h-3 w-3 xs:h-4 xs:w-4" />
        <span className="hidden xs:inline">Preferences</span>
        <span className="xs:hidden">Prefs</span>
      </TabsTrigger>
      <TabsTrigger
        value="appearance"
        className="flex items-center justify-center gap-1 xs:gap-2 px-2 xs:px-3 py-2 xs:py-3 text-xs xs:text-sm font-medium rounded-md transition-all duration-200 min-h-9 xs:min-h-10 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:text-foreground hover:data-[state=inactive]:bg-muted/50"
      >
        <Palette className="h-3 w-3 xs:h-4 xs:w-4" />
        <span className="hidden xs:inline">Appearance</span>
        <span className="xs:hidden">Theme</span>
      </TabsTrigger>
      <TabsTrigger
        value="data"
        className="flex items-center justify-center gap-1 xs:gap-2 px-2 xs:px-3 py-2 xs:py-3 text-xs xs:text-sm font-medium rounded-md transition-all duration-200 min-h-9 xs:min-h-10 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:text-foreground hover:data-[state=inactive]:bg-muted/50"
      >
        <Database className="h-3 w-3 xs:h-4 xs:w-4" />
        <span>Data</span>
      </TabsTrigger>
      <TabsTrigger
        value="account"
        className="flex items-center justify-center gap-1 xs:gap-2 px-2 xs:px-3 py-2 xs:py-3 text-xs xs:text-sm font-medium rounded-md transition-all duration-200 min-h-9 xs:min-h-10 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:text-foreground hover:data-[state=inactive]:bg-muted/50"
      >
        <Shield className="h-3 w-3 xs:h-4 xs:w-4" />
        <span>Account</span>
      </TabsTrigger>
    </TabsList>
  );
});
