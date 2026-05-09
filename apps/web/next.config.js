/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@cotishama/shared', '@cotishama/db'],
};

module.exports = nextConfig;