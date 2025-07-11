"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import RecipeImage from '@/components/recipes/RecipeImage';
import { fixImageUrl } from '@/lib/utils/image';

// 食材接口
interface Ingredient {
  name: string;
  amount: string;
}

// 营养信息接口
interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  calcium?: number;
  iron?: number;
  folicAcid?: number;
  vitaminC?: number;
  vitaminE?: number;
}

// 菜谱接口
interface Recipe {
  _id: string;
  name: string;
  category: string;
  image?: string;
  ingredients: Ingredient[];
  steps: string[];
  preparationTime: number;
  cookingTime: number;
  nutrition: Nutrition;
  tips?: string[];
  isPregnancySafe: boolean;
  trimesterSuitability: {
    first: boolean;
    second: boolean;
    third: boolean;
  };
  suitableConditions?: {
    gestationalDiabetes?: boolean;
    anemia?: boolean;
    hypertension?: boolean;
  };
}

export default function RecipeDetail() {
  const params = useParams();
  const recipeName = params.name as string;
  const decodedRecipeName = decodeURIComponent(recipeName);
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 获取菜谱详情
    const fetchRecipeDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(`开始获取菜谱详情: ${decodedRecipeName}`);
        const response = await fetch(`/api/recipes/${encodeURIComponent(decodedRecipeName)}`, {
          credentials: 'include',
          cache: 'no-store'
        });

        console.log('API响应状态:', response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('未找到该菜谱');
          } else {
            throw new Error('获取菜谱详情失败');
          }
        }

        const data = await response.json();
        console.log('获取到菜谱详情:', data);

        if (data.recipe) {
          setRecipe(data.recipe);
        } else {
          throw new Error('获取菜谱详情失败，返回数据格式不正确');
        }
      } catch (err) {
        console.error('获取菜谱详情出错:', err);
        setError(err instanceof Error ? err.message : '发生未知错误');
      } finally {
        setIsLoading(false);
      }
    };

    if (decodedRecipeName) {
      fetchRecipeDetails();
    } else {
      setError('菜谱名称无效');
      setIsLoading(false);
    }
  }, [decodedRecipeName]);

  // 获取孕期适应阶段文本
  const getTrimesterText = (recipe: Recipe) => {
    const { trimesterSuitability } = recipe;
    const suitableTremesters = [];
    
    if (trimesterSuitability.first) suitableTremesters.push('第一孕期');
    if (trimesterSuitability.second) suitableTremesters.push('第二孕期');
    if (trimesterSuitability.third) suitableTremesters.push('第三孕期');
    
    return suitableTremesters.length === 3 
      ? '全孕期' 
      : suitableTremesters.join('、');
  };

  // 获取适合健康状况文本
  const getHealthConditionsText = (recipe: Recipe) => {
    if (!recipe.suitableConditions) return '一般健康状况';
    
    const { suitableConditions } = recipe;
    const conditions = [];
    
    if (suitableConditions.gestationalDiabetes) conditions.push('妊娠期糖尿病');
    if (suitableConditions.anemia) conditions.push('贫血');
    if (suitableConditions.hypertension) conditions.push('高血压');
    
    return conditions.length > 0 
      ? conditions.join('、') 
      : '一般健康状况';
  };
  
  // 加载状态
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-primary-500 rounded-full mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">加载菜谱中，请稍候...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 错误状态
  if (error) {
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
            <div className="space-x-4">
              <Link href="/dashboard" className="btn-primary">
                返回仪表盘
              </Link>
            </div>
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
          {recipe ? (
            <>
              {/* 返回链接 */}
              <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 mb-6 inline-flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                返回仪表盘
              </Link>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* 菜谱头部 */}
                <div className="relative">
                  <div className="w-full h-72 relative">
                    <RecipeImage
                      src={fixImageUrl(recipe.image, recipe.name)}
                      alt={recipe.name}
                      fill
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 p-6 w-full text-white">
                    <h1 className="text-3xl font-bold mb-2 text-white">{recipe.name}</h1>
                    <div className="flex flex-wrap items-center text-gray-200 gap-4">
                      <p>
                        <span className="font-medium">烹饪时间:</span> {recipe.preparationTime + recipe.cookingTime} 分钟
                      </p>
                      <p>
                        <span className="font-medium">适合阶段:</span> {getTrimesterText(recipe)}
                      </p>
                      <p>
                        <span className="font-medium">适合人群:</span> {getHealthConditionsText(recipe)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* 营养信息 */}
                  <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">营养信息</h2>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">热量</p>
                          <p className="font-semibold">{Number(recipe.nutrition.calories || 0).toFixed(0)} 千卡</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">蛋白质</p>
                          <p className="font-semibold">{Number(recipe.nutrition.protein || 0).toFixed(1)} g</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">脂肪</p>
                          <p className="font-semibold">{Number(recipe.nutrition.fat || 0).toFixed(1)} g</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">碳水化合物</p>
                          <p className="font-semibold">{Number(recipe.nutrition.carbs || 0).toFixed(1)} g</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">纤维</p>
                          <p className="font-semibold">{Number(recipe.nutrition.fiber || 0).toFixed(1)} g</p>
                        </div>
                        {recipe.nutrition.calcium && Number(recipe.nutrition.calcium) > 0 && (
                          <div>
                            <p className="text-sm text-gray-500">钙</p>
                            <p className="font-semibold">{Number(recipe.nutrition.calcium).toFixed(0)} mg</p>
                          </div>
                        )}
                        {recipe.nutrition.iron && Number(recipe.nutrition.iron) > 0 && (
                          <div>
                            <p className="text-sm text-gray-500">铁</p>
                            <p className="font-semibold">{Number(recipe.nutrition.iron).toFixed(1)} mg</p>
                          </div>
                        )}
                        {recipe.nutrition.folicAcid && Number(recipe.nutrition.folicAcid) > 0 && (
                          <div>
                            <p className="text-sm text-gray-500">叶酸</p>
                            <p className="font-semibold">{Number(recipe.nutrition.folicAcid).toFixed(0)} μg</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* 食材 */}
                  <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">食材</h2>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ul className="space-y-2">
                        {recipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                            <span>{ingredient.name}</span>
                            <span className="text-gray-600">{ingredient.amount}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  {/* 烹饪步骤 */}
                  <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">烹饪步骤</h2>
                    <ol className="space-y-4">
                      {recipe.steps.map((step, index) => (
                        <li key={index} className="flex">
                          <span className="w-8 h-8 rounded-full bg-primary-500 text-white font-medium flex items-center justify-center mr-3 flex-shrink-0">
                            {index + 1}
                          </span>
                          <p className="text-gray-700">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </section>

                  {/* 孕期小贴士 */}
                  {recipe.tips && recipe.tips.length > 0 && (
                    <section className="mb-8">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">孕期小贴士</h2>
                      <div className="bg-primary-50 p-4 rounded-lg border-l-4 border-primary-500">
                        <ul className="list-disc pl-5 space-y-2">
                          {recipe.tips.map((tip, index) => (
                            <li key={index} className="text-gray-700">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">未找到菜谱信息</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
