"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import RecipeImage from '@/components/recipes/RecipeImage';
import { fixImageUrl } from '@/lib/utils/image';

// 食谱接口
interface Recipe {
  _id: string;
  name: string;
  category: string;
  image?: string;
  preparationTime: number;
  cookingTime: number;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  isPregnancySafe: boolean;
  trimesterSuitability: {
    first: boolean;
    second: boolean;
    third: boolean;
  };
}

// 分类选项
const categories = [
  { id: 'all', name: '全部' },
  { id: 'breakfast', name: '早餐' },
  { id: 'lunch', name: '午餐' },
  { id: 'dinner', name: '晚餐' },
  { id: 'snack', name: '加餐/点心' }
];

// 孕期选项
const trimesters = [
  { id: 'all', name: '全部孕期' },
  { id: 'first', name: '孕早期' },
  { id: 'second', name: '孕中期' },
  { id: 'third', name: '孕晚期' }
];

export default function RecipeLibrary() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 筛选状态
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTrimester, setSelectedTrimester] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 加载食谱数据
  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/recipes', {
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error('获取菜谱列表失败');
        }
        
        const data = await response.json();
        
        if (data.recipes) {
          setRecipes(data.recipes);
          setFilteredRecipes(data.recipes);
        } else {
          throw new Error('返回的数据格式不正确');
        }
      } catch (error) {
        console.error('获取菜谱列表出错:', error);
        setError(error instanceof Error ? error.message : '发生未知错误');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecipes();
  }, []);
  
  // 筛选食谱
  useEffect(() => {
    let result = [...recipes];
    
    // 按分类筛选
    if (selectedCategory !== 'all') {
      result = result.filter(recipe => recipe.category === selectedCategory);
    }
    
    // 按孕期筛选
    if (selectedTrimester !== 'all') {
      result = result.filter(recipe => recipe.trimesterSuitability[selectedTrimester as 'first' | 'second' | 'third']);
    }
    
    // 按名称搜索
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(recipe => 
        recipe.name.toLowerCase().includes(query)
      );
    }
    
    setFilteredRecipes(result);
  }, [selectedCategory, selectedTrimester, searchQuery, recipes]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold text-primary-800 mb-6">菜谱库</h1>
        
        {/* 搜索和筛选 */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-8">
          <div className="mb-4">
            <label htmlFor="search" className="sr-only">搜索菜谱</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                type="search"
                className="form-input pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                placeholder="搜索菜谱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">按分类筛选</label>
              <select
                id="category"
                className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="trimester" className="block text-sm font-medium text-gray-700 mb-1">按孕期筛选</label>
              <select
                id="trimester"
                className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                value={selectedTrimester}
                onChange={(e) => setSelectedTrimester(e.target.value)}
              >
                {trimesters.map(trimester => (
                  <option key={trimester.id} value={trimester.id}>{trimester.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* 菜谱列表 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md">
            <p className="font-medium">加载失败</p>
            <p>{error}</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-md">
            <p className="text-lg text-gray-600 mb-2">未找到符合条件的菜谱</p>
            <p className="text-gray-500">请尝试调整筛选条件或搜索内容</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => (
              <Link href={`/recipes/${encodeURIComponent(recipe.name)}`} key={recipe._id}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="h-48 bg-gray-200 relative">
                    <RecipeImage 
                      src={fixImageUrl(recipe.image, recipe.name)} 
                      alt={recipe.name} 
                      fill
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-1">{recipe.name}</h3>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className="mr-3 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {recipe.preparationTime + recipe.cookingTime} 分钟
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {getCategoryName(recipe.category)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500 flex items-center">
                      <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      {recipe.nutrition.calories} 千卡
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

// 获取分类名称
function getCategoryName(category: string): string {
  const map: Record<string, string> = {
    'breakfast': '早餐',
    'lunch': '午餐',
    'dinner': '晚餐',
    'snack': '加餐/点心'
  };
  return map[category] || '其他';
}
