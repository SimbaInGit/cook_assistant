import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getAIService } from '@/lib/ai-service';
import User, { IUser } from '@/models/User';
import DietPlan from '@/models/DietPlan';
import Recipe from '@/models/Recipe';
import mongoose from 'mongoose';
import { generateRecipeImageUrl, fixImageUrl } from '@/lib/utils/image';
import { geminiImageService } from '@/lib/services/image-generation';

// 辅助函数：保存或查找菜谱并返回ObjectId
async function saveOrFindRecipe(meal: any, mealType: string = ''): Promise<mongoose.Types.ObjectId | null> {
  if (!meal) return null;
  
  try {
    // 确保meal.name存在
    if (!meal.name) {
      console.error('菜谱没有名称，无法保存');
      return null;
    }
    
    // 查询是否已存在相同名称的菜谱
    let recipe = await Recipe.findOne({ name: meal.name });
    
    if (!recipe) {
      console.log(`创建新菜谱: ${meal.name}`);
      
      // 根据餐食类型和名称确定分类
      let category = '';
      
      // 首先使用meal.category（AI返回的category字段）
      if (meal.category && ['breakfast', 'lunch', 'dinner', 'snack'].includes(meal.category.toLowerCase())) {
        category = meal.category.toLowerCase();
        console.log(`使用AI返回的category值: ${category}`);
      }
      // 其次使用mealType参数确定分类
      else if (mealType) {
        switch (mealType) {
          case 'breakfast':
            category = 'breakfast';
            break;
          case 'lunch':
            category = 'lunch';
            break;
          case 'dinner':
            category = 'dinner';
            break;
          case 'morningSnack':
          case 'afternoonSnack':
            category = 'snack';
            break;
        }
        console.log(`使用mealType参数确定category: ${category}`);
      }
      // 最后使用名称判断
      else {
        const name = meal.name.toLowerCase();
        if (name.includes('午餐') || name.includes('中餐') || name.includes('lunch')) {
          category = 'lunch';
        } else if (name.includes('晚餐') || name.includes('dinner')) {
          category = 'dinner';
        } else if (name.includes('加餐') || name.includes('snack')) {
          category = 'snack';
        } else {
          // 默认早餐
          category = 'breakfast';
        }
        console.log(`通过菜名推断category: ${category}`);
      }
      
      // 记录原始营养数据
      console.log(`处理菜谱"${meal.name}"的营养信息:`, meal.nutrition ? JSON.stringify(meal.nutrition) : '无营养信息');
      
      // 检查营养信息是否存在
      let hasNutritionData = meal.nutrition && typeof meal.nutrition === 'object';
      
      console.log(`"${meal.name}"的营养信息是否存在:`, hasNutritionData);
      
      // 获取原始营养数据并进行类型转换
      const originalNutrition = meal.nutrition || {};
      console.log(`原始营养数据类型:`, {
        calories: typeof originalNutrition.calories,
        protein: typeof originalNutrition.protein,
        fat: typeof originalNutrition.fat,
        carbs: typeof originalNutrition.carbs
      });
      
      // 强制类型转换所有营养值为数值类型
      // 确保菜谱对象有所有必要的字段，并且值为数值类型
      const nutrition = {
        calories: parseFloat(originalNutrition.calories) || 0,
        protein: parseFloat(originalNutrition.protein) || 0,
        fat: parseFloat(originalNutrition.fat) || 0,
        carbs: parseFloat(originalNutrition.carbs) || 0,
        fiber: parseFloat(originalNutrition.fiber) || 0,
        calcium: parseFloat(originalNutrition.calcium) || 0,
        iron: parseFloat(originalNutrition.iron) || 0,
        folicAcid: parseFloat(originalNutrition.folicAcid) || 0,
        vitaminC: parseFloat(originalNutrition.vitaminC) || 0,
        vitaminE: parseFloat(originalNutrition.vitaminE) || 0
      };
      
      // 记录整理后的营养数据
      console.log(`"${meal.name}"的整理后营养信息:`, JSON.stringify(nutrition));
      
      // 尝试使用Gemini生成菜谱图片
      let imageUrl = meal.image || '';
      
      if (!imageUrl) {
        try {
          console.log(`尝试为菜谱"${meal.name}"生成图片...`);
          // 使用Gemini图片生成服务
          imageUrl = await geminiImageService.generateImage(
            meal.name, 
            Array.isArray(meal.ingredients) ? 
              meal.ingredients.map((i: any) => typeof i === 'string' ? i : (i.name || '')).slice(0, 5) : 
              []
          );
          console.log(`菜谱"${meal.name}"图片生成成功: ${imageUrl}`);
        } catch (imgError) {
          console.error(`生成菜谱"${meal.name}"图片失败:`, imgError);
          // 如果Gemini图片生成失败，使用备选方案
          imageUrl = generateRecipeImageUrl(meal.name);
        }
      }
      
      // 确保图片URL有效
      imageUrl = fixImageUrl(imageUrl, meal.name);
      
      const recipeData = {
        name: meal.name,
        category,
        image: imageUrl,
        ingredients: meal.ingredients || [],
        steps: meal.steps || [],
        preparationTime: meal.preparationTime || getDefaultPreparationTime(category, meal.name),
        cookingTime: meal.cookingTime || getDefaultCookingTime(category, meal.name),
        nutrition,
        tips: meal.tips || [],
        isPregnancySafe: true, // 假设AI返回的都是安全的
        trimesterSuitability: {
          first: true,
          second: true,
          third: true
        },
        suitableConditions: {
          gestationalDiabetes: false,
          anemia: false,
          hypertension: false
        }
      };
      
      try {
        // 创建新菜谱
        recipe = await Recipe.create(recipeData);
        console.log(`新菜谱已创建, ID: ${recipe._id}`);
      } catch (err) {
        // 处理可能的验证错误
        const createError = err as any;
        console.error('创建菜谱失败，详细错误:', createError);
        if (createError.name === 'ValidationError') {
          const errorFields = Object.keys(createError.errors || {});
          console.error('验证错误字段:', errorFields);
        }
        throw createError; // 重新抛出错误以便上层处理
      }
    } else {
      console.log(`找到现有菜谱: ${recipe.name}, ID: ${recipe._id}`);
    }
    
    return recipe._id;
  } catch (error) {
    console.error(`保存菜谱失败: ${error instanceof Error ? error.message : '未知错误'}`);
    return null;
  }
}

