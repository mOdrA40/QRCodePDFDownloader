/**
 * Local Storage Hook
 * Provides type-safe localStorage operations with error handling
 */

import { useCallback, useEffect, useState } from "react";
import { storageService } from "@/services";
import type { AppConfig, QROptions, QRPreset } from "@/types";

type SetValue<T> = T | ((val: T) => T);

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: SetValue<T>) => void;
  remove: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for localStorage operations with type safety
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): UseLocalStorageReturn<T> {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read from localStorage on mount (client-only to prevent hydration mismatch)
  useEffect(() => {
    // Only run on client-side to prevent hydration mismatch
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        setStoredValue(parsed);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to read from localStorage",
      );
      console.error(`Error reading localStorage key "${key}":`, err);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        setError(null);

        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to localStorage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to save to localStorage",
        );
        console.error(`Error setting localStorage key "${key}":`, err);
      }
    },
    [key, storedValue],
  );

  // Remove from localStorage
  const remove = useCallback(() => {
    try {
      setError(null);
      setStoredValue(initialValue);

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove from localStorage",
      );
      console.error(`Error removing localStorage key "${key}":`, err);
    }
  }, [key, initialValue]);

  return {
    value: storedValue,
    setValue,
    remove,
    isLoading,
    error,
  };
}

/**
 * Hook for managing QR presets in localStorage
 */
export function useQRPresets() {
  const [presets, setPresets] = useState(storageService.getPresets());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savePreset = useCallback(async (name: string, options: QROptions) => {
    try {
      setIsLoading(true);
      setError(null);

      const success = storageService.savePreset({ name, options });
      if (success) {
        setPresets(storageService.getPresets());
        return true;
      }
      throw new Error("Failed to save preset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preset");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePreset = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const success = storageService.deletePreset(id);
      if (success) {
        setPresets(storageService.getPresets());
        return true;
      }
      throw new Error("Failed to delete preset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete preset");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePreset = useCallback(
    async (
      id: string,
      updates: Partial<Omit<QRPreset, "id" | "createdAt">>,
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const success = storageService.updatePreset(id, updates);
        if (success) {
          setPresets(storageService.getPresets());
          return true;
        }
        throw new Error("Failed to update preset");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update preset",
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    presets,
    savePreset,
    deletePreset,
    updatePreset,
    isLoading,
    error,
  };
}

/**
 * Hook for managing app settings
 */
export function useAppSettings() {
  const [settings, setSettings] = useState(storageService.getSettings());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSettings = useCallback(
    async (newSettings: Partial<AppConfig>) => {
      try {
        setIsLoading(true);
        setError(null);

        const success = storageService.updateSettings(newSettings);
        if (success) {
          setSettings(storageService.getSettings());
          return true;
        }
        throw new Error("Failed to update settings");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update settings",
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const resetSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const success = storageService.updateSettings({});
      if (success) {
        setSettings({});
        return true;
      }
      throw new Error("Failed to reset settings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset settings");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
    error,
  };
}
