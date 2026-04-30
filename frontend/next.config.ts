import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production mode settings
  reactStrictMode: true,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 año
    formats: ["image/avif", "image/webp"],
  },

  // Strip console.log in production builds (keeps error/warn)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // Security headers and optimizations
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(self), microphone=(), geolocation=()",
        },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.googletagmanager.com https://js.stripe.com https://js.braintreegateway.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com https://i.pravatar.cc https://images.unsplash.com https://replicate.delivery https://*.supabase.co https://*.r2.cloudflarestorage.com",
            "connect-src 'self' https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://api.stripe.com https://*.supabase.co https://*.upstash.io https://api.openai.com https://generativelanguage.googleapis.com https://api.brevo.com",
            "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
            "media-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join("; "),
        },
      ],
    },
    {
      source: "/api/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store",
        },
      ],
    },
  ],

  // Rewrites for API routes
  rewrites: async () => ({
    beforeFiles: [
      {
        source: "/api/v1/:path*",
        destination: "/api/:path*",
      },
    ],
  }),

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: "Spartan Club",
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || "1.0.0",
  },

  // Vercel analytics
  experimental: {
    optimizePackageImports: ["@/components", "@/lib"],
  },
};

export default nextConfig;