// 根据菜肴类型和名称返回合理的默认准备时间（分钟）
function getDefaultPreparationTime(category: string, name: string): number {
  // 检查名称中是否有关键词可以帮助确定准备时间
  const nameLower = name.toLowerCase();
  
  // 判断是否为简单零食或饮料
  if (
    category === 'snack' || 
    nameLower.includes('酸奶') ||
    nameLower.includes('水果') ||
    nameLower.includes('奶昔') ||
    nameLower.includes('牛奶') ||
    nameLower.includes('酸奶') ||
    nameLower.includes('坚果')
  ) {
    return 5; // 简单零食/饮料准备时间短
  }
  
  // 判断是否为复杂料理
  if (
    nameLower.includes('炖') ||
    nameLower.includes('焖') ||
    nameLower.includes('煲') ||
    nameLower.includes('汤') ||
    nameLower.includes('馅') ||
    nameLower.includes('饺')
  ) {
    return 25; // 复杂料理准备时间长
  }
  
  // 根据类别设置默认值
  switch (category) {
    case 'breakfast':
      return 10;
    case 'lunch':
    case 'dinner':
      return 15;
    default:
      return 10;
  }
}

// 根据菜肴类型和名称返回合理的默认烹饪时间（分钟）
function getDefaultCookingTime(category: string, name: string): number {
  // 检查名称中是否有关键词可以帮助确定烹饪时间
  const nameLower = name.toLowerCase();
  
  // 无需烹饪的食物
  if (
    nameLower.includes('沙拉') ||
    nameLower.includes('生') && nameLower.includes('果') ||
    nameLower.includes('酸奶') && !nameLower.includes('烤') ||
    nameLower.includes('坚果') && !nameLower.includes('烤')
  ) {
    return 0;
  }
  
  // 需要长时间烹饪的食物
  if (
    nameLower.includes('炖') ||
    nameLower.includes('焖') ||
    nameLower.includes('煲') ||
    nameLower.includes('汤') && !nameLower.includes('速') && !nameLower.includes('快')
  ) {
    return 45; // 长时间炖煮
  }
  
  // 烤制食物
  if (
    nameLower.includes('烤') ||
    nameLower.includes('烘') ||
    nameLower.includes('焙')
  ) {
    return 25; // 烤制食物
  }
  
  // 蒸制食物
  if (
    nameLower.includes('蒸') ||
    nameLower.includes('饺') ||
    nameLower.includes('包子')
  ) {
    return 20; // 蒸制食物
  }
  
  // 根据类别设置默认值
  switch (category) {
    case 'breakfast':
      return 10;
    case 'lunch':
    case 'dinner':
      return 20;
    case 'snack':
      return 5;
    default:
      return 15;
  }
}

