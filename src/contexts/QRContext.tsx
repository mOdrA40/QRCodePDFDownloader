/**
 * QR Context
 * Global state management for QR code generation and options
 */

"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useMutation } from "convex/react";
import type React from "react";
import { createContext, useCallback, useContext, useReducer } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { qrService, storageService } from "@/services";
import type {
  ComponentState,
  QRGenerationResult,
  QROptions,
  QRPreset,
  QRValidationResult,
} from "@/types";

// Action types
type QRAction =
  | { type: "SET_OPTIONS"; payload: QROptions }
  | { type: "UPDATE_OPTION"; payload: { key: keyof QROptions; value: unknown } }
  | { type: "SET_QR_DATA"; payload: string }
  | { type: "SET_GENERATING"; payload: boolean }
  | { type: "SET_PROGRESS"; payload: number }
  | { type: "SET_STATE"; payload: ComponentState }
  | { type: "SET_VALIDATION"; payload: QRValidationResult | null }
  | { type: "RESET" };

// State interface
interface QRState {
  options: QROptions;
  qrDataUrl: string;
  isGenerating: boolean;
  progress: number;
  state: ComponentState;
  validation: QRValidationResult | null;
}

// Context interface
interface QRContextType {
  // State
  state: QRState;

  // Actions
  setOptions: (options: QROptions) => void;
  updateOption: <K extends keyof QROptions>(key: K, value: QROptions[K]) => void;
  generateAndSaveQR: () => Promise<void>;
  validateInput: (text: string) => QRValidationResult;
  resetQR: () => void;

  // Presets
  savePreset: (name: string) => Promise<boolean>;
  loadPreset: (preset: QRPreset) => void;
  deletePreset: (id: string) => Promise<boolean>;
  getPresets: () => QRPreset[];
}

// Default QR options
const defaultOptions: QROptions = {
  text: "",
  size: 512,
  margin: 4,
  errorCorrectionLevel: "M",
  foreground: "#000000",
  background: "#ffffff",
  format: "png",
  logoUrl: "",
  logoSize: 60,
  logoBackground: false,
  pdfPassword: "",
  enablePdfPassword: false,
};

// Initial state
const initialState: QRState = {
  options: defaultOptions,
  qrDataUrl: "",
  isGenerating: false,
  progress: 0,
  state: "idle",
  validation: null,
};

