/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['rally-net.vercel.app', 'rallynet.com', 'www.rallynet.com'],
  },
  // パフォーマンス最適化
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react-icons', 'firebase'],
  },
  // 同時接続数の最適化
  serverRuntimeConfig: {
    maxConcurrentRequests: 10,
  },
  // 静的ファイルの最適化
  compress: true,
  poweredByHeader: false,
  // キャッシュ設定
  generateEtags: false,
  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 