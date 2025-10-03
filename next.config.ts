import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static export for development to support dynamic routes
  // output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
