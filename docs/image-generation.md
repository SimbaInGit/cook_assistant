# 菜谱图片生成系统

本文档介绍了"孕期饮食助手"应用中菜谱图片生成系统的实现和使用。

## 实现概览

菜谱图片生成系统基于 Google Gemini 2.0 Flash Preview Image Generation API，能够根据菜谱名称和主要食材自动生成美食图片。该系统同时提供了多种兜底机制，确保即使 API 调用失败也能提供合适的图片给用户。

## 主要组件

### 1. GeminiImageService (lib/services/image-generation.ts)

这是图片生成的核心服务，负责：
- 接收菜谱名称和食材信息
- 构建适合的提示词
- 调用 Gemini API 生成图片
- 保存图片到本地文件系统
- 处理错误和重试逻辑

### 2. 图片工具函数 (lib/utils/image.ts)

提供了辅助功能：
- `generateRecipeImageUrl`: 当 Gemini API 不可用时，生成备选图片 URL（来自 Unsplash 等）
- `fixImageUrl`: 修复可能存在问题的图片 URL

### 3. 前端图片组件 (components/recipes/RecipeImage.tsx)

负责图片显示：
- 支持加载本地和远程图片
- 处理图片加载失败的情况
- 提供占位图功能

### 4. 批量图片生成脚本 (scripts/generate-recipe-images.js)

用于批量处理数据库中的菜谱，为它们生成图片：
- 支持强制重新生成已有图片
- 支持限制处理数量
- 记录详细的处理日志

## 图片生成流程

1. **菜谱生成**: 当用户获取新的菜谱推荐时，系统会在保存菜谱的同时调用 `geminiImageService.generateImage()` 生成图片
2. **提示词构建**: 系统会根据菜谱名称和主要食材构建适合的提示词
3. **API调用**: 调用 Gemini 2.0 Flash Preview Image Generation API 生成图片
4. **图片存储**: 生成的图片以 PNG 格式保存在 `/public/images/recipes/` 目录下
5. **错误处理**: 如果生成失败，系统会自动重试最多3次，之后使用备选图片源（Unsplash 等）

## 兜底机制

系统提供了多层兜底机制，确保即使图片生成失败，用户也能看到合适的图片：

1. **API重试**: 对于404/500等临时错误，自动重试最多3次
2. **备选图片源**: 如果 Gemini API 不可用，使用 Unsplash、Picsum 等在线图片服务
3. **本地占位图**: 如果所有在线图片源都失败，使用本地占位图

## 环境配置

在使用该系统前，需要设置以下环境变量：

```
AI_API_KEY=your_google_ai_api_key_here
```

注意：系统使用与其他 AI 服务相同的环境变量 `AI_API_KEY`，无需额外配置。

## 使用方法

### 在代码中使用

```typescript
import { geminiImageService } from '@/lib/services/image-generation';

// 生成图片
const imageUrl = await geminiImageService.generateImage(
  '芒果牛奶燕麦粥',  // 菜谱名称
  ['芒果', '牛奶', '燕麦'] // 主要食材（可选）
);

// imageUrl 将是类似 "/images/recipes/mango_milk_oatmeal_abc12345.png" 的路径
```

### 批量生成图片

```bash
# 为没有图片的菜谱生成图片（默认最多处理50个）
node scripts/generate-recipe-images.js

# 为所有菜谱重新生成图片
node scripts/generate-recipe-images.js --force

# 指定处理数量
node scripts/generate-recipe-images.js --limit=100
```

## 故障排查

如果图片生成失败，请检查：

1. Gemini API Key 是否正确配置
2. 网络连接是否正常
3. 查看日志文件 `recipe-image-generation-log.json` 了解详细错误信息

## 注意事项

- Gemini 2.0 Flash Preview Image Generation 是预览版 API，可能存在不稳定性
- 图片生成需要考虑 API 使用量和配额限制
- 批量生成图片时，建议避免过高频率的 API 调用，以防触发限流
