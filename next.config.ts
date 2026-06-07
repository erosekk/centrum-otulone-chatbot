import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  async headers() {
    return [
      // widget.js — must be loadable from any external domain (WordPress sites)
      {
        source: "/widget.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          // In dev: no-store so browser always picks up the freshly rebuilt widget.js.
          // In production: 1-hour cache (Vercel invalidates on each deploy via new URL hash).
          {
            key: "Cache-Control",
            value: isDev
              ? "no-store"
              : "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
      // /widget route — iframe fallback (kept as alternative)
      {
        source: "/widget",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
    ];
  },
};

export default nextConfig;
