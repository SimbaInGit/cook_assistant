import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // 获取用户cookie
    const userId = cookies().get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      );
    }
    
    // 连接数据库并获取用户档案
    await connectToDatabase();
    const user = await User.findById(userId);
    
    if (!user) {
      // 用户不存在，清除cookie
      cookies().delete('userId');
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 检查用户是否设置了健康信息
    if (!user.healthInfo || !user.healthInfo.dueDate) {
      return NextResponse.json(
        { error: '尚未设置个人档案', hasProfile: false },
        { status: 404 }
      );
    }
    
    // 计算当前孕周
    let currentWeek = 0;
    if (user.healthInfo?.dueDate) {
      const dueDate = new Date(user.healthInfo.dueDate);
      const today = new Date();
      const totalDaysInPregnancy = 280; // 40周 * 7天
      
      // 计算预产期到今天的天数差
      const daysToGo = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // 计算当前孕周
      currentWeek = Math.ceil((totalDaysInPregnancy - daysToGo) / 7);
      
      // 确保周数在合理范围内
      if (currentWeek < 1) currentWeek = 1;
      if (currentWeek > 42) currentWeek = 42;
    }
    
    // 返回用户信息和健康信息
    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        healthInfo: {
          dueDate: user.healthInfo.dueDate instanceof Date ? user.healthInfo.dueDate.toISOString() : user.healthInfo.dueDate,
          currentWeek: user.healthInfo.currentWeek || currentWeek,
          allergies: user.healthInfo.allergies || [],
          dislikedFoods: user.healthInfo.dislikedFoods || [],
          healthConditions: user.healthInfo.healthConditions || {
            gestationalDiabetes: false,
            anemia: false,
            hypertension: false
          }
        }
      }
    });
  } catch (error) {
    console.error('获取用户档案出错:', error);
    return NextResponse.json(
      { error: '获取用户档案失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 获取用户cookie
    const userId = cookies().get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      );
    }
    
    // 获取请求体
    const profileData = await request.json();
    
    // 验证必填数据
    if (!profileData.dueDate) {
      return NextResponse.json(
        { error: '预产期是必填项' },
        { status: 400 }
      );
    }
    
    // 连接数据库
    await connectToDatabase();
    
    // 更新用户档案
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        healthInfo: {
          dueDate: new Date(profileData.dueDate),
          allergies: Array.isArray(profileData.allergies) ? profileData.allergies : [],
          dislikedFoods: Array.isArray(profileData.dislikedFoods) ? profileData.dislikedFoods : [],
          healthConditions: profileData.healthConditions || {}
        } 
      },
      { new: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 返回成功响应
    return NextResponse.json({ 
      success: true,
      message: '个人档案已保存'
    });
  } catch (error) {
    console.error('保存用户档案出错:', error);
    return NextResponse.json(
      { error: '保存用户档案失败' },
      { status: 500 }
    );
  }
}
