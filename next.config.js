/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',

  // Enhanced performance settings for Next.js 15.5
  experimental: {
    // Enable optimized package imports for better tree shaking
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'sonner'
    ],
  },

  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Image optimization settings
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
    ],
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
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Bundle analyzer support
  ...(process.env.ANALYZE === 'true' && {
    bundlePagesRouterDependencies: true,
  }),
};

module.exports = nextConfig;
