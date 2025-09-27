/**
 * Authentication Guard Hook
 * Reusable hook for handling authentication state across pages
 */

"use client";

import { useAuth0 } from "@auth0/auth0-react";

export interface AuthGuardState {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithRedirect: () => void;
}

export function useAuthGuard(): AuthGuardState {
  const { user, isLoading, loginWithRedirect } = useAuth0();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginWithRedirect,
  };
}
