import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  compiler: {
    removeConsole: false,
  },

  experimental: {
    esmExternals: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tmnf.exchange",
        pathname: "/trackshow/**",
      },
    ],
  },
};

export default nextConfig;