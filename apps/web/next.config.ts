import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // output: 'standalone', // Enable in Docker builds only (Windows symlink issue)
  reactStrictMode: true,
  // Enable experimental features
  experimental: {
    // optimizePackageImports: ['@ainu/ui'],
  },
};

export default nextConfig;
