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
  webpack: (config, { isServer }) => {
    // Fix for puppeteer-extra and clone-deep in API routes
    if (isServer) {
      config.externals = [...(config.externals || []), 'puppeteer-extra', 'puppeteer-extra-plugin-stealth'];
    }

    // Ignore node_modules that can't be statically analyzed
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };

    return config;
  },
};

export default nextConfig;
