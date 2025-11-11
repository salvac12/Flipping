import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['img3.idealista.com', 'img4.idealista.com', 'img.fotocasa.es', 'img.pisos.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.idealista.com',
      },
      {
        protocol: 'https',
        hostname: '**.fotocasa.es',
      },
      {
        protocol: 'https',
        hostname: '**.pisos.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.serveo.net', '*.loca.lt'],
    },
  },
};

export default nextConfig;
