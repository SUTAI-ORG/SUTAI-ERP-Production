import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "test.file.sutainbuyant.com",
      },
      {
        protocol: "https",
        hostname: "file.sutainbuyant.com",
      },
    ],
  },
};

export default nextConfig;
