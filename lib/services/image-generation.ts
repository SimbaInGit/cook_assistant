import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { generateRecipeImageUrl } from '../utils/image';

/**
 * 菜谱图片生成服务
 * 使用 Gemini 2.0 Flash Preview Image Generation 模型生成菜谱图片
 */
class GeminiImageService {
  private genAI: GoogleGenerativeAI;
  private imageStoragePath: string;

  constructor() {
    const apiKey = process.env.AI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API Key 未配置，请在环境变量中设置 AI_API_KEY');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // 设置图片保存路径
    this.imageStoragePath = path.join(process.cwd(), 'public', 'images', 'recipes');
    
    // 确保目录存在
    this.ensureDirectoryExists(this.imageStoragePath);
  }

  /**
   * 确保目录存在
   */
  private ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
      console.log(`创建图片存储目录: ${directory}`);
    }
  }

  /**
   * 为菜谱名生成唯一的文件名
   */
  private generateFileName(recipeName: string): string {
    // 生成基于菜谱名的MD5哈希作为文件名的一部分
    const hash = crypto.createHash('md5').update(recipeName).digest('hex').substring(0, 8);
    
    // 清理菜谱名称，替换非法字符
    const sanitizedName = recipeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .substring(0, 20); // 限制长度
    
    return `${sanitizedName}_${hash}.png`;
  }

  /**
   * 构建用于生成图片的提示词
   */
  private buildImagePrompt(recipeName: string, ingredients: string[] = []): string {
    const ingredientsText = ingredients.length > 0 
      ? `，主要食材包括${ingredients.join('、')}`
      : '';
      
    return `生成一张高质量的"${recipeName}"美食照片${ingredientsText}。
    食物应放在精美的餐盘或盘子上，呈现出专业的美食摄影效果，光线明亮自然，
    构图精美，突出食材的质感和色彩。请使用逼真的3D渲染风格，细节丰富。
    不要包含文字或水印。`;
  }

  /**
   * 生成菜谱图片
   * @param recipeName 菜谱名称
   * @param ingredients 食材列表
   * @returns 生成的图片路径（相对于public目录）
   */
  public async generateImage(recipeName: string, ingredients: string[] = [], retries: number = 1): Promise<string> {
    try {
      console.log(`开始为菜谱 "${recipeName}" 生成图片...（尝试 ${retries}/3）`);
      
      // 构建提示词
      const prompt = this.buildImagePrompt(recipeName, ingredients);
      console.log(`使用提示词: ${prompt.substring(0, 100)}...`);

      // 使用 Gemini 2.0 Flash Preview Image Generation 模型生成图片
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-preview-image-generation",
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        },
        // 安全设置
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          }
        ],
      });

      // 发送请求生成图片
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // 处理响应
      let imageData = null;
      
      // 确保响应包含有效内容
      if (!response.candidates || !response.candidates[0] || !response.candidates[0].content || !response.candidates[0].content.parts) {
        throw new Error('API响应格式不符合预期');
      }
      
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageData = part.inlineData.data;
          break;
        }
      }
      
      if (!imageData) {
        throw new Error('未从API响应中找到图片数据');
      }
      
      // 生成文件名和路径
      const filename = this.generateFileName(recipeName);
      const imagePath = path.join(this.imageStoragePath, filename);
      
      // 保存图片
      const buffer = Buffer.from(imageData, 'base64');
      fs.writeFileSync(imagePath, buffer);
      
      console.log(`菜谱"${recipeName}"图片已保存到: ${imagePath}`);
      
      // 返回相对路径（用于前端访问）
      return `/images/recipes/${filename}`;
    } catch (error: any) {
      console.error(`生成菜谱"${recipeName}"图片时出错:`, error);
      
      // 如果API返回404或500错误，尝试重试最多3次
      if (retries < 3 && (
          error.message?.includes('404') || 
          error.message?.includes('500') ||
          error.message?.includes('API响应格式不符合预期')
        )) {
        console.log(`尝试重新生成菜谱"${recipeName}"图片，第 ${retries + 1} 次尝试...`);
        // 等待1秒后重试，避免过快请求
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.generateImage(recipeName, ingredients, retries + 1);
      }
      
      // 如果重试次数已达上限或者是其他类型的错误，返回备选方案的URL
      return this.getFallbackImageUrl(recipeName);
    }
  }
  
  /**
   * 在生成图片失败时获取备选图片URL
   */
  private getFallbackImageUrl(recipeName: string): string {
    try {
      console.log(`为菜谱"${recipeName}"使用备选图片源...`);
      return generateRecipeImageUrl(recipeName);
    } catch (error) {
      console.error('获取备选图片URL失败:', error);
      // 如果备选方案也失败，返回空字符串
      return '';
    }
  }
}

// 导出实例
export const geminiImageService = new GeminiImageService();
