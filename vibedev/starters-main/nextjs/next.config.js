/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    // 🚀 CRITICAL: Force Webpack to aggressively scan the virtual disk in development
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 500, // Scan files for modification flags every 500ms
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;