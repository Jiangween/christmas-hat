import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',  // 如果你使用 Docker 部署
  images: {
    domains: ['curuszqlvenx.sealoshzh.site'],  // 允许的图片域名
  },
  // 配置静态文件目录
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',  // 允许跨域访问
          },
        ],
      },
    ];
  },
};

export default nextConfig;