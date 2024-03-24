/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { webpack }) => {
    config.resolve.fallback = {
      "cpu-features": false,
    };
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /(cpu-features|sshcrypto\.node)/u,
      })
    );
    return config;
  },
};

export default nextConfig;
