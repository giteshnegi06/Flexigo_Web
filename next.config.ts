import type { NextConfig } from "next";

// Photos uploaded in the admin panel are served by the API at /api/media/<id>, so its host must be allowed too.
const api = new URL((process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").trim().replace(/\/+$/, ""));
const apiIsLocal = ["localhost", "127.0.0.1", "[::1]"].includes(api.hostname);

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Current photos are served from the Flexigo website. Add the new image host here when photos move.
    // Shimla season photos on the guide page come from Unsplash.
    remotePatterns: [
      { protocol: "https", hostname: "www.flexigoholidays.com", pathname: "/assets/img/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-*" },
      { protocol: api.protocol.replace(":", "") as "http" | "https", hostname: api.hostname, port: api.port, pathname: "/api/media/**" },
    ],
    // Only when the API runs on this computer (local testing). The live API is a public address, so this stays off there.
    dangerouslyAllowLocalIP: apiIsLocal,
    formats: ["image/avif", "image/webp"],
  },
  // Fewer build workers keep memory use low on small machines; raise this on a build server.
  experimental: { cpus: Number(process.env.NEXT_BUILD_CPUS ?? 1) },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
