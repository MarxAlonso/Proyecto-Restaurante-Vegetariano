import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com; connect-src 'self' https://restaurante-vegetariano-backend.vercel.app; frame-src https://accounts.google.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
