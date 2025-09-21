/**
 * Auth Debug Utilities
 * Helper functions for debugging authentication issues
 */

export function clearAuthCache() {
  if (typeof window === "undefined") return;

  try {
    console.log("Clearing Auth0 cache...");
    
    // Clear Auth0 cache from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('@@auth0spajs@@') ||
        key.startsWith('auth0.') ||
        key.includes('auth0')
      )) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      console.log("Removing localStorage key:", key);
      localStorage.removeItem(key);
    });

    // Clear sessionStorage as well
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (
        key.startsWith('@@auth0spajs@@') ||
        key.startsWith('auth0.') ||
        key.includes('auth0')
      )) {
        sessionKeysToRemove.push(key);
      }
    }

    sessionKeysToRemove.forEach(key => {
      console.log("Removing sessionStorage key:", key);
      sessionStorage.removeItem(key);
    });

    console.log("Auth cache cleared successfully");
    return true;
  } catch (error) {
    console.error("Error clearing auth cache:", error);
    return false;
  }
}

export function debugAuthState() {
  if (typeof window === "undefined") return;

  console.log("=== AUTH DEBUG INFO ===");
  console.log("Current URL:", window.location.href);
  console.log("Pathname:", window.location.pathname);
  console.log("Search params:", window.location.search);
  
  // Check localStorage for Auth0 data
  const authKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.includes('auth0')) {
      authKeys.push(key);
    }
  }
  
  console.log("Auth0 localStorage keys:", authKeys);
  
  // Check for specific Auth0 keys
  const auth0Key = `@@auth0spajs@@::${process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}::${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}::openid profile email offline_access`;
  const auth0Data = localStorage.getItem(auth0Key);
  
  if (auth0Data) {
    try {
      const parsed = JSON.parse(auth0Data);
      console.log("Auth0 data found:", {
        hasAccessToken: !!parsed.body?.access_token,
        hasIdToken: !!parsed.body?.id_token,
        expiresAt: parsed.body?.expires_in,
        scope: parsed.body?.scope
      });
    } catch (e) {
      console.log("Auth0 data (raw):", auth0Data);
    }
  } else {
    console.log("No Auth0 data found in localStorage");
  }
  
  console.log("=== END AUTH DEBUG ===");
}

// Auto-debug in development
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== "undefined") {
    // Make functions available globally for debugging
    (window as unknown as { clearAuthCache: typeof clearAuthCache }).clearAuthCache = clearAuthCache;
    (window as unknown as { debugAuthState: typeof debugAuthState }).debugAuthState = debugAuthState;
  }
}
