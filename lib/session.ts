// lib/session.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_change_in_production';

// Cookie名称常量
const SESSION_COOKIE_NAME = 'userId';

// 会话类型定义
export interface UserSession {
  _id: string;
  id?: string; // 有些地方可能使用id而不是_id
  name: string;
  email: string;
  healthInfo?: {
    dueDate: string;
    currentWeek?: number;
    allergies?: string[];
    dislikedFoods?: string[];
    healthConditions?: {
      gestationalDiabetes?: boolean;
      anemia?: boolean;
      hypertension?: boolean;
      other?: string;
    };
  };
}

export interface Session {
  user: UserSession;
}

/**
 * 统一的会话Cookie配置
 * 确保login和signup使用完全一致的安全设置
 */
export function setSessionCookie(userId: string): void {
  cookies().set({
    name: SESSION_COOKIE_NAME,
    value: userId,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 一周
  });
}

/**
 * 清除会话Cookie
 */
export function clearSessionCookie(): void {
  cookies().set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });
}

/**
 * 从请求中获取会话信息
 */
export async function getSession(req: NextRequest): Promise<Session | null> {
  try {
    // 从cookie中获取userId
    const userId = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    
    if (!userId) {
      return null;
    }
    
    // 由于我们使用简单的userId cookie，不需要JWT验证
    // 创建简化的会话对象
    return {
      user: {
        _id: userId,
        name: '', // 这些字段会在实际使用时被填充
        email: ''
      }
    };
  } catch (error) {
    console.error('获取会话信息失败:', error);
    return null;
  }
}

/**
 * 从cookie中获取会话信息
 */
export async function getSessionFromCookies(): Promise<Session | null> {
  try {
    // 从cookie中获取userId
    const cookieStore = cookies();
    const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (!userId) {
      return null;
    }
    
    // 创建简化的会话对象
    return {
      user: {
        _id: userId,
        name: '', // 这些字段会在实际使用时被填充
        email: ''
      }
    };
  } catch (error) {
    console.error('获取会话信息失败:', error);
    return null;
  }
}
