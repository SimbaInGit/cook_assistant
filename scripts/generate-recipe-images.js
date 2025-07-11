/**
 * 菜谱图片批量生成脚本
 * 使用 Gemini 2.0 Flash Preview Image Generation API 为数据库中的菜谱批量生成图片
 * 
 * 使用方法：
 * node scripts/generate-recipe-images.js [--force] [--limit=50]
 * 
 * 参数：
 * --force：强制为所有菜谱重新生成图片，即使它们已经有图片
 * --limit=N：限制处理的菜谱数量，默认为50
 */

// 环境变量配置
require('dotenv').config();

// 导入依赖
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');

// 解析命令行参数
const args = process.argv.slice(2);
const forceRegenerate = args.includes('--force');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 50;

// 配置MongoDB连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cook-assistant';

// 菜谱模型定义（简化版）
const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  ingredients: [mongoose.Schema.Types.Mixed],
  category: { type: String }
});

// 日志记录
const logFile = path.join(process.cwd(), 'recipe-image-generation-log.json');
let logData = { startTime: new Date().toISOString(), recipes: [], errors: [] };

/**
 * 生成图片存储目录
 */
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`创建图片存储目录: ${directory}`);
  }
}

/**
 * 生成唯一文件名
 */
function generateFileName(recipeName) {
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
 * 构建图片生成的提示词
 */
function buildImagePrompt(recipeName, ingredients = []) {
  const ingredientsText = ingredients.length > 0 
    ? `，主要食材包括${ingredients.join('、')}`
    : '';
    
  return `生成一张高质量的"${recipeName}"美食照片${ingredientsText}。
  食物应放在精美的餐盘或盘子上，呈现出专业的美食摄影效果，光线明亮自然，
  构图精美，突出食材的质感和色彩。请使用逼真的3D渲染风格，细节丰富。
  不要包含文字或水印。`;
}

/**
 * 使用Gemini生成图片
 */
async function generateImage(genAI, recipeName, ingredients = [], imageStoragePath) {
  try {
    console.log(`开始为菜谱 "${recipeName}" 生成图片...`);
    
    // 构建提示词
    const prompt = buildImagePrompt(recipeName, ingredients);
    console.log(`使用提示词: ${prompt.substring(0, 100)}...`);

    // 使用 Gemini 2.0 Flash Preview Image Generation 模型生成图片
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-preview-image-generation",
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
      }
    });      // 发送请求生成图片
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // 确保响应包含有效内容
    if (!response.candidates || 
        !response.candidates[0] || 
        !response.candidates[0].content || 
        !response.candidates[0].content.parts) {
      throw new Error('API响应格式不符合预期');
    }
    
    // 处理响应
    let imageData = null;
    
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
    const filename = generateFileName(recipeName);
    const imagePath = path.join(imageStoragePath, filename);
    
    // 保存图片
    const buffer = Buffer.from(imageData, 'base64');
    fs.writeFileSync(imagePath, buffer);
    
    console.log(`菜谱"${recipeName}"图片已保存到: ${imagePath}`);
    
    // 返回相对路径（用于前端访问）
    return `/images/recipes/${filename}`;
  } catch (error) {
    console.error(`生成菜谱"${recipeName}"图片时出错:`, error);
    logData.errors.push({
      recipeName,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    // 返回空字符串表示生成失败
    return '';
  }
}

/**
 * 为一个菜谱生成图片并更新数据库
 */
async function processRecipe(Recipe, genAI, recipe, imageStoragePath) {
  try {
    const recipeId = recipe._id.toString();
    console.log(`处理菜谱: ${recipe.name} (ID: ${recipeId})`);
    
    // 如果强制重新生成或者没有图片，则生成新图片
    if (forceRegenerate || !recipe.image || recipe.image.startsWith('http') || !recipe.image.startsWith('/images/recipes/')) {
      const ingredients = Array.isArray(recipe.ingredients) ? 
        recipe.ingredients.map(i => typeof i === 'string' ? i : (i.name || '')).slice(0, 5) : 
        [];
      
      // 生成图片
      const imageUrl = await generateImage(genAI, recipe.name, ingredients, imageStoragePath);
      
      if (imageUrl) {
        // 更新数据库中的图片URL
        await Recipe.updateOne(
          { _id: recipeId },
          { $set: { image: imageUrl } }
        );
        
        // 记录成功日志
        logData.recipes.push({
          id: recipeId,
          name: recipe.name,
          oldImage: recipe.image,
          newImage: imageUrl,
          timestamp: new Date().toISOString()
        });
        
        console.log(`菜谱"${recipe.name}"图片已更新为: ${imageUrl}`);
        return true;
      }
    } else {
      console.log(`跳过菜谱"${recipe.name}"，已有有效图片: ${recipe.image}`);
    }
    
    return false;
  } catch (error) {
    console.error(`处理菜谱"${recipe.name}"时出错:`, error);
    logData.errors.push({
      recipeName: recipe.name,
      recipeId: recipe._id.toString(),
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  // 连接MongoDB
  try {
    console.log('连接MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB连接成功');
    
    // 注册菜谱模型
    const Recipe = mongoose.model('Recipe', RecipeSchema);
    
    // 初始化Gemini客户端
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      throw new Error('API Key 未配置，请在环境变量中设置 AI_API_KEY');
    }
    
    console.log('正在初始化 Google Generative AI 客户端...');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 设置图片保存路径
    const imageStoragePath = path.join(process.cwd(), 'public', 'images', 'recipes');
    ensureDirectoryExists(imageStoragePath);
    
    // 查询需要处理的菜谱
    const query = forceRegenerate ? {} : {
      $or: [
        { image: { $exists: false } },
        { image: null },
        { image: '' },
        { image: { $regex: '^http' } }, // 匹配以http开头的图片URL（外部图片）
        { image: { $not: { $regex: '^/images/recipes/' } } } // 匹配不是以/images/recipes/开头的URL
      ]
    };
    
    // 获取符合条件的菜谱
    const recipes = await Recipe.find(query).limit(limit);
    console.log(`找到 ${recipes.length} 个需要处理的菜谱`);
    
    logData.totalRecipes = recipes.length;
    
    // 批量处理菜谱
    let successCount = 0;
    for (const recipe of recipes) {
      const success = await processRecipe(Recipe, genAI, recipe, imageStoragePath);
      if (success) successCount++;
    }
    
    logData.successCount = successCount;
    logData.endTime = new Date().toISOString();
    
    // 保存日志
    fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
    
    console.log(`处理完成。成功生成 ${successCount}/${recipes.length} 个菜谱图片。详细日志已保存到 ${logFile}`);
  } catch (error) {
    console.error('发生错误:', error);
    logData.endTime = new Date().toISOString();
    logData.fatalError = error.message;
    fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
  } finally {
    // 关闭MongoDB连接
    await mongoose.disconnect();
    console.log('MongoDB连接已关闭');
  }
}

// 运行主函数
main();
