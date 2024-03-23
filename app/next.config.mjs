/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      "cpu-features": false,
    };
    return config;
  },
};

export default nextConfig;
