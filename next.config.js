/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // 禁用字体优化以解决之前遇到的字体问题
  optimizeFonts: false,
  // 禁用ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
