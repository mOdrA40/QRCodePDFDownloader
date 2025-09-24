/**
 * User Settings Page
 * Comprehensive settings management with modern design
 */

"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Database,
  LogIn,
  Palette,
  RotateCcw,
  Save,
  Settings,
  Shield,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const { user, isLoading, loginWithRedirect } = useAuth0();
  const { theme, setTheme } = useTheme();

  // Convex queries and mutations
  const userPreferences = useQuery(api.userPreferences.getUserPreferences);
  const updatePreferences = useMutation(api.userPreferences.updateUserPreferences);
  const resetPreferences = useMutation(api.userPreferences.resetUserPreferences);

  // Local state for form
  const [preferences, setPreferences] = useState({
    defaultQRSize: 512,
    defaultErrorCorrection: "M",
    favoriteColors: ["#000000", "#ffffff"],
    autoSaveHistory: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Update local state when data loads
  React.useEffect(() => {
    if (userPreferences) {
      setPreferences(userPreferences.preferences);
    }
  }, [userPreferences]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden ${styles.forceContain}`}
      >
        <div
          className={`container mx-auto py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6 ${styles.settingsContainer}`}
        >
          <div className="text-center py-8 xs:py-12">
            <Settings className="h-12 xs:h-16 w-12 xs:w-16 mx-auto mb-3 xs:mb-4 text-muted-foreground" />
            <h1 className="text-lg xs:text-xl sm:text-2xl font-bold mb-2">Sign In Required</h1>
            <p className="text-sm xs:text-base text-muted-foreground mb-4 xs:mb-6 px-2">
              Please sign in to access your settings
            </p>
            <Button onClick={() => loginWithRedirect()} className="w-full xs:w-auto">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updatePreferences({ preferences });
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetPreferences();
      toast.success("Settings reset to defaults");
      // Refresh the data
      window.location.reload();
    } catch (error) {
      toast.error("Failed to reset settings");
      console.error("Reset error:", error);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden ${styles.forceContain}`}
    >
      <div
        className={`container mx-auto py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6 max-w-4xl ${styles.settingsContainer}`}
      >
        {/* Header */}
        <div className={`mb-6 xs:mb-8 ${styles.headerContainer}`}>
          <div className={styles.headerContent}>
            <div className={styles.headerTop}>
              <Button variant="ghost" size="sm" asChild={true} className="shrink-0 h-8 px-2">
                <Link href="/" className="flex items-center gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span className="text-sm hidden xs:inline">Back to Generator</span>
                  <span className="text-sm xs:hidden">Back</span>
                </Link>
              </Button>
              <div className="hidden sm:block h-4 w-px bg-border" />
              <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-1">
                <div className="p-1.5 xs:p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg shrink-0">
                  <Settings className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className={`min-w-0 flex-1 ${styles.headerMain}`}>
                  <h1 className={`${styles.headerTitle} ${styles.safeText}`}>Settings</h1>
                  <p className={`${styles.headerSubtitle} ${styles.safeText}`}>
                    Manage your account and application preferences
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="preferences" className="space-y-4 xs:space-y-6">
          <TabsList className={styles.segmentedControl}>
            <TabsTrigger value="preferences" className={styles.segmentedControlItem}>
              <Settings className="h-3 w-3 xs:h-4 xs:w-4" />
              <span className="hidden xs:inline">Preferences</span>
              <span className="xs:hidden">Prefs</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className={styles.segmentedControlItem}>
              <Palette className="h-3 w-3 xs:h-4 xs:w-4" />
              <span className="hidden xs:inline">Appearance</span>
              <span className="xs:hidden">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="data" className={styles.segmentedControlItem}>
              <Database className="h-3 w-3 xs:h-4 xs:w-4" />
              <span>Data</span>
            </TabsTrigger>
            <TabsTrigger value="account" className={styles.segmentedControlItem}>
              <Shield className="h-3 w-3 xs:h-4 xs:w-4" />
              <span>Account</span>
            </TabsTrigger>
          </TabsList>

          {/* QR Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4 xs:space-y-6">
            <Card className={styles.settingsCard}>
              <CardHeader>
                <CardTitle>QR Code Defaults</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set your default preferences for QR code generation
                </p>
              </CardHeader>
              <CardContent className={`space-y-4 xs:space-y-6 ${styles.cardContent}`}>
                {/* Default QR Size */}
                <div className="space-y-2">
                  <Label>Default QR Size: {preferences.defaultQRSize}px</Label>
                  <Slider
                    value={[preferences.defaultQRSize]}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({ ...prev, defaultQRSize: value[0] || 512 }))
                    }
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
                    onValueChange={(value) =>
                      setPreferences((prev) => ({ ...prev, defaultErrorCorrection: value }))
                    }
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
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({ ...prev, autoSaveHistory: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4 xs:space-y-6">
            <Card className={styles.settingsCard}>
              <CardHeader>
                <CardTitle>Theme & Appearance</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Customize the look and feel of the application
                </p>
              </CardHeader>
              <CardContent className={`space-y-4 xs:space-y-6 ${styles.cardContent}`}>
                {/* Theme Selection */}
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={theme || "system"} onValueChange={setTheme}>
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
                    {preferences.favoriteColors.map((color) => (
                      <div
                        key={color}
                        className="w-8 h-8 rounded border-2 border-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <Badge variant="outline" className="text-xs">
                      {preferences.favoriteColors.length} colors
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4 xs:space-y-6">
            <Card className={styles.settingsCard}>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your QR code history and data
                </p>
              </CardHeader>
              <CardContent className={`space-y-4 xs:space-y-6 ${styles.cardContent}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">QR History</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      View and manage your saved QR codes
                    </p>
                    <Button variant="outline" size="sm" asChild={true}>
                      <Link href="/files">View History</Link>
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Export Data</h3>
                    <p className="text-sm text-muted-foreground mb-3">Download your QR code data</p>
                    <Button variant="outline" size="sm" disabled={true}>
                      Coming Soon
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4 xs:space-y-6">
            <Card className={styles.settingsCard}>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your account details and security settings
                </p>
              </CardHeader>
              <CardContent className={`space-y-4 xs:space-y-6 ${styles.cardContent}`}>
                <div className="flex items-center gap-4">
                  {user.picture ? (
                    <Image
                      src={user.picture}
                      alt={user.name || "User"}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-medium text-xl">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <Badge variant="secondary" className="mt-1">
                      Verified Account
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Button variant="outline" size="sm" asChild={true}>
                    <Link href="/profile">View Full Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <Button variant="outline" onClick={handleReset} className={styles.resetButton}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>

          <Button onClick={handleSave} disabled={isSaving} className={styles.saveButton}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
