"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { fixImageUrl } from '@/lib/utils/image';
import RecipeImage from '@/components/recipes/RecipeImage';

// 定义类型
interface User {
  _id: string;
  name: string;
  email: string;
  healthInfo: {
    dueDate: string;
    currentWeek: number;
    allergies: string[];
    dislikedFoods: string[];
    healthConditions: {
      gestationalDiabetes: boolean;
      anemia: boolean;
      hypertension: boolean;
    }
  }
}

interface Ingredient {
  name: string;
  amount: string;
}

interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  calcium: number;
  iron: number;
}

interface Meal {
  name: string;
  image: string;
  ingredients: Ingredient[];
  nutrition: Nutrition;
}

interface DietPlan {
  _id?: string;
  userId?: string;
  date: string | Date;
  breakfast: Meal;
  morningSnack: Meal;
  lunch: Meal;
  afternoonSnack: Meal;
  dinner: Meal;
  nutritionSummary: Nutrition;
}

// 餐食卡片组件接口
interface MealCardProps {
  title: string;
  time: string;
  meal: Meal;
}

// 餐食卡片组件
function MealCard({ title, time, meal }: MealCardProps): React.ReactNode {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!meal) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <span className="text-sm text-gray-500">{time}</span>
        </div>
        <div className="text-center py-6">
          <p className="text-gray-400">暂无餐食信息</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* 餐食图片（如果有） */}
      <div className="relative h-48 w-full">
        <RecipeImage
          src={fixImageUrl(meal.image, meal.name)}
          alt={meal.name}
          fill
        />
      </div>
      
      {/* 餐食信息 */}
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <span className="text-sm text-gray-500">{time}</span>
        </div>
        
        <h4 className="text-xl font-bold text-primary-600 mb-3">{meal.name}</h4>
        
        {/* 营养数据 */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
          <div>
            <span className="text-gray-500">热量:</span>
            <span className="font-medium ml-1">{Number(meal.nutrition.calories || 0).toFixed(0)}千卡</span>
          </div>
          <div>
            <span className="text-gray-500">蛋白质:</span>
            <span className="font-medium ml-1">{Number(meal.nutrition.protein || 0).toFixed(1)}g</span>
          </div>
          <div>
            <span className="text-gray-500">碳水:</span>
            <span className="font-medium ml-1">{Number(meal.nutrition.carbs || 0).toFixed(1)}g</span>
          </div>
          <div>
            <span className="text-gray-500">脂肪:</span>
            <span className="font-medium ml-1">{Number(meal.nutrition.fat || 0).toFixed(1)}g</span>
          </div>
          <div>
            <span className="text-gray-500">纤维:</span>
            <span className="font-medium ml-1">{Number(meal.nutrition.fiber || 0).toFixed(1)}g</span>
          </div>
          {meal.nutrition.calcium > 0 && (
            <div>
              <span className="text-gray-500">钙:</span>
              <span className="font-medium ml-1">{Number(meal.nutrition.calcium).toFixed(0)}mg</span>
            </div>
          )}
          {meal.nutrition.iron > 0 && (
            <div>
              <span className="text-gray-500">铁:</span>
              <span className="font-medium ml-1">{Number(meal.nutrition.iron).toFixed(1)}mg</span>
            </div>
          )}
        </div>
        
        {/* 详情切换按钮 */}
        <button 
          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '收起详情' : '查看详情'}
          <svg 
            className={`ml-1 w-4 h-4 transform ${showDetails ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        {/* 详细信息 */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {/* 食材清单 */}
            <div className="mb-4">
              <h5 className="font-semibold text-gray-700 mb-2">食材:</h5>
              <ul className="space-y-1">
                {meal.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-sm text-gray-600 flex justify-between">
                    <span>{ingredient.name}</span>
                    <span>{ingredient.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* 查看完整菜谱链接 */}
            <Link 
              href={`/recipes/${encodeURIComponent(meal.name)}`}
              className="btn-outline w-full text-center text-sm"
            >
              查看完整菜谱
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard(): React.ReactNode {
  const [user, setUser] = useState<User | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const [error, setError] = useState<string | null>(null);
  
  // 获取用户状态和信息
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        console.log('开始获取用户数据...');
        
        // 获取用户状态
        const statusResponse = await fetch('/api/user/status', {
          credentials: 'include', // 确保发送cookie
          cache: 'no-store' // 防止缓存
        });
        
        console.log('状态API响应状态:', statusResponse.status);
        
        if (!statusResponse.ok) {
          throw new Error('未登录或会话已过期');
        }
        
        const statusData = await statusResponse.json();
        console.log('状态API返回数据:', JSON.stringify(statusData, null, 2));
        
        if (!statusData.isLoggedIn) {
          console.log('用户未登录，重定向至登录页');
          window.location.href = '/login';
          return;
        }
        
        // 获取用户详细信息
        // 如果状态API已返回用户基本信息，先设置
        if (statusData.user) {
          const userId = statusData.user.id || statusData.user._id;
          console.log('从状态API获取到用户ID:', userId);
          
          // 调试用户数据
          debugObject(statusData.user, "状态API返回的用户数据");
          
          if (statusData.user.healthInfo) {
            debugObject(statusData.user.healthInfo, "状态API返回的健康信息");
          }
          
          // 完整的用户对象应该从状态API中获取
          setUser({
            _id: userId,
            name: statusData.user.name,
            email: statusData.user.email,
            healthInfo: statusData.user.healthInfo || {
              dueDate: '', 
              currentWeek: 0,
              allergies: [],
              dislikedFoods: [],
              healthConditions: {
                gestationalDiabetes: false,
                anemia: false,
                hypertension: false
              }
            }
          });
          
          console.log('已设置用户信息到状态');
        }
        
        // 获取用户健康档案（如果状态API没有返回健康信息）
        if (!statusData.user?.healthInfo) {
          const profileResponse = await fetch('/api/user/profile', {
            credentials: 'include', // 确保发送cookie
            cache: 'no-store' // 防止缓存
          });
          
          console.log('档案API响应状态:', profileResponse.status);
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('档案API返回数据:', JSON.stringify(profileData, null, 2));
            
            if (profileData.user && profileData.user.healthInfo) {
              debugObject(profileData.user.healthInfo, "档案API返回的健康信息");
            
              // 合并状态API和档案API的数据
              setUser(prev => {
                if (!prev) return null;
                
                return {
                  ...prev,
                  healthInfo: profileData.user.healthInfo
                };
              });
            } else {
              console.log('档案API返回数据中没有健康信息');
            }
          } else if (profileResponse.status === 404) {
            console.log('用户尚未设置健康档案');
          } else {
            console.error('获取档案失败:', profileResponse.status);
          }
        }
        
        // 获取今日饮食计划
        await fetchTodayDietPlan();
        
      } catch (error) {
        console.error('获取用户数据错误:', error);
        setError(error instanceof Error ? error.message : '获取数据失败');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // 获取今日饮食计划
  const fetchTodayDietPlan = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('获取日期为', today, '的饮食计划');
      
      // 添加认证相关信息
      const response = await fetch(`/api/diet/plan?date=${today}`, {
        credentials: 'include', // 确保发送cookie
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store' // 禁用缓存
      });
      
      console.log('获取饮食计划响应状态:', response.status);
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('解析饮食计划响应失败:', parseError);
        const text = await response.text();
        console.error('原始响应内容:', text.substring(0, 200) + '...');
        throw new Error('无法解析服务器响应数据');
      }
      console.log('获取饮食计划响应数据:', data);
      
      if (response.ok) {
        if (data.dietPlan) {
          console.log('成功获取饮食计划:', data.dietPlan);
          
          // 检查营养信息是否完整
          if (data.dietPlan.breakfast) {
            console.log('早餐营养成分:', data.dietPlan.breakfast.nutrition);
          }
          
          // 记录所有餐食中的营养成分数据可用性
          ['breakfast', 'lunch', 'dinner', 'morningSnack', 'afternoonSnack'].forEach(mealType => {
            const meal = data.dietPlan[mealType];
            if (meal && meal.nutrition) {
              const nutrition = meal.nutrition;
              console.log(`${mealType} 营养成分数据:`, {
                calories: nutrition.calories !== undefined ? '✓' : '✗',
                protein: nutrition.protein !== undefined ? '✓' : '✗',
                fat: nutrition.fat !== undefined ? '✓' : '✗', 
                carbs: nutrition.carbs !== undefined ? '✓' : '✗',
                fiber: nutrition.fiber !== undefined ? '✓' : '✗',
                calcium: nutrition.calcium !== undefined ? '✓' : '✗',
                iron: nutrition.iron !== undefined ? '✓' : '✗'
              });
            } else {
              console.log(`${mealType} 缺少营养成分数据`);
            }
          });
          
          setDietPlan(data.dietPlan);
        } else {
          console.log('响应中没有找到饮食计划数据');
        }
      } else if (response.status === 404) {
        // 404 意味着没有找到计划，这是正常的情况
        console.log('没有找到今日饮食计划，可以点击按钮生成新计划');
      } else if (response.status === 401) {
        // 401表示未授权，可能是会话过期
        console.error('会话已过期，请重新登录');
        setError('您的登录会话已过期，即将重定向到登录页面');
        // 重定向到登录页面
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      } else {
        // 其他错误
        console.error('获取饮食计划错误:', data.error || data.message || '未知错误');
        throw new Error(data.error || data.message || '获取饮食计划失败');
      }
    } catch (error) {
      console.error('获取饮食计划错误:', error);
      setError(error instanceof Error ? error.message : '获取饮食计划时出现未知错误');
    }
  };
  
  // 添加调试函数
  const debugObject = (obj: any, label: string = '调试对象'): void => {
    console.log(`============= ${label} =============`);
    if (obj === null) {
      console.log('对象为null');
      return;
    }
    if (obj === undefined) {
      console.log('对象为undefined');
      return;
    }
    
    try {
      const keys = Object.keys(obj);
      console.log(`类型: ${typeof obj}, 属性数量: ${keys.length}`);
      
      for (const key of keys) {
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
          console.log(`${key}: [对象] ${Array.isArray(value) ? '数组' : '对象'}`);
        } else if (value instanceof Date) {
          console.log(`${key}: [Date] ${value.toISOString()}`);
        } else {
          console.log(`${key}: [${typeof value}] ${String(value)}`);
        }
      }
    } catch (error) {
      console.error(`调试对象出错:`, error);
    }
    console.log('====================================');
  };

  // 生成新的饮食计划或替换现有计划
  const generateNewPlan = async () => {
    // 检查是否已有饮食计划，设置操作文本
    const isReplace = !!dietPlan;
    const actionText = isReplace ? "重新生成" : "生成";
    
    console.log(`🔄 开始${actionText}饮食计划 - ${new Date().toLocaleString()}`);
    
    // 检查用户状态
    debugObject(user, `${actionText}计划前的用户状态`);
    
    if (!user || !user._id) {
      console.error('❌ 用户信息不完整:', user);
      
      // 尝试重新获取用户状态，防止状态丢失
      try {
        console.log('🔍 尝试恢复用户状态...');
        const refreshStatus = await fetch('/api/user/status', {
          credentials: 'include', 
          cache: 'no-store' 
        });
        
        if (refreshStatus.ok) {
          const refreshData = await refreshStatus.json();
          if (refreshData.user && (refreshData.user._id || refreshData.user.id)) {
            // 发现用户ID，临时恢复用户状态
            const tempId = refreshData.user._id || refreshData.user.id;
            console.log('✅ 从API恢复用户ID:', tempId);
            
            setUser({
              _id: tempId,
              name: refreshData.user.name || 'User',
              email: refreshData.user.email || '',
              healthInfo: refreshData.user.healthInfo || {
                dueDate: '',
                currentWeek: 0,
                allergies: [],
                dislikedFoods: [],
                healthConditions: {}
              }
            });
            
            // 使用恢复的用户ID继续操作
            await new Promise(resolve => setTimeout(resolve, 300)); // 短暂延迟确保状态更新
            console.log('✅ 用户状态已恢复，继续操作');
          } else {
            setError('用户信息不存在或不完整，请重新登录');
            return;
          }
        } else {
          setError('用户信息不存在或不完整，请重新登录');
          return;
        }
      } catch (error) {
        console.error('❌ 恢复用户状态失败:', error);
        setError('用户信息不存在，请重新登录');
        return;
      }
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // 再次检查用户状态（可能已被上面的恢复逻辑更新）
      const safeUserId = user?._id?.toString() || '';
      console.log(`📝 正在${isReplace ? '重新生成' : '生成'}饮食计划...用户ID:`, safeUserId);
      
      if (!safeUserId) {
        throw new Error('用户ID无效，请重新登录');
      }
      
      // 构建请求体
      const requestBody = { 
        userId: safeUserId,
        date: new Date().toISOString(),
        replace: isReplace  // 添加标志以区分新建与替换
      };
      
      // 打印完整的请求体，便于调试
      console.log('📦 请求体:', JSON.stringify(requestBody));
      
      const startTime = Date.now();
      console.log(`⏱️ API调用开始时间: ${new Date(startTime).toLocaleTimeString()}`);
      
      const response = await fetch('/api/diet/generate', {
        method: 'POST',
        credentials: 'include', // 确保发送cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const endTime = Date.now();
      console.log(`⏱️ API调用结束时间: ${new Date(endTime).toLocaleTimeString()}, 用时: ${endTime - startTime}ms`);
      
      // 获取响应数据
      let data;
      try {
        // 首先检查状态码
        if (!response.ok) {
          // 对于非2xx响应，先尝试解析为JSON
          try {
            data = await response.json();
          } catch (e) {
            // 如果不是JSON，获取文本内容
            const text = await response.text();
            console.error('API响应不是有效的JSON:', text.substring(0, 200) + '...');
            throw new Error(`服务器返回状态码 ${response.status}`);
          }
          throw new Error(data.error || data.message || `服务器返回状态码 ${response.status}`);
        }
        
        // 尝试解析成功响应
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // 如果不是JSON，获取文本内容
          const text = await response.text();
          console.error('API响应不是有效的JSON:', text.substring(0, 200) + '...');
          throw new Error('服务器返回了非JSON格式数据');
        }
      } catch (parseError) {
        console.error('解析API响应失败:', parseError);
        throw new Error('无法解析服务器响应: ' + (parseError instanceof Error ? parseError.message : '未知错误'));
      }
      console.log('🔍 API响应状态:', response.status);
      console.log('📄 API响应数据摘要:', {
        success: response.ok,
        message: data.message,
        hasDietPlan: !!data.dietPlan,
        date: data.dietPlan?.date
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // 会话过期，重定向到登录页
          console.error('会话已过期，请重新登录');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          throw new Error('会话已过期，请重新登录');
        } else if (response.status === 404) {
          throw new Error('用户不存在');
        } else if (response.status === 400) {
          throw new Error(data.error || '请求参数错误');
        }
        
        throw new Error(data.message || data.error || '生成饮食计划失败');
      }
      
      if (data && data.dietPlan) {
        if (isReplace) {
          console.log('成功更新饮食计划:', data.dietPlan);
        } else {
          console.log('成功生成新的饮食计划:', data.dietPlan);
        }
        
        // 确保所有必要的数据结构都存在
        const validatedDietPlan = {
          ...data.dietPlan,
          breakfast: data.dietPlan.breakfast || { name: '暂无早餐数据', ingredients: [], nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 } },
          lunch: data.dietPlan.lunch || { name: '暂无午餐数据', ingredients: [], nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 } },
          dinner: data.dietPlan.dinner || { name: '暂无晚餐数据', ingredients: [], nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 } },
          morningSnack: data.dietPlan.morningSnack || { name: '暂无上午加餐数据', ingredients: [], nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 } },
          afternoonSnack: data.dietPlan.afternoonSnack || { name: '暂无下午加餐数据', ingredients: [], nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 } },
          nutritionSummary: data.dietPlan.nutritionSummary || { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
        };
        
        // 更新状态
        setDietPlan(validatedDietPlan);
        
        // 显示成功消息
        setError(null);
        
        // 重新获取今天的饮食计划以刷新界面
        setTimeout(() => {
          fetchTodayDietPlan();
        }, 500);
      } else {
        console.error('API返回数据缺少dietPlan字段:', data);
        throw new Error('服务器返回的数据格式不正确，缺少饮食计划信息');
      }
      
    } catch (error) {
      console.error('生成饮食计划错误:', error);
      setError(error instanceof Error ? error.message : '生成饮食计划失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 格式化日期显示
  const formatDate = (dateString: string | Date): string => {
    try {
      // 检查日期是否为有效值
      if (!dateString) {
        return '未设置日期';
      }
      
      // 尝试转换为日期对象
      const date = new Date(dateString);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.error('无效的日期值:', dateString);
        return '无效日期';
      }
      
      return format(date, 'yyyy年MM月dd日', { locale: zhCN });
    } catch (error) {
      console.error('日期格式化错误:', error, '原始值:', dateString);
      return '日期错误';
    }
  };
  
  // 根据预产期计算当前孕周
  const calculateCurrentWeek = (dueDate: string): number => {
    if (!dueDate) return 0;
    
    try {
      const due = new Date(dueDate);
      const today = new Date();
      const totalDaysInPregnancy = 280; // 40周 * 7天
      
      // 计算预产期到今天的天数差
      const daysToGo = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // 计算当前孕周
      let currentWeek = Math.ceil((totalDaysInPregnancy - daysToGo) / 7);
      
      // 确保周数在合理范围内
      if (currentWeek < 1) currentWeek = 1;
      if (currentWeek > 42) currentWeek = 42;
      
      return currentWeek;
    } catch (error) {
      console.error('计算孕周出错:', error);
      return 0;
    }
  };
  
  // 加载状态
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg text-gray-600">加载中，请稍候...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // 错误状态
  if (error && !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">出错了</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/" className="btn-primary">
              返回首页
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* 用户信息卡片 */}
          {user && (
            <section className="mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                      👋 {user.name}，今天是 {formatDate(new Date())}
                    </h2>
                    <p className="text-gray-600">
                      您现在怀孕 <span className="font-semibold text-primary-600">{user.healthInfo?.currentWeek || 0}</span> 周，
                      预产期是 <span className="font-semibold text-primary-600">
                        {user.healthInfo?.dueDate ? formatDate(user.healthInfo.dueDate) : '未设置'}
                      </span>
                    </p>
                    {/* 添加调试信息，帮助诊断问题 */}
                    {process.env.NODE_ENV !== 'production' && (
                      <div className="text-xs text-gray-400 mt-1">
                        用户ID: {user._id} | 预产期原始值: {String(user.healthInfo?.dueDate || 'undefined')}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <button
                      className="btn-primary text-lg flex items-center justify-center"
                      onClick={generateNewPlan}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          生成中...
                        </>
                      ) : dietPlan ? (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                          换一份食谱
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                          获取今日食谱
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
          
          {/* 标签页导航 */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'today'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('today')}
              >
                今日饮食
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'week'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('week')}
              >
                周计划
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stats'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('stats')}
              >
                营养分析
              </button>
            </nav>
          </div>
          
          {/* 主要内容区域 */}
          {activeTab === 'today' && (
            <div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  <p>{error}</p>
                </div>
              )}
              
              {dietPlan ? (
                <div>
                  {/* 一日总览 */}
                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">一日总览</h3>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">总热量</div>
                          <div className="text-xl font-semibold text-primary-700">{Number(dietPlan.nutritionSummary.calories || 0).toFixed(0)} 千卡</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">蛋白质</div>
                          <div className="text-xl font-semibold text-primary-700">{Number(dietPlan.nutritionSummary.protein || 0).toFixed(1)}g</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">脂肪</div>
                          <div className="text-xl font-semibold text-primary-700">{Number(dietPlan.nutritionSummary.fat || 0).toFixed(1)}g</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">碳水</div>
                          <div className="text-xl font-semibold text-primary-700">{Number(dietPlan.nutritionSummary.carbs || 0).toFixed(1)}g</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">纤维</div>
                          <div className="text-xl font-semibold text-primary-700">{Number(dietPlan.nutritionSummary.fiber || 0).toFixed(1)}g</div>
                        </div>
                        {Number(dietPlan.nutritionSummary.calcium) > 0 && (
                          <div className="text-center">
                            <div className="text-sm text-gray-500 mb-1">钙</div>
                            <div className="text-xl font-semibold text-primary-700">{Number(dietPlan.nutritionSummary.calcium).toFixed(0)}mg</div>
                          </div>
                        )}
                        {Number(dietPlan.nutritionSummary.iron) > 0 && (
                          <div className="text-center">
                            <div className="text-sm text-gray-500 mb-1">铁</div>
                            <div className="text-xl font-semibold text-primary-700">{Number(dietPlan.nutritionSummary.iron).toFixed(1)}mg</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                  
                  {/* 餐食卡片 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* 早餐 */}
                    <MealCard 
                      title="早餐" 
                      time="7:30 - 8:30" 
                      meal={dietPlan.breakfast} 
                    />
                    
                    {/* 上午加餐 */}
                    <MealCard 
                      title="上午加餐" 
                      time="10:00 - 10:30" 
                      meal={dietPlan.morningSnack} 
                    />
                    
                    {/* 午餐 */}
                    <MealCard 
                      title="午餐" 
                      time="12:00 - 13:00" 
                      meal={dietPlan.lunch} 
                    />
                    
                    {/* 下午加餐 */}
                    <MealCard 
                      title="下午加餐" 
                      time="15:30 - 16:00" 
                      meal={dietPlan.afternoonSnack} 
                    />
                    
                    {/* 晚餐 */}
                    <MealCard 
                      title="晚餐" 
                      time="18:00 - 19:00" 
                      meal={dietPlan.dinner} 
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-500 mb-4">您还没有今日的饮食计划</p>
                  <button 
                    className="btn-primary"
                    onClick={generateNewPlan}
                    disabled={isGenerating}
                  >
                    {isGenerating ? '生成中...' : '获取今日食谱'}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'week' && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-500 mb-2">周计划功能正在开发中</h3>
              <p className="text-gray-400">
                此功能将在下一版本中推出，敬请期待！
              </p>
            </div>
          )}
          
          {activeTab === 'stats' && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-500 mb-2">营养分析功能正在开发中</h3>
              <p className="text-gray-400">
                此功能将在下一版本中推出，敬请期待！
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
