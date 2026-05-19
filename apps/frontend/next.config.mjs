/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cardiq.ai" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  // Needed to correctly generate standalone output for Docker
  // output: "standalone", // Uncomment when deploying via Docker
};

export default nextConfig;
