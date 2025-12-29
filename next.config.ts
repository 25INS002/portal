import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://72.60.102.111:8000/api/:path*",
      },
    ];
  },

  // Uncomment ONLY if you know you need it (usually not required)
  // experimental: {
  //   allowedDevOrigins: [
  //     "http://localhost:4000",
  //     "http://72.60.102.111:4000",
  //   ],
  // },
};

export default nextConfig;
