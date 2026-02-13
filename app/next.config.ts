import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Disabled for Vercel/Web production
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@prisma/client', 'bcrypt'],
};

export default nextConfig;
