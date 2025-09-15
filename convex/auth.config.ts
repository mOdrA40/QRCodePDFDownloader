/**
 * Convex Auth Configuration
 * Configures Auth0 as the authentication provider for Convex
 */

export default {
  providers: [
    {
      domain: process.env.AUTH0_DOMAIN,
      applicationID: process.env.AUTH0_CLIENT_ID,
    },
  ],
};
