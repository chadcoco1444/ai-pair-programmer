import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@skill/shared"],
  devIndicators: false,
};

export default nextConfig;
