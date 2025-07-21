"use client";

import { useState } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

// 食物安全等级标签组件
type SafetyLevel = 'safe' | 'moderate' | 'caution' | 'unsafe';

interface SafetyBadgeProps {
  level: SafetyLevel;
}

const SafetyBadge = ({ level }: SafetyBadgeProps) => {
  const badges = {
    safe: {
      text: '放心吃',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    moderate: {
      text: '适量吃',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    caution: {
      text: '要慎吃',
      className: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    unsafe: {
      text: '不能吃',
      className: 'bg-red-100 text-red-800 border-red-200'
    }
  };

  const { text, className } = badges[level] || badges.caution;
  
  return (
    <span className={`inline-block px-3 py-1 rounded-full border ${className} text-xs font-medium`}>
      {text}
    </span>
  );
};

// 模拟食物安全数据
const mockFoodSafetyData = [
  {
    id: '1',
    name: '蓝莓',
    category: 'fruits',
    safetyLevel: 'safe',
    description: '富含抗氧化物质和维生素C的水果',
    reason: '蓝莓富含抗氧化剂，有助于孕妇维持健康的免疫系统和胎儿发育。',
    tips: ['选择新鲜或冷冻的蓝莓，避免加糖罐装蓝莓', '食用前彻底清洗']
  },
  {
    id: '2',
    name: '三文鱼',
    category: 'seafood',
    safetyLevel: 'moderate',
    description: '富含omega-3脂肪酸的鱼类',
    reason: '熟透的三文鱼可以食用，但孕期应避免生鱼片。三文鱼含有的DHA对胎儿脑部发育有益，但需要注意汞含量。',
    tips: ['选择低汞含量的野生三文鱼', '确保烹饪至内部温度达到63°C', '每周食用不超过2-3次']
  },
  {
    id: '3',
    name: '生食寿司',
    category: 'seafood',
    safetyLevel: 'unsafe',
    description: '日式料理，通常包含生鱼片',
    reason: '生鱼可能含有寄生虫和有害细菌，如李斯特菌，可能导致严重感染。',
    alternatives: ['熟食寿司', '素食寿司', '蒸鱼'],
    tips: ['可以选择完全煮熟的鱼类寿司', '避免海鲜类生食']
  },
  {
    id: '4',
    name: '咖啡',
    category: 'drinks',
    safetyLevel: 'caution',
    description: '含咖啡因的饮料',
    reason: '适量咖啡因（每天不超过200mg，约一杯中等咖啡）对大多数孕妇来说是安全的，但过量可能增加流产风险。',
    alternatives: ['脱因咖啡', '红茶', '菊花茶'],
    tips: ['限制每日咖啡因摄入量不超过200mg', '可考虑改喝无咖啡因饮品']
  },
  {
    id: '5',
    name: '菠菜',
    category: 'vegetables',
    safetyLevel: 'safe',
    description: '富含叶酸和铁的绿叶蔬菜',
    reason: '菠菜富含叶酸，有助于预防胎儿神经管缺陷。同时富含铁质，有助于预防贫血。',
    tips: ['食用前彻底清洗', '轻微烹煮可保留更多营养']
  }
];

export default function KnowledgePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  
  // 处理搜索
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    try {
      // 实际应用中应该调用API
      // const response = await fetch(`/api/food/search?q=${encodeURIComponent(searchTerm)}`);
      // if (!response.ok) throw new Error('搜索失败');
      // const data = await response.json();
      // setSearchResults(data.foods);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 简单过滤模拟数据作为搜索结果
      const results = mockFoodSafetyData.filter(
        food => food.name.includes(searchTerm) || food.description.includes(searchTerm)
      );
      
      setSearchResults(results);
      setSelectedFood(null); // 清除之前选中的食物详情
      
    } catch (error) {
      console.error('搜索食物失败:', error);
      alert('搜索失败，请重试');
    } finally {
      setIsSearching(false);
    }
  };
  
  // 点击搜索按钮或按下回车
  const onSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };
  
  // 查看食物详情
  const viewFoodDetails = (food) => {
    setSelectedFood(food);
  };
  
  // 返回搜索结果列表
  const backToResults = () => {
    setSelectedFood(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-primary-700 mb-2">孕期饮食知识库</h1>
          <p className="text-gray-600 mb-8">搜索食物，了解其在孕期的安全等级和食用建议</p>
          
          {/* 搜索框 */}
          <div className="mb-8">
            <form onSubmit={onSearchSubmit} className="flex w-full md:w-2/3 lg:w-1/2">
              <input 
                type="text"
                placeholder="输入食物名称，例如：蓝莓、咖啡、海鲜..."
                className="input-field rounded-r-none flex-grow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 rounded-r-md focus:outline-none"
                disabled={isSearching || !searchTerm.trim()}
              >
                {isSearching ? (
                  <span>搜索中...</span>
                ) : (
                  <span>搜索</span>
                )}
              </button>
            </form>
          </div>
          
          {selectedFood ? (
            // 食物详情视图
            <div className="bg-white rounded-lg shadow-md p-6">
              <button 
                onClick={backToResults}
                className="mb-4 flex items-center text-primary-600 hover:text-primary-700"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                返回搜索结果
              </button>
              
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedFood.name}</h2>
                <SafetyBadge level={selectedFood.safetyLevel} />
              </div>
              
              <div className="text-gray-600 mb-4">{selectedFood.description}</div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">安全评级原因</h3>
                <p className="text-gray-700">{selectedFood.reason}</p>
              </div>
              
              {selectedFood.tips && selectedFood.tips.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">食用小贴士</h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    {selectedFood.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedFood.alternatives && selectedFood.alternatives.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">替代选择</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFood.alternatives.map((alt, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // 搜索结果列表
            <div>
              {searchResults.length > 0 ? (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">搜索结果 ({searchResults.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map(food => (
                      <div 
                        key={food.id}
                        className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => viewFoodDetails(food)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">{food.name}</h3>
                          <SafetyBadge level={food.safetyLevel} />
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{food.description}</p>
                        <button className="text-primary-600 text-sm hover:text-primary-700 flex items-center">
                          查看详情
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : searchTerm && !isSearching ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-2">未找到匹配的食物</p>
                  <p className="text-sm text-gray-400">尝试使用其他关键词搜索，或检查拼写</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="bg-gray-100 rounded-full p-4 mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <h2 className="text-xl font-medium text-gray-700 mb-2">搜索食物安全信息</h2>
                  <p className="text-gray-500 text-center max-w-lg">
                    输入任何食物名称，了解它在孕期的安全等级、食用建议和注意事项
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
