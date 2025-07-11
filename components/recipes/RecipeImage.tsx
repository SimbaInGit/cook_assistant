import Image from 'next/image';
import { useState } from 'react';

interface RecipeImageProps {
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}

// 为食物名称生成占位图片URL
function getPlaceholderImage(name: string): string {
  // 计算一个基于名称的稳定的数字
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash; // 转换为32位整数
  }
  
  // 选择一个适合食物的随机颜色
  const colors = ['e57373', '81c784', '64b5f6', 'ffd54f', 'ba68c8', '4fc3f7', 'aed581', 'ffd700'];
  const color = colors[Math.abs(hash) % colors.length];
  
  // 确定一个食物相关的图标
  let emoji = '🍽️';
  const foodWords = {
    '早餐': '🍳', '面包': '🍞', '粥': '🥣', '豆浆': '🥛',
    '午餐': '🍲', '晚餐': '🍛', '汤': '🍜', '沙拉': '🥗',
    '点心': '🍰', '水果': '🍎', '肉': '🥩', '鱼': '🐟',
    '海鲜': '🦐', '牛肉': '🥩', '猪肉': '🥓', '鸡肉': '🍗',
    '米饭': '🍚', '面条': '🍜', '蛋糕': '🎂'
  };
  
  for (const [word, icon] of Object.entries(foodWords)) {
    if (name.includes(word)) {
      emoji = icon;
      break;
    }
  }
  
  // 使用在线服务生成占位图
  return `https://placehold.co/600x400/${color}/ffffff?text=${encodeURIComponent(emoji)}`;
}

export default function RecipeImage({ src, alt, className = '', width, height, fill = false }: RecipeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || getPlaceholderImage(alt));
  const [imgError, setImgError] = useState(false);
  
  // 尝试加载图片，如果失败则使用占位图
  return (
    <Image 
      src={imgError ? getPlaceholderImage(alt) : imgSrc} 
      alt={alt} 
      className={`object-cover ${className}`}
      width={fill ? undefined : (width || 400)}
      height={fill ? undefined : (height || 300)}
      fill={fill}
      onError={() => {
        setImgError(true);
        setImgSrc(getPlaceholderImage(alt));
      }}
    />
  );
}
