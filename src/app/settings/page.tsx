/**
 * User Settings Page
 * Comprehensive settings management with modern design
 */

"use client";

import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { ArrowLeft, Settings, Palette, Database, Shield, LogIn, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";
import { useTheme } from "next-themes";

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
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your settings
          </p>
          <Button onClick={() => loginWithRedirect()}>
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="preferences" className="flex items-center gap-1 md:gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
            <span className="sm:hidden">Prefs</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-1 md:gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
            <span className="sm:hidden">Theme</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-1 md:gap-2">
            <Database className="h-4 w-4" />
            <span>Data</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-1 md:gap-2">
            <Shield className="h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
        </TabsList>

        {/* QR Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Defaults</CardTitle>
              <p className="text-sm text-muted-foreground">
                Set your default preferences for QR code generation
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default QR Size */}
              <div className="space-y-2">
                <Label>Default QR Size: {preferences.defaultQRSize}px</Label>
                <Slider
                  value={[preferences.defaultQRSize]}
                  onValueChange={(value) =>
                    setPreferences(prev => ({ ...prev, defaultQRSize: value[0] || 512 }))
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
                    setPreferences(prev => ({ ...prev, defaultErrorCorrection: value }))
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
                    setPreferences(prev => ({ ...prev, autoSaveHistory: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Appearance</CardTitle>
              <p className="text-sm text-muted-foreground">
                Customize the look and feel of the application
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
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
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your QR code history and data
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">QR History</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    View and manage your saved QR codes
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/files">View History</Link>
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Export Data</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download your QR code data
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your account details and security settings
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
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
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile">View Full Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
