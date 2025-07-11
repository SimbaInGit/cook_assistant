import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Recipe from '@/models/Recipe';

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const trimester = searchParams.get('trimester');
    const search = searchParams.get('search');
    
    // 构建查询条件
    const query: any = {};
    
    // 如果指定了分类
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // 如果指定了孕期
    if (trimester && trimester !== 'all') {
      query[`trimesterSuitability.${trimester}`] = true;
    }
    
    // 如果有搜索关键词
    if (search) {
      query.name = { $regex: search, $options: 'i' }; // 不区分大小写的模糊搜索
    }
    
    // 连接数据库
    await connectToDatabase();
    
    // 查询菜谱列表，限制返回字段减轻负载
    const recipes = await Recipe.find(
      query,
      {
        name: 1,
        category: 1,
        image: 1,
        preparationTime: 1,
        cookingTime: 1,
        'nutrition.calories': 1,
        'nutrition.protein': 1,
        'nutrition.fat': 1,
        'nutrition.carbs': 1,
        isPregnancySafe: 1,
        trimesterSuitability: 1
      }
    ).sort({ createdAt: -1 }); // 按创建时间降序排列，最新的菜谱排在前面
    
    console.log(`获取菜谱列表成功，共 ${recipes.length} 个菜谱`);
    
    // 返回菜谱列表
    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('获取菜谱列表时出错:', error);
    return NextResponse.json(
      { error: '获取菜谱列表失败' },
      { status: 500 }
    );
  }
}
