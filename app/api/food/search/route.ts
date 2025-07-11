import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import FoodSafety from '@/models/FoodSafety';

// 处理GET请求，搜索食物安全数据
export async function GET(request: Request) {
  try {
    // 从URL参数获取搜索关键词
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json(
        { error: '请提供搜索关键词' },
        { status: 400 }
      );
    }
    
    // 连接数据库
    await connectToDatabase();
    
    // 使用文本搜索查询食物安全数据
    const foods = await FoodSafety.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } } // 添加文本相关性分数
    )
    .sort({ score: { $meta: 'textScore' } }) // 按相关性排序
    .limit(20); // 限制结果数量
    
    if (foods.length === 0) {
      // 如果文本搜索未找到结果，尝试模糊匹配
      const fuzzyFoods = await FoodSafety.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }).limit(20);
      
      if (fuzzyFoods.length === 0) {
        return NextResponse.json({
          message: '未找到匹配的食物',
          foods: []
        });
      }
      
      return NextResponse.json({ foods: fuzzyFoods });
    }
    
    return NextResponse.json({ foods });
    
  } catch (error) {
    console.error('搜索食物安全数据失败:', error);
    return NextResponse.json(
      { error: '搜索食物安全数据失败' },
      { status: 500 }
    );
  }
}
