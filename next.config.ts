import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export for Firebase Auth compatibility
  // output: 'export',
  // trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Minimal webpack config for client-side Firebase
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
