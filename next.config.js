export default {
  experimental: {
    esmExternals: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