// Reducer
function qrReducer(state: QRState, action: QRAction): QRState {
  switch (action.type) {
    case "SET_OPTIONS":
      return { ...state, options: action.payload };

    case "UPDATE_OPTION":
      return {
        ...state,
        options: {
          ...state.options,
          [action.payload.key]: action.payload.value,
        },
      };

    case "SET_QR_DATA":
      return { ...state, qrDataUrl: action.payload };

    case "SET_GENERATING":
      return { ...state, isGenerating: action.payload };

    case "SET_PROGRESS":
      return { ...state, progress: action.payload };

    case "SET_STATE":
      return { ...state, state: action.payload };

    case "SET_VALIDATION":
      return { ...state, validation: action.payload };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// Create context
const QRContext = createContext<QRContextType | undefined>(undefined);

// Provider component
export function QRProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(qrReducer, initialState);
  const { user } = useAuth0();
  const saveToHistory = useMutation(api.qrHistory.saveQRToHistory);

  /**
   * Async function to save QR to history without blocking UI
   */
  const saveToHistoryAsync = useCallback(
    async (options: QROptions, result: QRGenerationResult): Promise<void> => {
      if (!user) return;

      const historyData: any = {
        textContent: options.text,
        qrSettings: {
          size: options.size,
          margin: options.margin,
          errorCorrectionLevel: options.errorCorrectionLevel,
          foreground: options.foreground,
          background: options.background,
          format: options.format,
          logoUrl: options.logoUrl || "",
          logoSize: options.logoSize || 60,
          logoBackground: options.logoBackground,
        },
      };

      if (result.method) {
        historyData.generationMethod = result.method;
      }

      if (result.browserInfo) {
        historyData.browserInfo = result.browserInfo;
      }

      try {
        const saveResult = await saveToHistory(historyData);

        // Handle duplicate QR response
        if (saveResult && !saveResult.success && saveResult.isDuplicate) {
          toast.info("QR code already exists in your history", {
            description: "This QR code content has been generated before.",
            duration: 4000,
          });
        }
      } catch (error) {
        console.warn("Failed to save to history:", error);
      }
    },
    [user, saveToHistory]
  );

  /**
   * Sets QR options
   */
  const setOptions = useCallback((options: QROptions) => {
    dispatch({ type: "SET_OPTIONS", payload: options });
  }, []);

  /**
   * Updates a specific QR option
   */
  const updateOption = useCallback(<K extends keyof QROptions>(key: K, value: QROptions[K]) => {
    dispatch({ type: "UPDATE_OPTION", payload: { key, value } });
  }, []);

  /**
   * Validates QR input
   */
  const validateInput = useCallback(
    (text: string): QRValidationResult => {
      const result = qrService.validateQRInput(text, state.options);
      dispatch({ type: "SET_VALIDATION", payload: result });
      return result;
    },
    [state.options]
  );

  /**
   * Generates QR code and saves to database (explicit user action)
   */
  const generateAndSaveQR = useCallback(async (): Promise<void> => {
    if (!state.options.text.trim()) {
      toast.error("Please enter text to generate QR code");
      return;
    }

    // Validate input
    const validation = validateInput(state.options.text);
    if (!validation.isValid) {
      toast.error(`Validation failed: ${validation.errors.join(", ")}`);
      return;
    }

    dispatch({ type: "SET_GENERATING", payload: true });
    dispatch({ type: "SET_STATE", payload: "loading" });
    dispatch({ type: "SET_PROGRESS", payload: 0 });

    try {
      // Progress simulation
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + 10, 90);
        dispatch({ type: "SET_PROGRESS", payload: currentProgress });
      }, 100);

      // Generate QR code
      const result: QRGenerationResult = await qrService.generateQRCode(state.options.text, {
        size: state.options.size,
        margin: state.options.margin,
        errorCorrectionLevel: state.options.errorCorrectionLevel,
        format: state.options.format,
        color: {
          dark: state.options.foreground,
          light: state.options.background,
        },
      });

      clearInterval(progressInterval);
      dispatch({ type: "SET_PROGRESS", payload: 100 });
      dispatch({ type: "SET_QR_DATA", payload: result.dataUrl });
      dispatch({ type: "SET_STATE", payload: "success" });

      // Save to history if user is authenticated (async, non-blocking)
      if (user) {
        // Don't await this to avoid blocking UI - run in background
        saveToHistoryAsync(state.options, result).catch((error) => {
          console.warn("Failed to save QR to history:", error);
        });
      }

      // Show success message immediately
      toast.success("QR code generated successfully!");
    } catch (error) {
      dispatch({ type: "SET_STATE", payload: "error" });
      const errorMessage = error instanceof Error ? error.message : "Failed to generate QR code";
      toast.error(errorMessage);
      dispatch({ type: "SET_QR_DATA", payload: "" });
    } finally {
      dispatch({ type: "SET_GENERATING", payload: false });
      setTimeout(() => {
        dispatch({ type: "SET_PROGRESS", payload: 0 });
        dispatch({ type: "SET_STATE", payload: "idle" });
      }, 1000);
    }
  }, [state.options, validateInput, user, saveToHistoryAsync]);

  /**
   * Resets QR state
   */
  const resetQR = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  /**
   * Saves current options as preset
   */
  const savePreset = useCallback(
    (name: string): Promise<boolean> => {
      if (!name.trim()) {
        toast.error("Please enter a preset name");
        return Promise.resolve(false);
      }

      try {
        const success = storageService.savePreset({
          name: name.trim(),
          options: state.options,
        });

        if (success) {
          toast.success(`Preset "${name}" saved successfully!`);
          return Promise.resolve(true);
        }
        toast.error("Failed to save preset");
        return Promise.resolve(false);
      } catch (_error) {
        toast.error("Failed to save preset");
        return Promise.resolve(false);
      }
    },
    [state.options]
  );

  /**
   * Loads a preset
   */
  const loadPreset = useCallback(
    (preset: QRPreset) => {
      setOptions(preset.options);
      toast.success(`Preset "${preset.name}" loaded successfully!`);
    },
    [setOptions]
  );

  /**
   * Deletes a preset
   */
  const deletePreset = useCallback((id: string): Promise<boolean> => {
    try {
      const success = storageService.deletePreset(id);
      if (success) {
        toast.success("Preset deleted successfully!");
        return Promise.resolve(true);
      }
      toast.error("Failed to delete preset");
      return Promise.resolve(false);
    } catch (_error) {
      toast.error("Failed to delete preset");
      return Promise.resolve(false);
    }
  }, []);

  /**
   * Gets all presets
   */
  const getPresets = useCallback((): QRPreset[] => {
    return storageService.getPresets();
  }, []);

  const contextValue: QRContextType = {
    state,
    setOptions,
    updateOption,
    generateAndSaveQR,
    validateInput,
    resetQR,
    savePreset,
    loadPreset,
    deletePreset,
    getPresets,
  };

  return <QRContext.Provider value={contextValue}>{children}</QRContext.Provider>;
}

// Hook to use QR context
export function useQRContext(): QRContextType {
  const context = useContext(QRContext);
  if (context === undefined) {
    throw new Error("useQRContext must be used within a QRProvider");
  }
  return context;
}
