import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // 清除用户ID cookie
    cookies().delete('userId');

    // 返回成功响应
    return NextResponse.json(
      { 
        success: true,
        message: '退出登录成功' 
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );
  } catch (error) {
    console.error('退出登录时出错:', error);
    
    return NextResponse.json(
      { 
        error: '退出登录失败', 
        details: error instanceof Error ? error.message : '未知错误' 
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
