import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import DietPlan from '@/models/DietPlan';
import Recipe from '@/models/Recipe';
import { getSession } from '@/lib/session';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    
    // 尝试获取用户ID，首先尝试从会话中获取
    let userId: string | undefined;
    
    // 尝试从会话中获取
    const session = await getSession(request);
    if (session?.user?._id) {
      userId = session.user._id;
    }
    
    // 如果会话中没有，直接从cookies获取
    if (!userId) {
      userId = request.cookies.get('userId')?.value;
    }
    
    // 检查是否有用户ID
    if (!userId) {
      return NextResponse.json(
        { error: '需要登录才能访问此资源' },
        { status: 401 }
      );
    }
    
    // 连接数据库
    await connectToDatabase();
    
    // 查询条件
    const query: any = { userId };
    
    // 如果指定了日期，添加到查询条件
    if (date) {
      // 创建指定日期的开始和结束
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.date = { 
        $gte: startDate,
        $lte: endDate
      };
    }
    
    // 查询饮食计划
    const dietPlan = await DietPlan.findOne(query).sort({ date: -1 });
    
    if (!dietPlan) {
      return NextResponse.json(
        { message: '未找到饮食计划' },
        { status: 404 }
      );
    }
    
    // 获取饮食计划中餐食的ObjectId，并获取相应的Recipe数据
    const mealIds = {
      breakfast: dietPlan.meals?.breakfast,
      lunch: dietPlan.meals?.lunch,
      dinner: dietPlan.meals?.dinner,
      morningSnack: dietPlan.meals?.morningSnack,
      afternoonSnack: dietPlan.meals?.afternoonSnack
    };
    
    // 异步获取餐食数据
    const getMealData = async (mealId: any) => {
      if (!mealId) return null;
      try {
        // 如果是ObjectId，则查询Recipe模型
        if (mongoose.Types.ObjectId.isValid(mealId)) {
          const recipe = await Recipe.findById(mealId);
          return recipe?.toObject() || null;
        }
        // 如果已经是对象，直接返回
        if (typeof mealId === 'object') {
          return mealId;
        }
        return null;
      } catch (error) {
        console.error('获取餐食数据失败:', error);
        return null;
      }
    };
    
    // 异步获取所有餐食数据
    const [breakfast, morningSnack, lunch, afternoonSnack, dinner] = await Promise.all([
      getMealData(mealIds.breakfast),
      getMealData(mealIds.morningSnack),
      getMealData(mealIds.lunch),
      getMealData(mealIds.afternoonSnack),
      getMealData(mealIds.dinner)
    ]);

    // 格式化返回的数据结构，保持与生成API一致的格式
    const formattedDietPlan = {
      _id: dietPlan._id.toString(),
      userId: dietPlan.userId.toString(),
      date: dietPlan.date.toISOString(), // 确保日期格式统一为ISO字符串
      breakfast,
      morningSnack,
      lunch,
      afternoonSnack,
      dinner,
      nutritionSummary: dietPlan.nutritionSummary
    };
    
    console.log('返回格式化后的饮食计划:', {
      id: formattedDietPlan._id,
      date: formattedDietPlan.date,
      breakfast: formattedDietPlan.breakfast ? formattedDietPlan.breakfast.name : 'undefined'
    });
    
    return NextResponse.json({ dietPlan: formattedDietPlan });
    
  } catch (error) {
    console.error('获取饮食计划时出错:', error);
    return NextResponse.json(
      { error: '获取饮食计划失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
