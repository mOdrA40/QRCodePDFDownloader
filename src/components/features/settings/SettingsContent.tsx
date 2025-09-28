/**
 * Settings Content Component
 * Wrapper component for all settings tabs and action buttons
 */

"use client";

import { RotateCcw, Save } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AboutTab } from "./AboutTab";
import { AppearanceTab } from "./AppearanceTab";
import { DataTab } from "./DataTab";
import { PreferencesTab } from "./PreferencesTab";
import { SettingsTabs } from "./SettingsTabs";

interface SettingsContentProps {
  user: {
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  };
  preferences: {
    defaultQRSize: number;
    defaultErrorCorrection: string;
    favoriteColors: string[];
    autoSaveHistory: boolean;
  };
  theme: string | undefined;
  isSaving: boolean;
  onPreferencesChange: (preferences: any) => void;
  onThemeChange: (theme: string) => void;
  onSave: () => void;
  onReset: () => void;
}

export const SettingsContent = memo(function SettingsContent({
  user,
  preferences,
  theme,
  isSaving,
  onPreferencesChange,
  onThemeChange,
  onSave,
  onReset,
}: SettingsContentProps) {
  return (
    <>
      {/* Settings Tabs */}
      <Tabs defaultValue="preferences" className="space-y-4 xs:space-y-6">
        <SettingsTabs />

        {/* QR Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4 xs:space-y-6">
          <PreferencesTab preferences={preferences} onPreferencesChange={onPreferencesChange} />
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4 xs:space-y-6">
          <AppearanceTab
            theme={theme}
            onThemeChange={onThemeChange}
            favoriteColors={preferences.favoriteColors}
          />
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-4 xs:space-y-6">
          <DataTab />
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4 xs:space-y-6">
          <AboutTab user={user} />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 w-full pt-6 sm:flex-row sm:justify-between sm:items-center">
        <Button variant="outline" onClick={onReset} className="w-full sm:w-auto justify-center">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>

        <Button onClick={onSave} disabled={isSaving} className="w-full sm:w-auto justify-center">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </>
  );
});
