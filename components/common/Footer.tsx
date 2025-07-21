"use client";

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Erica的孕期饮食助手</h3>
            <p className="mb-4">
              为Erica提供的科学、安全、美味的专属孕期饮食建议，帮你轻松规划每日餐食
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <span className="sr-only">微信</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.661 12.209c-.436 0-.788-.355-.788-.79 0-.435.352-.791.788-.791.437 0 .788.356.788.791 0 .435-.351.79-.788.79m4.089-1.582c.437 0 .788.356.788.791 0 .435-.351.79-.788.79-.436 0-.788-.355-.788-.79 0-.435.352-.791.788-.791m-7.945 3.667c-.839-.393-1.417-.898-1.417-1.513 0-.614.926-1.485 1.4-1.868-.021-.056-.031-.119-.031-.182 0-.295.238-.534.531-.534a.533.533 0 01.533.534c0 .075-.017.146-.044.209 1.486-.16 3.035-.203 4.498-.152 1.808.063 3.494.303 4.8.613a.533.533 0 01.526-.596c.293 0 .531.239.531.534 0 .032-.005.062-.009.093 1.096.339 1.834.843 1.834 1.349 0 .65-.55 1.211-1.383 1.6" fillRule="evenodd"></path>
                  <path d="M12.202 7.209c-3.493 0-6.525 2.382-6.525 5.217 0 .481.093.947.265 1.394l-1.466 3.899 3.656-1.153c.498.397 1.078.723 1.709.961a6.675 6.675 0 002.36.434c3.494 0 6.526-2.382 6.526-5.218.001-2.834-3.032-5.534-6.525-5.534z" fillRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <span className="sr-only">微博</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.316 18.531c-4.317.001-8.157-2.025-8.157-5.544 0-3.214 4.025-7.104 8.937-7.104 3.906 0 7.688 2.275 7.688 5.487 0 2.031-1.746 3.242-3.4 3.242-1.036 0-1.601-.624-1.601-1.504 0-.576.256-.979.256-1.373 0-.695-.497-1.264-1.397-1.264-1.333 0-2.268 1.242-2.268 2.955 0 3.214 3.748 3.302 3.748 4.793 0 .376-.376.771-1.158.771-1.999 0-3.055-2.066-3.555-2.066-.317 0-.357.249-.357.652 0 .733.357.977.357 1.478 0 .497-.456.872-1.093.872z"></path>
                  <path d="M20.096 10.329c.013-.211.021-.424.021-.639 0-5.762-4.671-10.435-10.432-10.435-5.76 0-10.431 4.672-10.431 10.435 0 5.763 4.671 10.434 10.431 10.434 1.796 0 3.484-.456 4.958-1.255l.837 1.406a12.184 12.184 0 01-5.795 1.452c-6.742 0-12.206-5.464-12.206-12.208S3.944 7.309 10.685 7.309c6.742 0 12.206 5.464 12.206 12.208 0 .558-.039 1.108-.11 1.647l-1.669-1.045c.641-1.513.997-3.178.997-4.932 0-6.742-5.464-12.206-12.208-12.206S7.694 8.444 7.694 15.187c0 6.742 5.464 12.206 12.208 12.206 2.358 0 4.547-.67 6.404-1.825"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  我的饮食计划
                </Link>
              </li>
              <li>
                <Link href="/recipes" className="hover:text-white transition-colors">
                  菜谱库
                </Link>
              </li>
              <li>
                <Link href="/knowledge" className="hover:text-white transition-colors">
                  饮食知识
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  个人档案
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">联系我们</h3>
            <p className="mb-2">有任何问题或建议？</p>
            <a href="mailto:support@pregnancy-diet-assistant.com" className="text-primary-300 hover:text-primary-200">
              support@pregnancy-diet-assistant.com
            </a>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-700 pt-8 text-center text-sm">
          <p>&copy; {currentYear} 孕期饮食助手. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  );
}
