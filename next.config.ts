import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Current photos are served from the Flexigo website. Add the new image host here when photos move.
    // Shimla season photos on the guide page come from Unsplash.
    remotePatterns: [
      { protocol: "https", hostname: "www.flexigoholidays.com", pathname: "/assets/img/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-*" },
    ],
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
