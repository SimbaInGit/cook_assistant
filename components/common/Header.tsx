"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-heading font-bold text-primary-600">孕期饮食助手</span>
          </Link>
          
          {/* 桌面导航 */}
          <nav className="hidden md:flex space-x-8">
            <NavLink href="/dashboard" active={pathname === '/dashboard'}>
              我的饮食计划
            </NavLink>
            <NavLink href="/recipes" active={pathname === '/recipes'}>
              菜谱库
            </NavLink>
            <NavLink href="/knowledge" active={pathname === '/knowledge'}>
              饮食知识
            </NavLink>
            <NavLink href="/profile" active={pathname === '/profile'}>
              个人档案
            </NavLink>
          </nav>
          
          {/* 移动端菜单按钮 */}
          <button 
            className="md:hidden flex items-center p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              )}
            </svg>
          </button>
        </div>
        
        {/* 移动端导航菜单 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              <MobileNavLink href="/dashboard" active={pathname === '/dashboard'} onClick={() => setIsMenuOpen(false)}>
                我的饮食计划
              </MobileNavLink>
              <MobileNavLink href="/recipes" active={pathname === '/recipes'} onClick={() => setIsMenuOpen(false)}>
                菜谱库
              </MobileNavLink>
              <MobileNavLink href="/knowledge" active={pathname === '/knowledge'} onClick={() => setIsMenuOpen(false)}>
                饮食知识
              </MobileNavLink>
              <MobileNavLink href="/profile" active={pathname === '/profile'} onClick={() => setIsMenuOpen(false)}>
                个人档案
              </MobileNavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// 桌面端导航链接组件
function NavLink({ href, active, children }) {
  return (
    <Link 
      href={href} 
      className={`text-base font-medium ${
        active 
          ? 'text-primary-600 border-b-2 border-primary-500' 
          : 'text-gray-600 hover:text-primary-600'
      }`}
    >
      {children}
    </Link>
  );
}

// 移动端导航链接组件
function MobileNavLink({ href, active, onClick, children }) {
  return (
    <Link 
      href={href} 
      className={`block px-4 py-2 rounded-md ${
        active 
          ? 'bg-primary-50 text-primary-600' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
