"use client";

import React from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export default function KnowledgePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 my-8">
          <h1 className="text-3xl font-bold text-center text-green-600 mb-6">饮食知识</h1>
          
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <div className="text-8xl text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0015 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-600 text-center">功能正在开发中</h2>
            
            <p className="text-gray-500 text-center max-w-md">
              我们正在努力收集和整理孕期饮食相关的营养知识与安全指南，敬请期待！
            </p>
            
            <div className="mt-8">
              <a href="/dashboard" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-300">
                返回仪表盘
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
