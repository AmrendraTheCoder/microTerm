import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Suppress warnings for optional dependencies that aren't needed in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };

    return config;
  },
};

export default nextConfig;
