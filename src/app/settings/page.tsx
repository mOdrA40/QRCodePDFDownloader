/**
 * User Settings Page
 * Comprehensive settings management with modern design
 */

"use client";

import { useTheme } from "next-themes";
import { SettingsAuthRequired, SettingsContent, SettingsHeader } from "@/components/settings";
import { useSettingsAuth, useUserPreferences } from "@/hooks/settings";

export default function SettingsPage() {
  const { user, isLoading, isAuthenticated, loginWithRedirect } = useSettingsAuth();
  const { theme, setTheme } = useTheme();
  const {
    preferences,
    isLoading: preferencesLoading,
    isSaving,
    updatePreferences,
    savePreferences,
    resetPreferences,
  } = useUserPreferences();

  // Loading state
  if (isLoading || preferencesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden max-w-full">
        <div className="w-full max-w-[calc(100vw-1.5rem)] mx-auto py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6">
          <div className="animate-pulse">
            <div className="h-6 xs:h-8 bg-muted rounded w-32 xs:w-48 mb-4 xs:mb-6" />
            <div className="h-24 xs:h-32 bg-muted rounded mb-4 xs:mb-6" />
            <div className="space-y-3 xs:space-y-4">
              <div className="h-16 xs:h-20 bg-muted rounded" />
              <div className="h-16 xs:h-20 bg-muted rounded" />
              <div className="h-16 xs:h-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <SettingsAuthRequired onLogin={loginWithRedirect} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden max-w-full">
      <div className="w-full max-w-[calc(100vw-1.5rem)] mx-auto py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6 max-w-4xl overflow-x-hidden">
        <SettingsHeader />
        <SettingsContent
          user={user}
          preferences={preferences}
          theme={theme}
          isSaving={isSaving}
          onPreferencesChange={updatePreferences}
          onThemeChange={setTheme}
          onSave={savePreferences}
          onReset={resetPreferences}
        />
      </div>
    </div>
  );
}
