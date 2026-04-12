import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'microphone=(self), camera=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://oapi.map.naver.com https://ssl.pstatic.net https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://oapi.map.naver.com https://apis.data.go.kr https://api.anthropic.com https://va.vercel-scripts.com",
              "img-src 'self' data: blob: https://*.naver.com https://*.pstatic.net",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  experimental: {
    optimizePackageImports: ['recharts'],
  },
};

export default nextConfig;
