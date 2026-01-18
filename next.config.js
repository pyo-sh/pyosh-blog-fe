export default {
  compiler: {
    emotion: true,
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
