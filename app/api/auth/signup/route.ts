import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // 验证请求数据
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '请提供所有必要信息' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: '密码长度至少为8个字符' },
        { status: 400 }
      );
    }

    // 连接数据库
    await connectToDatabase();

    // 检查用户是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 对密码进行加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // 设置用户会话（此处简化处理，使用cookie）
    // 在实际项目中，建议使用更安全的方法，如JWT
    cookies().set({
      name: 'userId',
      value: newUser._id.toString(),
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 一周
    });

    // 返回成功响应（不包含密码）
    return NextResponse.json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('注册用户失败:', error);
    return NextResponse.json(
      { error: '创建用户失败，请稍后再试' },
      { status: 500 }
    );
  }
}
