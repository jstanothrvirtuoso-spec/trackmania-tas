
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
      {
        protocol: "https",
        hostname: "tmuf.exchange",
        pathname: "/trackshow/**",
      },
      {
        protocol: "https",
        hostname: "tm.mania.exchange",
        pathname: "/mapshow/**",
      },
      {
        protocol: "https",
        hostname: "nations.tm-exchange.com",
        pathname: "/trackshow/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none';",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
