/**
 * Settings Authentication Hook
 * Reusable hook for handling authentication state on settings page
 */

"use client";

import { useAuth0 } from "@auth0/auth0-react";

export interface SettingsAuthState {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithRedirect: () => void;
}

export function useSettingsAuth(): SettingsAuthState {
  const { user, isLoading, loginWithRedirect } = useAuth0();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginWithRedirect,
  };
}
