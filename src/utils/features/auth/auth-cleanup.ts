/**
 * Auth State Cleanup Utilities
 * Handles cleanup of Auth0 state when errors occur
 */

export function clearAuth0State() {
  if (typeof window === "undefined") return;

  try {
    // Clear Auth0 related localStorage items
    const keysToRemove = [
      "auth0.is.authenticated",
      "auth0.user",
      "auth0.idToken",
      "auth0.accessToken",
      "auth0.refreshToken",
      "auth0.expiresAt",
      "auth0.scope",
      "auth0.audience",
      "auth0.client_id",
      "auth0.nonce",
      "auth0.state",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Clear any Auth0 session storage items
    const sessionKeysToRemove = [
      "auth0.state",
      "auth0.nonce",
      "auth0.code_verifier",
      "auth0.pkce.code_verifier",
      "auth0.pkce.code_challenge",
    ];

    sessionKeysToRemove.forEach((key) => {
      sessionStorage.removeItem(key);
    });

    // Also clear any Auth0 keys that might be stored with client ID
    try {
      const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
      const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;

      if (clientId && domain) {
        const auth0Key = `@@auth0spajs@@::${clientId}::${domain}::openid profile email offline_access`;
        localStorage.removeItem(auth0Key);
        console.log("Cleared Auth0 SPA key:", auth0Key);
      }
    } catch (error) {
      console.warn("Error clearing Auth0 SPA keys:", error);
    }

    console.log("Auth0 state cleared successfully");
  } catch (error) {
    console.error("Error clearing Auth0 state:", error);
  }
}

export function isValidAuthCallback(): boolean {
  if (typeof window === "undefined") return false;

  const urlParams = new URLSearchParams(window.location.search);
  const hasCode = urlParams.has("code");
  const hasState = urlParams.has("state");
  const hasError = urlParams.has("error");

  // Get the actual values to validate them
  const code = urlParams.get("code");
  const state = urlParams.get("state");

  console.log("Validating callback parameters:", {
    hasCode,
    hasState,
    hasError,
    codeLength: code?.length || 0,
    stateLength: state?.length || 0,
    url: window.location.href,
  });

  // Valid callback should have:
  // 1. Both code and state with reasonable lengths, OR
  // 2. An error parameter
  if (hasError) {
    return true; // Error callbacks are valid
  }

  if (hasCode && hasState) {
    // Validate that code and state are not empty and have reasonable lengths
    return !!(code && code.length > 10 && state && state.length > 10);
  }

  return false;
}

export function getCallbackError(): string | null {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");
  const errorDescription = urlParams.get("error_description");

  if (error) {
    return errorDescription || error;
  }

  return null;
}

export function redirectToLogin(returnTo?: string) {
  if (typeof window === "undefined") return;

  // Clear auth state before redirecting
  clearAuth0State();

  // Build login URL with returnTo parameter
  const currentPath = returnTo || window.location.pathname;
  const loginUrl = new URL("/auth/login", window.location.origin);

  // Avoid redirect loops - don't redirect to callback or login pages
  if (
    currentPath &&
    currentPath !== "/auth/login" &&
    currentPath !== "/auth/callback" &&
    currentPath !== "/" &&
    !currentPath.includes("/auth/")
  ) {
    loginUrl.searchParams.set("returnTo", currentPath);
  }

  console.log("Redirecting to login:", loginUrl.toString());

  // Add a small delay to prevent rapid redirects
  setTimeout(() => {
    window.location.href = loginUrl.toString();
  }, 100);
}
