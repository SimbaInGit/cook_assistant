"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export default function ProfileSetup() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    dueDate: '',
    allergies: '',
    dislikedFoods: '',
    healthConditions: {
      gestationalDiabetes: false,
      anemia: false,
      hypertension: false,
      other: '',
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchExistingProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          credentials: 'include',
          cache: 'no-store'
        });
        
        console.log('获取现有档案状态:', response.status);
        
        // 如果响应成功，表示用户已有档案
        if (response.ok) {
          const data = await response.json();
          console.log('获取到现有档案数据:', data);
          
          if (data.user && data.user.healthInfo) {
            const { healthInfo } = data.user;
            
            // 转换日期格式以适配表单
            let formattedDueDate = '';
            if (healthInfo.dueDate) {
              const date = new Date(healthInfo.dueDate);
              formattedDueDate = date.toISOString().split('T')[0];
            }
            
            // 转换数组为字符串，用于表单显示
            const allergiesString = Array.isArray(healthInfo.allergies) 
              ? healthInfo.allergies.join(', ') 
              : '';
              
            const dislikedFoodsString = Array.isArray(healthInfo.dislikedFoods) 
              ? healthInfo.dislikedFoods.join(', ') 
              : '';
            
            // 设置表单数据
            setFormData({
              dueDate: formattedDueDate,
              allergies: allergiesString,
              dislikedFoods: dislikedFoodsString,
              healthConditions: {
                gestationalDiabetes: healthInfo.healthConditions?.gestationalDiabetes || false,
                anemia: healthInfo.healthConditions?.anemia || false,
                hypertension: healthInfo.healthConditions?.hypertension || false,
                other: healthInfo.healthConditions?.other || '',
              }
            });
          }
        }
      } catch (error) {
        console.error('获取现有档案失败:', error);
        // 无需显示错误，因为用户可能只是第一次设置档案
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExistingProfile();
  }, []);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('healthConditions.')) {
      const condition = name.split('.')[1];
      setFormData({
        ...formData,
        healthConditions: {
          ...formData.healthConditions,
          [condition]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      // 验证预产期是必填项
      if (!formData.dueDate) {
        throw new Error('预产期是必填项');
      }
      
      // 转换多个项目的字符串为数组
      const processedData = {
        ...formData,
        allergies: formData.allergies ? formData.allergies.split(',').map(item => item.trim()) : [],
        dislikedFoods: formData.dislikedFoods ? formData.dislikedFoods.split(',').map(item => item.trim()) : [],
      };
      
      // 调用API保存用户数据
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 确保发送cookie
        body: JSON.stringify(processedData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '保存档案失败');
      }
      
      // 成功后跳转到仪表板
      router.push('/dashboard');
      
    } catch (error: any) {
      setError(error.message || '保存失败');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 计算最早可选的预产期（今天）
  const today = new Date();
  const minDueDate = today.toISOString().split('T')[0];
  
  // 计算最晚可选的预产期（今天 + 10个月）
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 10);
  const maxDueDate = maxDate.toISOString().split('T')[0];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-primary-700 mb-2">设置个人档案</h1>
            <p className="text-gray-600 mb-8">
              请填写以下信息，以便我们能为您提供更加个性化的饮食建议
            </p>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-4"></div>
                <p className="text-gray-600">加载中...</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <p>{error}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  {/* 预产期 */}
                  <div className="mb-6">
                    <label htmlFor="dueDate" className="form-label">预产期 <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      className="input-field"
                      value={formData.dueDate}
                      onChange={handleChange}
                      min={minDueDate}
                      max={maxDueDate}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      根据您的预产期，我们会自动计算您的孕周并调整饮食建议
                    </p>
                  </div>
                  
                  {/* 过敏原 */}
                  <div className="mb-6">
                    <label htmlFor="allergies" className="form-label">过敏原（可选）</label>
                    <input
                      type="text"
                      id="allergies"
                      name="allergies"
                      className="input-field"
                      value={formData.allergies}
                      onChange={handleChange}
                      placeholder="例如：花生,海鲜,草莓（用逗号分隔）"
                    />
                  </div>
                  
                  {/* 不喜欢的食物 */}
                  <div className="mb-6">
                    <label htmlFor="dislikedFoods" className="form-label">不喜欢的食物（可选）</label>
                    <input
                      type="text"
                      id="dislikedFoods"
                      name="dislikedFoods"
                      className="input-field"
                      value={formData.dislikedFoods}
                      onChange={handleChange}
                      placeholder="例如：香菜,苦瓜,茄子（用逗号分隔）"
                    />
                  </div>
                  
                  {/* 健康状况 */}
                  <div className="mb-8">
                    <label className="form-label">健康状况（可选）</label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="gestationalDiabetes"
                          name="healthConditions.gestationalDiabetes"
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                          checked={formData.healthConditions.gestationalDiabetes}
                          onChange={handleChange}
                        />
                        <label htmlFor="gestationalDiabetes" className="ml-2 text-gray-700">
                          妊娠期糖尿病
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="anemia"
                          name="healthConditions.anemia"
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                          checked={formData.healthConditions.anemia}
                          onChange={handleChange}
                        />
                        <label htmlFor="anemia" className="ml-2 text-gray-700">
                          贫血
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="hypertension"
                          name="healthConditions.hypertension"
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                          checked={formData.healthConditions.hypertension}
                          onChange={handleChange}
                        />
                        <label htmlFor="hypertension" className="ml-2 text-gray-700">
                          高血压
                        </label>
                      </div>
                      
                      <div className="mt-3">
                        <label htmlFor="otherCondition" className="form-label text-sm">其他健康状况</label>
                        <input
                          type="text"
                          id="otherCondition"
                          name="healthConditions.other"
                          className="input-field"
                          value={formData.healthConditions.other}
                          onChange={handleChange}
                          placeholder="请说明其他健康状况"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* 提交按钮 */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? '保存中...' : '保存个人档案'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
