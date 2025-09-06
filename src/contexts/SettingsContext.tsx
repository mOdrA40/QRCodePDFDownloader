/**
 * Settings Context
 * Global state management for app settings and preferences
 */

"use client";

import { storageService } from "@/services";
import type { AppConfig, QRColorTheme, Theme, UsageStats } from "@/types";
import { useTheme } from "next-themes";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

// Action types
type SettingsAction =
  | { type: "SET_CONFIG"; payload: Partial<AppConfig> }
  | { type: "UPDATE_CONFIG"; payload: { key: keyof AppConfig; value: unknown } }
  | { type: "SET_USAGE_STATS"; payload: UsageStats }
  | { type: "SET_THEME"; payload: Theme }
  | { type: "SET_PREVIEW_MODE"; payload: boolean }
  | { type: "SET_AUTO_GENERATE"; payload: boolean }
  | { type: "RESET_SETTINGS" };

// State interface
interface SettingsState {
  config: AppConfig;
  usageStats: UsageStats;
  theme: Theme;
  previewMode: boolean;
  autoGenerate: boolean;
  isLoading: boolean;
}

// Context interface
interface SettingsContextType {
  // State
  state: SettingsState;

  // Actions
  updateConfig: <K extends keyof AppConfig>(
    key: K,
    value: AppConfig[K],
  ) => void;
  setTheme: (theme: Theme) => void;
  setPreviewMode: (enabled: boolean) => void;
  setAutoGenerate: (enabled: boolean) => void;
  resetSettings: () => void;

  // Usage stats
  refreshUsageStats: () => void;
  clearUsageStats: () => void;

  // Utilities
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

// Default configuration
const defaultConfig: AppConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ["png", "jpeg", "webp"],
  defaultQRSize: 512,
  defaultErrorCorrection: "M",
  enableAnalytics: true,
  enableLocalStorage: true,
};

// Default usage stats
const defaultUsageStats: UsageStats = {
  totalGenerated: 0,
  todayGenerated: 0,
  favoriteFormat: "png",
  averageSize: 512,
  lastUsed: "Never",
  formatUsage: {},
  sizeDistribution: {},
  dailyUsage: {},
};

// Initial state
const initialState: SettingsState = {
  config: defaultConfig,
  usageStats: defaultUsageStats,
  theme: "system",
  previewMode: true,
  autoGenerate: true,
  isLoading: false,
};

// Reducer
function settingsReducer(
  state: SettingsState,
  action: SettingsAction,
): SettingsState {
  switch (action.type) {
    case "SET_CONFIG":
      return { ...state, config: { ...state.config, ...action.payload } };

    case "UPDATE_CONFIG":
      return {
        ...state,
        config: { ...state.config, [action.payload.key]: action.payload.value },
      };

    case "SET_USAGE_STATS":
      return { ...state, usageStats: action.payload };

    case "SET_THEME":
      return { ...state, theme: action.payload };

    case "SET_PREVIEW_MODE":
      return { ...state, previewMode: action.payload };

    case "SET_AUTO_GENERATE":
      return { ...state, autoGenerate: action.payload };

    case "RESET_SETTINGS":
      return initialState;

    default:
      return state;
  }
}

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

