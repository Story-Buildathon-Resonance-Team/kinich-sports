import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  swcMinify: true,
  compress: true,
  optimizePackageImports: ["lucide-react", "@dynamic-labs/sdk-react-core", "gsap", "framer-motion"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@dynamic-labs/sdk-react-core"],
  },
};

export default nextConfig;
