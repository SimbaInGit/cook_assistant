import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 提取userId cookie用于调试
  const userId = request.cookies.get('userId')?.value;
  
  // 记录每次访问的路径和cookie状态
  console.log(`[Middleware] 路径: ${request.nextUrl.pathname}, userId cookie: ${userId ? '存在' : '不存在'}`);
  
  // 处理受保护的路由
  const protectedRoutes = ['/dashboard', '/profile', '/profile/setup', '/knowledge'];
  
  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (!userId) {
      console.log('[Middleware] 未找到userId cookie, 重定向到登录页');
      // 未登录时重定向到登录页
      return NextResponse.redirect(new URL('/auth/login', request.url));
    } else {
      console.log('[Middleware] 用户已登录，允许访问受保护页面');
    }
  }
  
  // 如果是登录页面但已经登录，重定向到仪表盘
  if (request.nextUrl.pathname === '/auth/login' && userId) {
    console.log('[Middleware] 用户已登录但访问登录页，重定向到仪表盘');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// 配置仅对这些路径运行中间件
export const config = {
  matcher: ['/(dashboard|profile|auth/login|knowledge)(:path*)?'],
};
