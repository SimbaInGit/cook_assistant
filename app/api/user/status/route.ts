import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { cookies } from 'next/headers';

// 处理GET请求，获取用户认证和个人资料完成状态
export async function GET() {
  try {
    // 获取用户cookie
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    
    console.log('检查用户状态, userId cookie:', userId);
    
    if (!userId) {
      console.log('未找到userId cookie, 用户未登录');
      return NextResponse.json({
        isLoggedIn: false,
        hasCompletedProfile: false,
      });
    }
    
    // 连接数据库并验证用户
    await connectToDatabase();
    const user = await User.findById(userId);
    
    if (!user) {
      // 用户不存在，清除cookie
      cookies().delete('userId');
      return NextResponse.json({
        isLoggedIn: false,
        hasCompletedProfile: false,
      });
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
    
    return NextResponse.json({
      isLoggedIn: true,
      hasCompletedProfile: Boolean(user.healthInfo?.dueDate),
      user: {
        _id: user._id.toString(), // 确保返回字符串
        id: user._id.toString(),  // 同时提供id字段，因为一些前端可能使用id
        name: user.name,
        email: user.email,
        healthInfo: user.healthInfo ? {
          dueDate: user.healthInfo.dueDate instanceof Date ? user.healthInfo.dueDate.toISOString() : user.healthInfo.dueDate,
          currentWeek: user.healthInfo.currentWeek || currentWeek,
          allergies: user.healthInfo.allergies || [],
          dislikedFoods: user.healthInfo.dislikedFoods || [],
          healthConditions: user.healthInfo.healthConditions || {
            gestationalDiabetes: false,
            anemia: false,
            hypertension: false
          }
        } : undefined
      }
    });
  } catch (error) {
    console.error('获取用户状态失败:', error);
    return NextResponse.json(
      { error: '获取用户状态失败' },
      { status: 500 }
    );
  }
}
