import axios from 'axios';
import { IUserHealth } from '@/models/User';

// AI服务接口
interface AIService {
  generateDailyMealPlan(userHealth: IUserHealth): Promise<any>;
}

// AI服务提供商类型
export enum AIServiceProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini'
}

// 基础AI服务类
abstract class BaseAIService implements AIService {
  protected apiKey: string;
  protected endpoint: string;
  protected timeout: number;
  protected useBackupData: boolean;
  
  constructor() {
    this.apiKey = process.env.AI_API_KEY || '';
    this.endpoint = process.env.AI_API_ENDPOINT || '';
    // 设置超时时间，默认20秒，可通过环境变量配置
    this.timeout = parseInt(process.env.AI_REQUEST_TIMEOUT || '20000');
    // 控制是否在需要时使用备用数据
    this.useBackupData = process.env.USE_BACKUP_DATA === 'true';
    
    console.log(`AI服务初始化 - 提供商: ${this.constructor.name}, 超时时间: ${this.timeout}ms, 备用数据模式: ${this.useBackupData ? '开启' : '关闭'}`);
    
    if (!this.apiKey || !this.endpoint) {
      throw new Error('AI服务配置缺失：请检查环境变量中的API密钥和端点');
    }
  }
  
  abstract generateDailyMealPlan(userHealth: IUserHealth): Promise<any>;

}

// 辅助函数：计算孕周和准备提示词
function prepareUserHealthInfo(userHealth: IUserHealth) {
  // 计算当前孕周（如果未提供）
  let currentWeek = userHealth.currentWeek;
  if (!currentWeek && userHealth.dueDate) {
    const today = new Date();
    const dueDate = new Date(userHealth.dueDate);
    
    // 孕期总共40周，从dueDate倒推
    const diffTime = dueDate.getTime() - today.getTime();
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    currentWeek = 40 - diffWeeks;
    
    // 确保孕周在合理范围内
    currentWeek = Math.min(Math.max(currentWeek, 1), 40);
  }
  
  // 判断孕期阶段
  let trimester = '';
  if (currentWeek && currentWeek <= 12) {
    trimester = '第一孕期';
  } else if (currentWeek && currentWeek <= 27) {
    trimester = '第二孕期';
  } else {
    trimester = '第三孕期';
  }
  
  // 健康状况文本
  let healthConditions: string[] = [];
  if (userHealth.healthConditions?.gestationalDiabetes) {
    healthConditions.push('妊娠期糖尿病');
  }
  if (userHealth.healthConditions?.anemia) {
    healthConditions.push('贫血');
  }
  if (userHealth.healthConditions?.hypertension) {
    healthConditions.push('高血压');
  }
  if (userHealth.healthConditions?.other) {
    healthConditions.push(userHealth.healthConditions.other);
  }
  
  // 构建提示词
  const prompt = `
    请为一位${currentWeek ? `怀孕第${currentWeek}周` : ''}（${trimester}）的准妈妈制定今日三餐和两次加餐的营养食谱。
    
    ${userHealth.allergies && userHealth.allergies.length > 0 ? `她对以下食物过敏: ${userHealth.allergies.join(', ')}。` : ''}
    ${userHealth.dislikedFoods && userHealth.dislikedFoods.length > 0 ? `她不喜欢吃: ${userHealth.dislikedFoods.join(', ')}。` : ''}
    ${healthConditions.length > 0 ? `她的健康状况: ${healthConditions.join(', ')}。` : ''}
    
    请根据《中国居民膳食指南》孕期妇女部分，确保推荐的食谱组合满足对应孕周的能量、蛋白质、叶酸、铁、钙等关键营养素需求。
    不要推荐任何孕期禁忌或慎食食物，烹饪步骤尽量详细，适合老人参照烹饪
    
    返回JSON格式，包含以下字段:
    {
      "breakfast": { 
        "name": "菜名", 
        "category": "breakfast",
        "ingredients": [{"name": "食材名", "amount": "用量"}], 
        "preparationTime": 准备时间(数字,分钟),
        "cookingTime": 烹饪时间(数字,分钟),
        "steps": ["步骤1", "步骤2"], 
        "nutrition": {
          "calories": 数字(千卡), 
          "protein": 数字(克), 
          "fat": 数字(克), 
          "carbs": 数字(克), 
          "fiber": 数字(克), 
          "calcium": 数字(毫克), 
          "iron": 数字(毫克)
        }, 
        "tips": ["小贴士1"] 
      },
      "morningSnack": { "name": "菜名", "category": "snack", ... },
      "lunch": { "name": "菜名", "category": "lunch", ... },
      "afternoonSnack": { "name": "菜名", "category": "snack", ... },
      "dinner": { "name": "菜名", "category": "dinner", ... },
      "nutritionSummary": { 
        "calories": 数字(千卡), 
        "protein": 数字(克), 
        "fat": 数字(克), 
        "carbs": 数字(克), 
        "fiber": 数字(克)
      }
    }
  `;
  
  return { currentWeek, trimester, healthConditions, prompt };
}

