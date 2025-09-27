/**
 * Files Authentication Hook
 * Reusable hook for handling authentication state on files page
 */

"use client";

import { useAuth0 } from "@auth0/auth0-react";

export interface FilesAuthState {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithRedirect: () => void;
}

export function useFilesAuth(): FilesAuthState {
  const { user, isLoading, loginWithRedirect } = useAuth0();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginWithRedirect,
  };
}
