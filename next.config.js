/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@node-rs/argon2',
      'argon2',
      'bullmq',
      'ioredis',
      '@prisma/client',
    ],
  },
};

module.exports = nextConfig;
