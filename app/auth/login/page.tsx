"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export default function Login() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      // 验证表单
      if (!formData.email || !formData.password) {
        throw new Error('请填写所有必填项');
      }
      
      console.log('登录请求开始');
      
      // 调用API进行用户验证
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include', // 确保包含凭证
      });
      
      console.log('登录响应状态码:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '登录失败');
      }
      
      // 获取用户数据 - 注意：response.json()只能调用一次，因为它会消耗流
      const userData = await response.json();
      console.log('登录成功，用户数据:', userData);
      
      // 直接跳转到仪表盘，无需弹窗
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('登录错误:', error);
      setError(error instanceof Error ? error.message : '登录失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 登录状态检查
  useEffect(() => {
    // 检查是否已登录
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/user/status', {
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.isLoggedIn) {
            console.log('用户已登录，跳转到仪表板');
            window.location.href = '/dashboard';
          }
        }
      } catch (error) {
        console.error('检查登录状态出错:', error);
      }
    };
    
    checkLoginStatus();
  }, []);
  
  // 登出逻辑已简化，不再检查退出登录状态
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-primary-800">登录账户</h1>
            <p className="text-gray-600 mt-2">欢迎回来，继续您的孕期饮食旅程</p>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  电子邮箱
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    记住我
                  </label>
                </div>
                
                <div className="text-sm">
                  <Link href="/auth/forgot-password" className="text-primary-600 hover:underline">
                    忘记密码？
                  </Link>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    登录中...
                  </span>
                ) : '登录'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                还没有账户？{' '}
                <Link href="/auth/signup" className="text-primary-600 hover:underline">
                  立即注册
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
