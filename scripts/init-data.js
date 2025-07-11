import { connectToDatabase } from '../lib/mongodb';
import FoodSafety from '../models/FoodSafety';

// 示例食物安全数据
const foodSafetyData = [
  {
    name: '蓝莓',
    category: 'fruits',
    safetyLevel: 'safe',
    description: '富含抗氧化物质和维生素C的水果',
    reason: '蓝莓富含抗氧化剂，有助于孕妇维持健康的免疫系统和胎儿发育。',
    tips: ['选择新鲜或冷冻的蓝莓，避免加糖罐装蓝莓', '食用前彻底清洗']
  },
  {
    name: '三文鱼',
    category: 'seafood',
    safetyLevel: 'moderate',
    description: '富含omega-3脂肪酸的鱼类',
    reason: '熟透的三文鱼可以食用，但孕期应避免生鱼片。三文鱼含有的DHA对胎儿脑部发育有益，但需要注意汞含量。',
    tips: ['选择低汞含量的野生三文鱼', '确保烹饪至内部温度达到63°C', '每周食用不超过2-3次']
  },
  {
    name: '生食寿司',
    category: 'seafood',
    safetyLevel: 'unsafe',
    description: '日式料理，通常包含生鱼片',
    reason: '生鱼可能含有寄生虫和有害细菌，如李斯特菌，可能导致严重感染。',
    alternatives: ['熟食寿司', '素食寿司', '蒸鱼'],
    tips: ['可以选择完全煮熟的鱼类寿司', '避免海鲜类生食']
  },
  {
    name: '咖啡',
    category: 'drinks',
    safetyLevel: 'caution',
    description: '含咖啡因的饮料',
    reason: '适量咖啡因（每天不超过200mg，约一杯中等咖啡）对大多数孕妇来说是安全的，但过量可能增加流产风险。',
    alternatives: ['脱因咖啡', '红茶', '菊花茶'],
    tips: ['限制每日咖啡因摄入量不超过200mg', '可考虑改喝无咖啡因饮品']
  },
  {
    name: '菠菜',
    category: 'vegetables',
    safetyLevel: 'safe',
    description: '富含叶酸和铁的绿叶蔬菜',
    reason: '菠菜富含叶酸，有助于预防胎儿神经管缺陷。同时富含铁质，有助于预防贫血。',
    tips: ['食用前彻底清洗', '轻微烹煮可保留更多营养']
  },
  {
    name: '蜂蜜',
    category: 'other',
    safetyLevel: 'safe',
    description: '天然甜味剂',
    reason: '蜂蜜对成人是安全的，但不应给1岁以下婴儿食用。孕妇食用是安全的，但要确保是经过巴氏杀菌的产品。',
    tips: ['选择可靠品牌的经过处理的蜂蜜', '作为糖的健康替代品适量食用']
  },
  {
    name: '鸡蛋',
    category: 'other',
    safetyLevel: 'moderate',
    description: '优质蛋白质来源',
    reason: '全熟的鸡蛋是安全的，但未煮熟的鸡蛋可能含有沙门氏菌。',
    tips: ['确保鸡蛋完全煮熟，蛋黄和蛋白都应该变硬', '避免生鸡蛋或半熟鸡蛋制品，如荷包蛋（溏心）、蛋奶酱、生鸡蛋拌沙拉酱等']
  },
  {
    name: '酒精饮料',
    category: 'drinks',
    safetyLevel: 'unsafe',
    description: '含酒精的饮料如啤酒、红酒、白酒等',
    reason: '没有已知的孕期酒精安全摄入量。酒精会穿过胎盘影响胎儿发育，可能导致胎儿酒精谱系障碍。',
    alternatives: ['无酒精啤酒', '果汁', '气泡水'],
    tips: ['整个孕期应完全避免酒精', '社交场合可选择无酒精饮料替代']
  },
  {
    name: '西兰花',
    category: 'vegetables',
    safetyLevel: 'safe',
    description: '十字花科蔬菜，富含维生素C和叶酸',
    reason: '西兰花富含多种维生素和矿物质，尤其是叶酸、钙和铁，这些对胎儿发育和孕妇健康非常重要。',
    tips: ['轻微蒸煮以保留更多营养', '可以加入各种炒菜或沙拉中增加营养']
  },
  {
    name: '软奶酪',
    category: 'dairy',
    safetyLevel: 'unsafe',
    description: '如布里干酪、卡门培尔、菲达奶酪等',
    reason: '非巴氏杀菌的软奶酪可能含有李斯特菌，会导致流产或死胎。',
    alternatives: ['硬奶酪', '经过巴氏杀菌的奶酪', '奶酪干酪'],
    tips: ['选择硬质奶酪如切达奶酪', '确保所有奶酪产品都经过巴氏杀菌']
  }
];

/**
 * 初始化食物安全数据库
 */
async function initFoodSafetyData() {
  try {
    // 连接数据库
    const { db } = await connectToDatabase();
    
    // 清空现有集合（如果需要）
    console.log('清空现有食物安全数据...');
    await FoodSafety.deleteMany({});
    
    // 插入示例数据
    console.log('插入食物安全示例数据...');
    await FoodSafety.insertMany(foodSafetyData);
    
    console.log('食物安全数据初始化成功!');
    
    // 断开数据库连接
    await db.disconnect();
    
  } catch (error) {
    console.error('初始化食物安全数据失败:', error);
  }
}

// 执行初始化
initFoodSafetyData();
