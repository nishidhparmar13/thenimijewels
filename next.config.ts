import type { NextConfig } from "next";

// Product and category images are served by the Payload CMS at
// <CMS_URL>/api/media/file/<name>.
const cmsUrl = new URL(process.env.CMS_URL ?? "http://localhost:3000");
const cmsIsLocal = ["localhost", "127.0.0.1", "::1"].includes(cmsUrl.hostname);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: cmsUrl.protocol.replace(":", "") as "http" | "https",
        hostname: cmsUrl.hostname,
        port: cmsUrl.port,
        pathname: "/api/media/file/**",
      },
    ],
    // Next 16 refuses to optimise images from private IPs. Only allowed
    // when the CMS itself is on this machine (local development).
    dangerouslyAllowLocalIP: cmsIsLocal,
  },
};

export default nextConfig;
