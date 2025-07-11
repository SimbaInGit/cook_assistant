"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userCompletedProfile, setUserCompletedProfile] = useState(false);
  
  useEffect(() => {
    // 检查用户是否已登录和是否已完成档案设置
    const checkUserAuth = async () => {
      try {
        const response = await fetch('/api/user/status');
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data.isLoggedIn);
          setUserCompletedProfile(data.hasCompletedProfile);
        }
      } catch (error) {
        console.error('获取用户状态失败', error);
      }
    };
    
    checkUserAuth();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* 英雄区域 */}
        <section className="relative bg-gradient-to-b from-primary-50 to-white py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-800 mb-4">
                  健康饮食，快乐孕期
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8">
                  为准父母提供科学、安全、美味的孕期饮食建议，帮您轻松规划每日餐食
                </p>
                
                {isLoggedIn ? (
                  userCompletedProfile ? (
                    <Link href="/dashboard" className="btn-primary inline-block">
                      进入我的饮食助手
                    </Link>
                  ) : (
                    <Link href="/profile/setup" className="btn-primary inline-block">
                      完成个人档案设置
                    </Link>
                  )
                ) : (
                  <div className="space-x-4">
                    <Link href="/auth/signup" className="btn-primary inline-block">
                      免费注册
                    </Link>
                    <Link href="/auth/login" className="btn-outline inline-block">
                      登录
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="md:w-1/2">
                <div className="relative w-full h-64 md:h-96">
                  <Image 
                    src="/images/portal/healthy_pregnant_woman.jpeg"
                    alt="孕妇健康饮食" 
                    fill
                    style={{objectFit: "cover"}}
                    className="rounded-lg shadow-xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* 核心功能介绍 */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-primary-800 mb-12">
              孕期饮食，我们为您考虑一切
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-primary-800 mb-2">个性化推荐</h3>
                <p className="text-gray-600">
                  根据您的孕周、健康状况和口味喜好，为您量身定制每日饮食计划
                </p>
              </div>
              
              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-primary-800 mb-2">安全可靠</h3>
                <p className="text-gray-600">
                  所有饮食建议基于权威孕期营养指南，自动过滤孕期禁忌食物
                </p>
              </div>
              
              <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-primary-800 mb-2">便捷实用</h3>
                <p className="text-gray-600">
                  一键生成一日三餐食谱，详细展示食材、做法和营养分析
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* 产品特色 */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-primary-800 mb-12">
              您的孕期营养顾问
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative w-full h-64 md:h-96">
                  <Image 
                    src="/images/portal/healthy_food.jpeg"
                    alt="孕期营养食谱" 
                    fill
                    style={{objectFit: "cover"}}
                    className="rounded-lg shadow-lg"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold text-primary-700 mb-4">科学的饮食计划</h3>
                <p className="text-gray-600 mb-6">
                  我们的AI智能引擎会根据《中国居民膳食指南》为您推荐适合不同孕周阶段的营养食谱，保证母婴所需的各项营养素摄入均衡。
                </p>
                
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <span>一日三餐营养均衡，确保蛋白质、维生素、矿物质等摄入合理</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <span>自动调整不同孕期的营养重点，如早期补充叶酸，晚期增加钙质</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <span>智能考虑特殊健康状况，如妊娠期糖尿病的低糖饮食方案</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* 号召行动 */}
        <section className="py-16 bg-primary-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-800 mb-4">
              开始您的健康孕期饮食之旅
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              每一天的健康饮食都是给宝宝和自己的珍贵礼物，让我们一起用科学的方式呵护这段美好时光
            </p>
            
            <Link href={isLoggedIn ? "/dashboard" : "/auth/signup"} className="btn-primary text-lg px-8 py-3">
              {isLoggedIn ? "进入我的饮食助手" : "立即免费注册"}
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
