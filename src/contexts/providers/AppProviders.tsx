/**
 * App Providers Component
 * Combined provider component that wraps the entire application
 */

"use client";

import type React from "react";
import { QRProvider, useQRContext } from "../features/qr";
import { SettingsProvider, useSettingsContext } from "../global";

// Combined provider component
interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SettingsProvider>
      <QRProvider>{children}</QRProvider>
    </SettingsProvider>
  );
}

// Combined hook for accessing all contexts
export function useAppContext() {
  const qrContext = useQRContext();
  const settingsContext = useSettingsContext();

  return {
    qr: qrContext,
    settings: settingsContext,
  };
}
