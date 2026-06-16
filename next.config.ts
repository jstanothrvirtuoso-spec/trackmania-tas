import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  
  compiler: {
    removeConsole: false
  },

  experimental: {
    esmExternals: true
  }
};

export default nextConfig;
