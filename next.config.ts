import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/groupme",
        destination: "https://groupme.com/join_group/osutamilsangam",
        permanent: false,
      },
      {
        source: "/instagram",
        destination: "https://www.instagram.com/osutamilsangam/",
        permanent: false,
      },
      {
        source: "/tickets",
        destination: "/events/pattas-tappas-diwali-2026",
        permanent: false,
      },
      {
        source: "/diwali",
        destination: "/events/pattas-tappas-diwali-2026",
        permanent: false,
      },
      {
        source: "/faq",
        destination: "/guide",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
