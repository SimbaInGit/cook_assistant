"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

interface Profile {
  dueDate?: string;
  currentWeek?: number;
  allergies?: string[];
  dislikedFoods?: string[];
  healthConditions?: {
    gestationalDiabetes?: boolean;
    anemia?: boolean;
    hypertension?: boolean;
    other?: string;
  };
}

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 调用API获取用户档案数据
        const response = await fetch('/api/user/profile', {
          credentials: 'include',  // 确保发送cookie
          cache: 'no-store'  // 防止缓存
        });
        
        console.log('个人档案API响应状态:', response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            // 档案未设置，跳转到设置页面
            console.log('档案未设置，跳转到设置页面');
            router.push('/profile/setup');
            return;
          }
          const data = await response.json();
          throw new Error(data.error || '获取档案失败');
        }
        
        const data = await response.json();
        console.log('获取到的用户档案数据:', data);
        
        // 正确处理嵌套的数据结构
        if (data.user && data.user.healthInfo) {
          setProfile(data.user.healthInfo);
        } else {
          console.error('API返回的数据格式不正确:', data);
          throw new Error('档案数据格式不正确');
        }
      } catch (error) {
        console.error('获取用户档案失败:', error);
        setError('获取档案信息失败，请稍后再试');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [router]);
  
  // 将预产期格式化为人类可读的日期
  const formatDueDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // 计算当前孕周
  const calculatePregnancyWeek = (dueDate: string | undefined): string => {
    if (!dueDate) return '';
    
    const due = new Date(dueDate);
    const today = new Date();
    
    // 预产期一般是末次月经后40周
    const pregnancyDuration = 280; // 40周 * 7天
    
    // 计算距离预产期的天数差
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // 计算当前孕周
    const daysPregnant = pregnancyDuration - diffDays;
    const weeksPregnant = Math.ceil(daysPregnant / 7);
    const daysRemainder = daysPregnant % 7;
    
    return `${weeksPregnant}周${daysRemainder}天`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-heading font-bold text-primary-800 mb-6">个人档案</h1>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          ) : profile ? (
            <>
              <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
                <div className="px-6 py-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-lg font-semibold text-primary-700 mb-4">基本信息</h2>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">预产期</p>
                        <p className="text-lg">{formatDueDate(profile.dueDate)}</p>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">当前孕周</p>
                        <p className="text-lg font-medium">
                          {profile.currentWeek ? `${profile.currentWeek}周` : calculatePregnancyWeek(profile.dueDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold text-primary-700 mb-4">健康状况</h2>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">特殊健康状况</p>
                        <ul className="list-disc list-inside">
                          {profile.healthConditions?.gestationalDiabetes && (
                            <li className="text-gray-700">妊娠期糖尿病</li>
                          )}
                          {profile.healthConditions?.anemia && (
                            <li className="text-gray-700">贫血</li>
                          )}
                          {profile.healthConditions?.hypertension && (
                            <li className="text-gray-700">高血压</li>
                          )}
                          {profile.healthConditions?.other && (
                            <li className="text-gray-700">{profile.healthConditions.other}</li>
                          )}
                          {!profile.healthConditions?.gestationalDiabetes && 
                           !profile.healthConditions?.anemia && 
                           !profile.healthConditions?.hypertension && 
                           !profile.healthConditions?.other && (
                            <li className="text-gray-700">无</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold text-primary-700 mb-4">饮食偏好</h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">食物过敏</p>
                        {profile.allergies && profile.allergies.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {profile.allergies.map((allergy, index) => (
                              <li key={index} className="text-gray-700">{allergy}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-700">无</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">不喜欢的食物</p>
                        {profile.dislikedFoods && profile.dislikedFoods.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {profile.dislikedFoods.map((food, index) => (
                              <li key={index} className="text-gray-700">{food}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-700">无</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  <div className="flex justify-end">
                    <Link 
                      href="/profile/setup" 
                      className="btn-outline"
                    >
                      编辑档案
                    </Link>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-lg text-yellow-800 mb-4">您尚未设置个人档案</p>
              <Link href="/profile/setup" className="btn-primary">
                立即设置
              </Link>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
