export default {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5500",
      },
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
