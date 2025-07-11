# 孕期饮食助手

孕期饮食助手是一个专注于孕期健康饮食的Web应用程序。通过AI驱动，为准父母提供科学、安全、美味的个性化三餐（及加餐）菜谱，帮助孕妇和她们的伴侣轻松规划每日餐食。

## 项目特点

- **个性化菜谱推荐**：根据孕期阶段、健康状况和饮食偏好，提供量身定制的饮食建议
- **安全可靠**：所有饮食建议基于权威孕期营养指南，自动过滤孕期禁忌食物
- **便捷实用**：一键生成一日三餐食谱，详细展示食材、做法和营养分析
- **孕期饮食知识库**：可以搜索各种食物，了解其在孕期的安全等级和食用建议

## 技术栈

- **前端**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: MongoDB Atlas
- **AI服务**: 模块化设计，可轻松替换底层AI模型

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/yourusername/pregnancy-diet-assistant.git
cd pregnancy-diet-assistant
```

2. 安装依赖
```bash
npm install
# 或
yarn
```

3. 环境配置
复制 `.env.example` 文件到 `.env.local` 并设置环境变量:
```bash
cp .env.example .env.local
```

4. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用

## 目录结构

```
/
├── app/              # Next.js App Router
│   ├── api/          # API路由
│   ├── dashboard/    # 用户仪表板
│   ├── knowledge/    # 饮食知识库
│   ├── profile/      # 个人档案设置
│   └── ...
├── components/       # React组件
│   ├── common/       # 通用组件
│   └── ...
├── lib/              # 工具函数和服务
├── models/           # MongoDB模型
├── public/           # 静态资产
└── ...
```

## 功能截图

(在这里添加应用的截图)

## 许可证

本项目采用 MIT 许可证
