import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Recipe from '@/models/Recipe';

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    // 解码菜谱名称
    const recipeName = decodeURIComponent(params.name);
    console.log(`获取菜谱详情 - 名称: ${recipeName}`);
    
    // 连接数据库
    await connectToDatabase();
    
    // 根据名称查询菜谱
    const recipe = await Recipe.findOne({ name: recipeName });
    
    if (!recipe) {
      console.log(`未找到菜谱: ${recipeName}`);
      return NextResponse.json(
        { error: '未找到该菜谱' },
        { status: 404 }
      );
    }
    
    console.log(`成功获取菜谱: ${recipe.name}, ID: ${recipe._id}`);
    
    return NextResponse.json({ recipe });
  } catch (error) {
    console.error('获取菜谱详情时出错:', error);
    return NextResponse.json(
      { error: '获取菜谱详情失败' },
      { status: 500 }
    );
  }
}