// Provider component
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const { setTheme: setNextTheme } = useTheme();

  /**
   * Updates app configuration
   */
  const updateConfig = useCallback(
    <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
      dispatch({ type: "UPDATE_CONFIG", payload: { key, value } });

      // Save to storage
      const updatedConfig = { ...state.config, [key]: value };
      storageService.updateSettings(updatedConfig);
    },
    [state.config],
  );

  /**
   * Sets theme
   */
  const setTheme = useCallback(
    (theme: Theme) => {
      dispatch({ type: "SET_THEME", payload: theme });
      setNextTheme(theme);
      storageService.setTheme(theme);
    },
    [setNextTheme],
  );

  /**
   * Sets preview mode
   */
  const setPreviewMode = useCallback((enabled: boolean) => {
    dispatch({ type: "SET_PREVIEW_MODE", payload: enabled });
    storageService.updateSettings({ previewMode: enabled });
  }, []);

  /**
   * Sets auto-generate mode
   */
  const setAutoGenerate = useCallback((enabled: boolean) => {
    dispatch({ type: "SET_AUTO_GENERATE", payload: enabled });
    storageService.updateSettings({ autoGenerate: enabled });
  }, []);

  /**
   * Resets all settings to defaults
   */
  const resetSettings = useCallback(() => {
    dispatch({ type: "RESET_SETTINGS" });
    storageService.updateSettings(defaultConfig);
    storageService.setTheme("system");
    setNextTheme("system");
  }, [setNextTheme]);

  /**
   * Refreshes usage statistics
   */
  const refreshUsageStats = useCallback(() => {
    const stats = storageService.getUsageStats();
    dispatch({ type: "SET_USAGE_STATS", payload: stats });
  }, []);

  /**
   * Clears usage statistics
   */
  const clearUsageStats = useCallback(() => {
    storageService.updateUsageStats(defaultUsageStats);
    dispatch({ type: "SET_USAGE_STATS", payload: defaultUsageStats });
  }, []);

  /**
   * Exports settings as JSON string
   */
  const exportSettings = useCallback((): string => {
    const exportData = {
      config: state.config,
      theme: state.theme,
      previewMode: state.previewMode,
      autoGenerate: state.autoGenerate,
      presets: storageService.getPresets(),
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    };

    return JSON.stringify(exportData, null, 2);
  }, [state]);

  /**
   * Imports settings from JSON string
   */
  const importSettings = useCallback(
    (settingsJson: string): boolean => {
      try {
        const importData = JSON.parse(settingsJson);

        // Validate import data structure
        if (!importData.config || !importData.version) {
          throw new Error("Invalid settings format");
        }

        // Import configuration
        if (importData.config) {
          dispatch({ type: "SET_CONFIG", payload: importData.config });
          storageService.updateSettings(importData.config);
        }

        // Import theme
        if (importData.theme) {
          setTheme(importData.theme);
        }

        // Import other settings
        if (typeof importData.previewMode === "boolean") {
          setPreviewMode(importData.previewMode);
        }

        if (typeof importData.autoGenerate === "boolean") {
          setAutoGenerate(importData.autoGenerate);
        }

        // Import presets (if any)
        if (importData.presets && Array.isArray(importData.presets)) {
          // Note: This would require extending storage service to import presets
          // For now, we'll skip preset import
        }

        return true;
      } catch (error) {
        console.error("Failed to import settings:", error);
        return false;
      }
    },
    [setTheme, setPreviewMode, setAutoGenerate],
  );

  // Load settings from storage on mount (client-only to prevent hydration mismatch)
  useEffect(() => {
    // Only run on client-side to prevent hydration mismatch
    if (typeof window === "undefined") return;

    const loadSettings = () => {
      try {
        // Load configuration
        const savedConfig = storageService.getSettings();
        if (Object.keys(savedConfig).length > 0) {
          dispatch({ type: "SET_CONFIG", payload: savedConfig });
        }

        // Load theme
        const savedTheme = storageService.getTheme();
        if (savedTheme) {
          dispatch({ type: "SET_THEME", payload: savedTheme as Theme });
        }

        // Load usage stats
        const stats = storageService.getUsageStats();
        dispatch({ type: "SET_USAGE_STATS", payload: stats });

        // Load other preferences
        if (savedConfig.previewMode !== undefined) {
          dispatch({
            type: "SET_PREVIEW_MODE",
            payload: savedConfig.previewMode,
          });
        }

        if (savedConfig.autoGenerate !== undefined) {
          dispatch({
            type: "SET_AUTO_GENERATE",
            payload: savedConfig.autoGenerate,
          });
        }
      } catch (error) {
        console.warn("Failed to load settings from storage:", error);
        // Continue with default values if storage fails
      }
    };

    // Use setTimeout to ensure this runs after hydration
    const timeoutId = setTimeout(loadSettings, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  // Predefined color themes
  const colorThemes: QRColorTheme[] = [
    { name: "Classic", foreground: "#000000", background: "#ffffff" },
    { name: "Ocean", foreground: "#0EA5E9", background: "#F0F9FF" },
    { name: "Forest", foreground: "#059669", background: "#ECFDF5" },
    { name: "Sunset", foreground: "#DC2626", background: "#FEF2F2" },
    { name: "Purple", foreground: "#7C3AED", background: "#F3E8FF" },
    { name: "Golden", foreground: "#D97706", background: "#FFFBEB" },
  ];

  const contextValue: SettingsContextType = {
    state,
    updateConfig,
    setTheme,
    setPreviewMode,
    setAutoGenerate,
    resetSettings,
    refreshUsageStats,
    clearUsageStats,
    exportSettings,
    importSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook to use settings context
export function useSettingsContext(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error(
      "useSettingsContext must be used within a SettingsProvider",
    );
  }
  return context;
}

// Export color themes for use in components
export const getColorThemes = (): QRColorTheme[] => [
  { name: "Classic", foreground: "#000000", background: "#ffffff" },
  { name: "Ocean", foreground: "#0EA5E9", background: "#F0F9FF" },
  { name: "Forest", foreground: "#059669", background: "#ECFDF5" },
  { name: "Sunset", foreground: "#DC2626", background: "#FEF2F2" },
  { name: "Purple", foreground: "#7C3AED", background: "#F3E8FF" },
  { name: "Golden", foreground: "#D97706", background: "#FFFBEB" },
];
