import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // React <ViewTransition> for cinematic cross-route choreography.
    viewTransition: true,
  },
};

export default nextConfig;
