/**
 * 为菜谱生成模拟图片URL
 * 这个函数根据菜谱名称生成一个随机但稳定的食物图片URL
 * 
 * @param recipeName 菜谱名称
 * @returns 菜谱图片URL
 */
export function generateRecipeImageUrl(recipeName: string): string {
  // 默认图片服务
  const imageServices = [
    // 结构：[服务URL模板, 服务标签]
    ["https://source.unsplash.com/500x400/?food,{QUERY}", "unsplash"],
    ["https://picsum.photos/seed/{SEED}/500/400", "picsum"],
    ["https://loremflickr.com/500/400/{QUERY}", "flickr"],
    ["https://placehold.co/500x400/{COLOR}/white?text={TEXT}", "placeholder"]
  ];

  // 从菜谱名称生成一个稳定的数值哈希
  function generateHash(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash) + input.charCodeAt(i);
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash);
  }

  const hash = generateHash(recipeName);
  
  // 确定食物关键词
  const foodKeywords: {[key: string]: string} = {
    '粥': 'porridge,congee',
    '汤': 'soup',
    '面': 'noodles',
    '饭': 'rice',
    '鸡': 'chicken',
    '鱼': 'fish',
    '虾': 'shrimp',
    '牛肉': 'beef',
    '猪肉': 'pork',
    '羊肉': 'mutton',
    '沙拉': 'salad',
    '蛋': 'eggs',
    '豆腐': 'tofu',
    '蔬菜': 'vegetables',
    '水果': 'fruits',
    '甜点': 'dessert',
    '饼干': 'cookies',
    '蛋糕': 'cake',
    '面包': 'bread'
  };
  
  // 从菜谱名称确定合适的搜索关键词
  let query = 'healthy,food';
  for (const [keyword, translation] of Object.entries(foodKeywords)) {
    if (recipeName.includes(keyword)) {
      query = translation;
      break;
    }
  }

  // 为占位图片选择颜色
  const colors = ['e57373', '81c784', '64b5f6', 'ffd54f', 'ba68c8', '4fc3f7', 'aed581'];
  const color = colors[hash % colors.length];
  
  // 选择一个图片服务
  const serviceIndex = hash % imageServices.length;
  let imageUrl = imageServices[serviceIndex][0];
  
  // 替换模板中的变量
  imageUrl = imageUrl
    .replace('{QUERY}', query)
    .replace('{SEED}', recipeName.replace(/\s+/g, '').toLowerCase())
    .replace('{COLOR}', color)
    .replace('{TEXT}', encodeURIComponent(recipeName));
  
  return imageUrl;
}

/**
 * 修复可能存在问题的图片URL
 * @param url 可能有问题的图片URL
 * @param fallbackName 用于生成回退图片的名称
 * @returns 修复后的URL
 */
export function fixImageUrl(url: string | undefined, fallbackName: string): string {
  // 如果URL为空或无效，生成一个随机图片
  if (!url || url.trim() === '' || url === 'undefined' || url === 'null') {
    return generateRecipeImageUrl(fallbackName);
  }
  
  // 处理相对路径
  if (url.startsWith('/')) {
    // 如果以/开头但不是正确的静态资源路径，生成随机图片
    if (!url.startsWith('/images/') || url.length < 10) {
      return generateRecipeImageUrl(fallbackName);
    }
  }
  
  // 处理不安全的HTTP URL（可选，如果你的应用部署在HTTPS上）
  if (url.startsWith('http:') && typeof window !== 'undefined' && window.location.protocol === 'https:') {
    url = url.replace('http:', 'https:');
  }
  
  return url;
}
