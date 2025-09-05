/**
 * Contexts barrel export and combined provider
 * Central export point for all context providers
 */

"use client";

import type React from "react";
import { QRProvider, useQRContext } from "./QRContext";
import { SettingsProvider, useSettingsContext, getColorThemes } from "./SettingsContext";

// Combined provider component
interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SettingsProvider>
      <QRProvider>
        {children}
      </QRProvider>
    </SettingsProvider>
  );
}

// Re-export all context hooks and utilities
export {
  // QR Context
  QRProvider,
  useQRContext,
  
  // Settings Context
  SettingsProvider,
  useSettingsContext,
  getColorThemes,
};

// Combined hook for accessing all contexts
export function useAppContext() {
  const qrContext = useQRContext();
  const settingsContext = useSettingsContext();
  
  return {
    qr: qrContext,
    settings: settingsContext,
  };
}
