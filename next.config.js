/** @type {import('next').NextConfig} */
const nextConfig = {
  // 图片配置
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com', 'picsum.photos', 'source.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
  // 禁用TypeScript类型检查
  typescript: {
    // 在生产构建时忽略TypeScript错误
    ignoreBuildErrors: true,
  },
  // 设置API路由超时 - 适用于生成计划等长时间运行的操作
  api: {
    responseLimit: '8mb',
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
  // 增加路由处理超时
  experimental: {
    serverActionsTimeout: 240, // 4分钟
  },
  // 禁用字体优化以解决之前遇到的字体问题
  optimizeFonts: false,
  // 禁用ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
