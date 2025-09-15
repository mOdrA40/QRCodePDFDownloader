/**
 * Auth0 Client Configuration
 * Server-side Auth0 client for Next.js integration
 */

import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Initialize the Auth0 client with proper configuration
export const auth0 = new Auth0Client({
  // Options are loaded from environment variables by default
  // Ensure necessary environment variables are properly set
  
  authorizationParameters: {
    // In v4, AUTH0_SCOPE and AUTH0_AUDIENCE environment variables
    // are no longer automatically picked up by the SDK.
    // Instead, we need to provide the values explicitly.
    scope: process.env.AUTH0_SCOPE || "openid profile email",
    audience: process.env.AUTH0_AUDIENCE || null,
  }
});
