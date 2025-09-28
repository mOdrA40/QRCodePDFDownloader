/**
 * Convex Client Provider with Auth0 Integration
 * Provides Convex client context with Auth0 authentication
 */

"use client";

import { Auth0Provider } from "@auth0/auth0-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import type { ReactNode } from "react";
import { AuthRecovery } from "@/components/features/auth";
import "@/utils/features/auth/auth-debug";
import "@/utils/features/auth/auth0-error-suppressor";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

interface ConvexClientProviderProps {
  children: ReactNode;
}

// Handle Auth0 redirect callback
const onRedirectCallback = (appState?: { returnTo?: string }) => {
  // Let the callback page handle navigation to avoid double redirect
  console.log("Auth0 onRedirectCallback called", { appState });
};

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN || ""}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || ""}
      authorizationParams={{
        redirect_uri:
          typeof window === "undefined" ? "" : `${window.location.origin}/auth/callback`,
        scope: "openid profile email offline_access",
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      onRedirectCallback={onRedirectCallback}
    >
      <ConvexProviderWithAuth0 client={convex}>
        <AuthRecovery>{children}</AuthRecovery>
      </ConvexProviderWithAuth0>
    </Auth0Provider>
  );
}