// 实现AI服务 - OpenAI API
export class OpenAIService extends BaseAIService {
  constructor() {
    super();
  }
  
  async generateDailyMealPlan(userHealth: IUserHealth): Promise<any> {
    try {
      console.log('🚀 开始调用OpenAI API生成饮食计划...');
      const startTime = Date.now();
      
      const { prompt } = prepareUserHealthInfo(userHealth);
      
      // 调用OpenAI API
      console.log(`📤 发送请求到OpenAI API, 超时设置: ${this.timeout}ms`);
      const response = await axios.post(
        this.endpoint,
        {
          model: "gpt-4",
          messages: [
            { 
              role: "system", 
              content: "你是一个专业的孕期营养师，根据准妈妈的情况给出科学、安全、美味的膳食建议。请严格按照返回的JSON格式要求输出。"
            },
            { role: "user", content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: this.timeout // 设置超时时间
        }
      );
      
      const endTime = Date.now();
      console.log(`✅ OpenAI API响应成功! 用时: ${endTime - startTime}ms`);
      
      // 解析返回的内容
      const content = response.data.choices[0].message.content;
      
      // 提取JSON部分
      const jsonMatch = content.match(/({[\s\S]*})/);
      if (jsonMatch && jsonMatch[0]) {
        try {
          const mealPlan = JSON.parse(jsonMatch[0]);
          console.log(`✅ 成功解析OpenAI返回的JSON数据`);
          return mealPlan;
        } catch (e) {
          console.error('❌ 解析AI返回的JSON失败:', e);
          // 如果启用了备用数据，则在解析失败时使用备用数据
          if (this.useBackupData) {
            return this.getBackupMealPlan();
          }
          throw new Error('生成菜谱失败: 无法解析返回的数据');
        }
      }
      
      // 如果没有提取到JSON但启用了备用数据，则使用备用数据
      if (this.useBackupData) {
        return this.getBackupMealPlan();
      }
      
      throw new Error('生成菜谱失败: 无法从AI返回中提取有效数据');
      
    } catch (error: any) {
      console.error('❌ AI服务错误:', error);
      // 检查是否为超时错误
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('⏱️ API调用失败: timeout of', this.timeout, 'ms exceeded');
        // 如果启用了备用数据，则在超时时使用备用数据
        if (this.useBackupData) {
          return this.getBackupMealPlan();
        }
      }
      throw new Error(`生成菜谱失败: ${error.message}`);
    }
  }
}

// 实现AI服务 - Google Gemini API
export class GeminiService extends BaseAIService {
  constructor() {
    super();
  }
  
