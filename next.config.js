/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enhanced performance settings for Next.js 15.5
  experimental: {
    // Enable optimized package imports for better tree shaking
    optimizePackageImports: [
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-avatar",
      "lucide-react",
      "sonner",
    ],
  },

  turbopack: {},

  // Image optimization settings
  images: {
    unoptimized: true,
    formats: ["image/webp", "image/avif"],
    domains: ["source.unsplash.com", "images.unsplash.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Bundle analyzer support
  ...(process.env.ANALYZE === "true" && {
    bundlePagesRouterDependencies: true,
  }),
};

module.exports = nextConfig;
