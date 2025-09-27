/**
 * User Preferences Hook
 * Reusable hook for managing user preferences with Convex
 */

"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";

export interface UserPreferencesState {
  preferences: {
    defaultQRSize: number;
    defaultErrorCorrection: string;
    favoriteColors: string[];
    autoSaveHistory: boolean;
  };
  isLoading: boolean;
  isSaving: boolean;
  updatePreferences: (newPreferences: any) => void;
  savePreferences: () => Promise<void>;
  resetPreferences: () => Promise<void>;
}

export function useUserPreferences(): UserPreferencesState {
  // Convex queries and mutations
  const userPreferences = useQuery(api.userPreferences.getUserPreferences);
  const updatePreferencesMutation = useMutation(api.userPreferences.updateUserPreferences);
  const resetPreferencesMutation = useMutation(api.userPreferences.resetUserPreferences);

  // Local state for form
  const [preferences, setPreferences] = useState({
    defaultQRSize: 512,
    defaultErrorCorrection: "M",
    favoriteColors: ["#000000", "#ffffff"],
    autoSaveHistory: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Update local state when data loads
  useEffect(() => {
    if (userPreferences) {
      setPreferences(userPreferences.preferences);
    }
  }, [userPreferences]);

  const updatePreferences = useCallback((newPreferences: any) => {
    setPreferences(newPreferences);
  }, []);

  const savePreferences = useCallback(async () => {
    try {
      setIsSaving(true);
      await updatePreferencesMutation({ preferences });
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [preferences, updatePreferencesMutation]);

  const resetPreferences = useCallback(async () => {
    try {
      setIsSaving(true);
      await resetPreferencesMutation();
      toast.success("Settings reset to defaults!");
    } catch (error) {
      console.error("Failed to reset preferences:", error);
      toast.error("Failed to reset settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [resetPreferencesMutation]);

  return {
    preferences,
    isLoading: userPreferences === undefined,
    isSaving,
    updatePreferences,
    savePreferences,
    resetPreferences,
  };
}