  async generateDailyMealPlan(userHealth: IUserHealth): Promise<any> {
    try {
      console.log('🚀 开始调用Gemini API生成饮食计划...');
      const startTime = Date.now();
      
      const { prompt } = prepareUserHealthInfo(userHealth);
      
      // 调用Google Gemini API
      console.log(`📤 发送请求到Gemini API, 超时设置: ${this.timeout}ms`);
      const response = await axios.post(
        this.endpoint,
        {
          contents: [
            {
              parts: [
                { 
                  text: "你是一个专业的孕期营养师，根据准妈妈的情况给出科学、安全、美味的膳食建议。请严格按照返回的JSON格式要求输出。"
                },
                { 
                  text: prompt 
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': this.apiKey
          },
          timeout: this.timeout // 设置超时时间
        }
      );
      
      const endTime = Date.now();
      console.log(`✅ Gemini API响应成功! 用时: ${endTime - startTime}ms`);
      
      // 解析返回的内容
      const content = response.data.candidates[0].content.parts[0].text;
      console.log(`📝 Gemini API 响应内容预览: ${content.slice(0, 200)}...`);
      
      // 尝试不同的正则表达式来提取JSON
      let jsonMatch = content.match(/({[\s\S]*})/);
      
      // 如果第一种正则表达式无法匹配，尝试查找JSON开始的位置并手动提取
      if (!jsonMatch || !jsonMatch[0]) {
        console.log('🔍 第一种正则表达式未能提取到JSON，尝试替代方法...');
        const startIndex = content.indexOf('{');
        if (startIndex !== -1) {
          // 尝试提取从第一个{开始的所有内容
          const potentialJson = content.substring(startIndex);
          console.log(`💡 找到JSON开始位置，尝试解析从位置 ${startIndex} 开始的内容`);
          jsonMatch = [null, potentialJson];
        }
      }
      
      if (jsonMatch && jsonMatch[1]) {
        try {
          console.log(`🔄 尝试解析提取的内容: ${jsonMatch[1].slice(0, 100)}...`);
          
          // 尝试清理和修复JSON
          let jsonText = jsonMatch[1].trim();
          // 确保最后有一个结束大括号
          if (!jsonText.endsWith('}')) {
            const lastBraceIndex = jsonText.lastIndexOf('}');
            if (lastBraceIndex !== -1) {
              jsonText = jsonText.substring(0, lastBraceIndex + 1);
            }
          }
          
          const mealPlan = JSON.parse(jsonText);
          console.log(`✅ 成功解析Gemini返回的JSON数据`);
          return mealPlan;
        } catch (e) {
          console.error(`❌ 解析JSON失败，尝试提取的内容: ${jsonMatch[1].slice(0, 100)}...`);
          console.error('❌ 解析AI返回的JSON失败:', e);
          
          // 如果启用了备用数据，则在解析失败时使用备用数据
          if (this.useBackupData) {
            console.log('⚠️ JSON解析失败，使用备用数据');
            return this.getBackupMealPlan();
          }
          throw new Error('生成菜谱失败: 无法解析返回的数据');
        }
      }
      
      // 如果没有提取到JSON但启用了备用数据，则使用备用数据
      if (this.useBackupData) {
        console.log('⚠️ 未能提取JSON，使用备用数据');
        return this.getBackupMealPlan();
      }
      
      console.error('❌ 无法从响应中提取有效的JSON数据');
      throw new Error('生成菜谱失败: 无法从AI返回中提取有效数据');
      
    } catch (error: any) {
      console.error('❌ AI服务错误:', error);
      // 检查是否为超时错误
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('⏱️ API调用失败: timeout of', this.timeout, 'ms exceeded');
        // 如果启用了备用数据，则在超时时使用备用数据
        if (this.useBackupData) {
          return this.getBackupMealPlan();
        }
      }
      throw new Error(`生成菜谱失败: ${error.message}`);
    }
  }
}

// 导出默认AI服务实例
let aiService: AIService;

export function getAIService(): AIService {
  if (!aiService) {
    // 根据环境变量选择AI服务提供商
    const provider = process.env.AI_SERVICE_PROVIDER?.toLowerCase() || AIServiceProvider.GEMINI;
    
    if (provider === AIServiceProvider.OPENAI) {
      aiService = new OpenAIService();
    } else {
      // 默认使用Gemini
      aiService = new GeminiService();
    }
  }
  
  return aiService;
}