// 处理POST请求，生成每日饮食计划
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log(`🚀 开始处理饮食计划生成请求 - ${new Date().toLocaleString()}`);
  
  // 设置超时控制
  const apiTimeout = parseInt(process.env.AI_REQUEST_TIMEOUT || '180000');
  console.log(`⏱️ API超时设置为 ${apiTimeout/1000} 秒`);
  
  try {
    // 解析请求体
    const body = await request.json().catch(() => ({}));
    let userId = body.userId;
    const date = body.date;
    const isReplace = body.replace === true; // 是否替换现有计划
    
    console.log(`📝 请求信息 - userId: ${userId}, date: ${date}, isReplace: ${isReplace}`);

    // 如果请求体中没有userId，尝试从cookie中获取
    if (!userId) {
      userId = request.cookies.get('userId')?.value;
      console.log(`🔍 从cookie获取userId: ${userId}`);
      
      if (!userId) {
        return NextResponse.json(
          { error: '无法确定用户身份，请重新登录' },
          { status: 401 }
        );
      }
    }

    // 连接数据库
    await connectToDatabase();

    // 获取用户信息
    const user = await User.findById(userId);
    if (!user) {
      console.log(`❌ 找不到用户信息，userId: ${userId}`);
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    console.log(`✅ 找到用户信息 - name: ${user.name}, email: ${user.email}`);

    // 检查用户是否已设置健康信息
    if (!user.healthInfo || !user.healthInfo.dueDate) {
      console.log(`⚠️ 用户未设置健康信息 - userId: ${userId}`);
      return NextResponse.json(
        { error: '请先完成个人档案设置' },
        { status: 400 }
      );
    }
    
    console.log(`✅ 用户健康信息有效 - 孕周: ${user.healthInfo.currentWeek}, 预产期: ${user.healthInfo.dueDate}`);

    // 获取AI服务实例
    const aiService = getAIService();
    
    console.log(`🤖 准备调用AI服务生成饮食计划...`);
    
    // 直接调用AI服务，等待结果返回
    console.log(`⏱️ 开始调用AI服务，请求超时设置为 ${apiTimeout/1000} 秒`);
    const mealPlan = await aiService.generateDailyMealPlan(user.healthInfo);
    console.log('✅ AI服务成功返回饮食计划数据');
      
      // 检查AI返回的原始数据结构
      console.log('AI返回的饮食计划结构：', {
        hasBreakfast: !!mealPlan.breakfast,
        breakfastType: mealPlan.breakfast ? typeof mealPlan.breakfast : 'undefined',
        hasNutrition: mealPlan.breakfast && !!mealPlan.breakfast.nutrition,
        nutritionType: mealPlan.breakfast && mealPlan.breakfast.nutrition ? typeof mealPlan.breakfast.nutrition : 'undefined',
        caloriesType: mealPlan.breakfast && mealPlan.breakfast.nutrition ? typeof mealPlan.breakfast.nutrition.calories : 'undefined',
        caloriesValue: mealPlan.breakfast && mealPlan.breakfast.nutrition ? mealPlan.breakfast.nutrition.calories : 'undefined'
      });
      
      // 验证AI返回的数据结构
      if (!mealPlan) {
        throw new Error('AI服务返回空响应');
      }
      
      // 验证餐食数据是否存在
      const meals = ['breakfast', 'lunch', 'dinner', 'morningSnack', 'afternoonSnack'];
      const missingMeals = meals.filter(meal => !mealPlan[meal]);
      
      if (missingMeals.length > 0) {
        console.warn(`警告: AI返回的饮食计划缺少以下餐食: ${missingMeals.join(', ')}`);
      }
    // 准备保存饮食计划
    // 注意：在实际项目中，这里可能需要首先将菜谱保存到Recipe集合中
    // 但在当前演示版本中，我们简化处理，直接保存菜谱名称
    
    // 计算营养总结
    const nutritionSummary = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      calcium: 0,
      iron: 0,
      folicAcid: 0,
      vitaminC: 0,
      vitaminE: 0
    };

    console.log('开始计算总营养摘要...');

    // 合并所有餐食的营养信息，强制转换为数值类型
    ['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner'].forEach(meal => {
      if (mealPlan[meal] && mealPlan[meal].nutrition) {
        const nutrition = mealPlan[meal].nutrition;
        console.log(`${meal}营养数据类型:`, {
          calories: typeof nutrition.calories,
          protein: typeof nutrition.protein,
          值: nutrition.calories
        });
        
        nutritionSummary.calories += parseFloat(nutrition.calories) || 0;
        nutritionSummary.protein += parseFloat(nutrition.protein) || 0;
        nutritionSummary.fat += parseFloat(nutrition.fat) || 0;
        nutritionSummary.carbs += parseFloat(nutrition.carbs) || 0;
        nutritionSummary.fiber += parseFloat(nutrition.fiber) || 0;
        
        // 添加其他重要营养素
        nutritionSummary.calcium += parseFloat(nutrition.calcium) || 0;
        nutritionSummary.iron += parseFloat(nutrition.iron) || 0;
        nutritionSummary.folicAcid += parseFloat(nutrition.folicAcid) || 0;
        nutritionSummary.vitaminC += parseFloat(nutrition.vitaminC) || 0;
        nutritionSummary.vitaminE += parseFloat(nutrition.vitaminE) || 0;
      }
    });
    
    console.log('最终营养摘要:', nutritionSummary);

    // 创建或更新饮食计划
    const dietPlanDate = date ? new Date(date) : new Date();
    
    // 获取当天的开始和结束时间
    const startOfDay = new Date(dietPlanDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dietPlanDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log('查询饮食计划 - 用户ID:', userId, '日期范围:', startOfDay, '至', endOfDay);
    
    // 查询是否已存在当天的饮食计划
    let dietPlan = await DietPlan.findOne({
      userId: userId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    console.log('是否找到现有饮食计划:', Boolean(dietPlan));
    
    // 保存所有菜谱并获取ObjectId
    console.log('开始保存菜谱到数据库...');
    const mealObjectIds = {
      breakfast: await saveOrFindRecipe(mealPlan.breakfast, 'breakfast'),
      lunch: await saveOrFindRecipe(mealPlan.lunch, 'lunch'),
      dinner: await saveOrFindRecipe(mealPlan.dinner, 'dinner'),
      morningSnack: await saveOrFindRecipe(mealPlan.morningSnack, 'morningSnack'),
      afternoonSnack: await saveOrFindRecipe(mealPlan.afternoonSnack, 'afternoonSnack')
    };
    
    console.log('菜谱ObjectId:', {
      breakfast: mealObjectIds.breakfast?.toString() || 'null',
      lunch: mealObjectIds.lunch?.toString() || 'null',
      dinner: mealObjectIds.dinner?.toString() || 'null'
    });
    
    if (dietPlan) {
      // 更新现有计划
      console.log('更新现有饮食计划, ID:', dietPlan._id);
      dietPlan.meals = {
        breakfast: mealObjectIds.breakfast,
        lunch: mealObjectIds.lunch,
        dinner: mealObjectIds.dinner,
        morningSnack: mealObjectIds.morningSnack,
        afternoonSnack: mealObjectIds.afternoonSnack
      };
      dietPlan.nutritionSummary = nutritionSummary;
      await dietPlan.save();
    } else {
      // 创建新计划
      console.log('创建新的饮食计划');
      
      // 创建饮食计划数据
      const newDietPlan = {
        userId,
        date: dietPlanDate,
        meals: {
          breakfast: mealObjectIds.breakfast,
          lunch: mealObjectIds.lunch,
          dinner: mealObjectIds.dinner,
          morningSnack: mealObjectIds.morningSnack,
          afternoonSnack: mealObjectIds.afternoonSnack
        },
        nutritionSummary
      };
      
      console.log('创建新饮食计划, 数据结构:', JSON.stringify({
        userId: newDietPlan.userId,
        date: newDietPlan.date,
        nutritionSummary: newDietPlan.nutritionSummary
      }));
      
      dietPlan = await DietPlan.create(newDietPlan);
      console.log('新饮食计划已创建, ID:', dietPlan._id);
    }

    // 构建与前端期望格式匹配的饮食计划对象
    const formattedDietPlan = {
      _id: dietPlan._id.toString(),
      userId: dietPlan.userId.toString(),
      date: dietPlan.date.toISOString(), // 确保日期格式统一为ISO字符串
      breakfast: mealPlan.breakfast,
      morningSnack: mealPlan.morningSnack,
      lunch: mealPlan.lunch,
      afternoonSnack: mealPlan.afternoonSnack,
      dinner: mealPlan.dinner,
      nutritionSummary
    };
    
    // 打印最终生成的饮食计划格式
    console.log('返回给前端的饮食计划:', {
      id: formattedDietPlan._id,
      date: formattedDietPlan.date,
      breakfast: formattedDietPlan.breakfast ? formattedDietPlan.breakfast.name : 'undefined'
    });
    
    return NextResponse.json({
      message: '饮食计划生成成功',
      dietPlan: formattedDietPlan,
      success: true,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, must-revalidate'
      }
    });
  } catch (error: any) {
    console.error('生成饮食计划失败:', error);
    // 确保捕获所有错误，并始终返回JSON格式
    return NextResponse.json(
      { 
        error: `生成饮食计划失败: ${error.message || '未知错误'}`,
        timestamp: new Date().toISOString(),
        success: false
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } finally {
    const endTime = Date.now();
    console.log(`⏰ 处理完成，耗时: ${endTime - startTime}ms`);
  }
}
