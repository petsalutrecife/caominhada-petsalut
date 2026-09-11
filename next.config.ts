import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Prevents resizing issues during local development and builds
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'caominhada-petsalut.vercel.app',
          },
        ],
        destination: 'https://caominhadapetsalute.com.br/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
