import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 验证请求数据
    if (!email || !password) {
      return NextResponse.json(
        { error: '请提供电子邮箱和密码' },
        { status: 400 }
      );
    }

    // 连接数据库
    await connectToDatabase();

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      );
    }

    // 设置用户会话（此处简化处理，使用cookie）
    // 在实际项目中，建议使用更安全的方法，如JWT
    cookies().set({
      name: 'userId',
      value: user._id.toString(),
      httpOnly: true,
      path: '/',
      sameSite: 'lax', // 改为lax以允许跨站点导航
      secure: false, // 由于没使用HTTPS，必须设为false
      maxAge: 60 * 60 * 24 * 7, // 一周
    });
    
    // 添加调试日志
    console.log('用户登录成功，设置cookie:', {
      userId: user._id.toString(),
      name: user.name,
      email: user.email
    });

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
    
    // 返回成功响应（不包含密码）
    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(), // 确保返回字符串
        id: user._id.toString(),  // 同时提供id字段，因为一些前端可能使用id
        name: user.name,
        email: user.email,
        hasCompletedProfile: Boolean(user.healthInfo?.dueDate),
        healthInfo: user.healthInfo ? {
          dueDate: user.healthInfo.dueDate,
          currentWeek: user.healthInfo.currentWeek || currentWeek,
          allergies: user.healthInfo.allergies || [],
          dislikedFoods: user.healthInfo.dislikedFoods || [],
          healthConditions: user.healthInfo.healthConditions || {
            gestationalDiabetes: false,
            anemia: false,
            hypertension: false
          }
        } : undefined
      },
    });
  } catch (error) {
    console.error('用户登录失败:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后再试' },
      { status: 500 }
    );
  }
}
