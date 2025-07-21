import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 提取userId cookie用于调试
  const userId = request.cookies.get('userId')?.value;
  
  // 记录每次访问的路径和cookie状态
  console.log(`[Middleware] 路径: ${request.nextUrl.pathname}, userId cookie: ${userId ? '存在' : '不存在'}`);
  
  // 仅对仪表板页面进行处理
  if (request.nextUrl.pathname === '/dashboard') {
    if (!userId) {
      console.log('[Middleware] 未找到userId cookie, 重定向到登录页');
      // 未登录时重定向到登录页
      return NextResponse.redirect(new URL('/auth/login', request.url));
    } else {
      console.log('[Middleware] 用户已登录，允许访问仪表板');
    }
  }
  
  return NextResponse.next();
}

// 配置仅对这些路径运行中间件
export const config = {
  matcher: ['/dashboard', '/profile/:path*'],
};
