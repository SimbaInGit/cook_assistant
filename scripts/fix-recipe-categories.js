// 脚本：修复菜谱分类
// 此脚本用于修复数据库中菜谱的category字段
// 运行方法：node scripts/fix-recipe-categories.js

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

// 连接数据库
async function connectToDatabase() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('请在.env文件中设置MONGODB_URI');
    }
    
    console.log('正在连接到MongoDB...');
    await mongoose.connect(uri);
    console.log('已成功连接到MongoDB');
  } catch (error) {
    console.error('连接数据库失败:', error);
    process.exit(1);
  }
}

// 创建菜谱模型
const RecipeSchema = new mongoose.Schema({
  name: String,
  category: String,
  image: String,
  ingredients: [{ name: String, amount: String }],
  steps: [String],
  preparationTime: Number,
  cookingTime: Number,
  nutrition: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    fiber: Number,
    calcium: Number,
    iron: Number,
    folicAcid: Number,
    vitaminC: Number,
    vitaminE: Number
  },
  tips: [String],
  isPregnancySafe: Boolean,
  trimesterSuitability: {
    first: Boolean,
    second: Boolean,
    third: Boolean
  },
  suitableConditions: {
    gestationalDiabetes: Boolean,
    anemia: Boolean,
    hypertension: Boolean
  },
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', RecipeSchema);

// 从饮食计划中找出菜谱与餐点类型的关系
const DietPlanSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  date: Date,
  meals: {
    breakfast: { type: mongoose.Types.ObjectId, ref: 'Recipe' },
    lunch: { type: mongoose.Types.ObjectId, ref: 'Recipe' },
    dinner: { type: mongoose.Types.ObjectId, ref: 'Recipe' },
    morningSnack: { type: mongoose.Types.ObjectId, ref: 'Recipe' },
    afternoonSnack: { type: mongoose.Types.ObjectId, ref: 'Recipe' }
  },
  nutritionSummary: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    fiber: Number,
    calcium: Number,
    iron: Number,
    folicAcid: Number,
    vitaminC: Number,
    vitaminE: Number
  }
}, { timestamps: true });

const DietPlan = mongoose.model('DietPlan', DietPlanSchema);

// 根据菜名智能判断分类
function inferCategoryFromName(name) {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('午餐') || nameLower.includes('中餐') || nameLower.includes('lunch')) {
    return 'lunch';
  } else if (nameLower.includes('晚餐') || nameLower.includes('dinner')) {
    return 'dinner';
  } else if (
    nameLower.includes('加餐') || 
    nameLower.includes('snack') || 
    nameLower.includes('点心') ||
    nameLower.includes('甜点')
  ) {
    return 'snack';
  }
  
  // 早餐特征词
  if (
    nameLower.includes('早餐') || 
    nameLower.includes('breakfast') ||
    nameLower.includes('粥') ||
    nameLower.includes('豆浆') ||
    nameLower.includes('面包') ||
    nameLower.includes('燕麦') ||
    nameLower.includes('麦片') ||
    nameLower.includes('鸡蛋') && (
      nameLower.includes('三明治') ||
      nameLower.includes('吐司') ||
      nameLower.includes('煎') ||
      nameLower.includes('饼')
    )
  ) {
    return 'breakfast';
  }
  
  // 通过餐食关键词推断
  if (
    nameLower.includes('汤') ||
    nameLower.includes('炒') ||
    nameLower.includes('炖') ||
    nameLower.includes('焖') ||
    nameLower.includes('蒸') ||
    nameLower.includes('烧') ||
    nameLower.includes('煮') ||
    nameLower.includes('拌') ||
    nameLower.includes('饭') ||
    nameLower.includes('面') ||
    nameLower.includes('米饭') ||
    nameLower.includes('饺子') ||
    nameLower.includes('馒头') ||
    nameLower.includes('包子')
  ) {
    // 这些通常是正餐，默认午餐
    return 'lunch';
  }
  
  // 水果、小吃、点心通常是加餐
  if (
    nameLower.includes('水果') ||
    nameLower.includes('酸奶') ||
    nameLower.includes('坚果') ||
    nameLower.includes('饮料') ||
    nameLower.includes('奶茶') ||
    nameLower.includes('果汁')
  ) {
    return 'snack';
  }
  
  // 默认返回早餐
  return 'breakfast';
}

// 主函数
async function fixRecipeCategories() {
  try {
    await connectToDatabase();
    
    // 1. 获取所有菜谱
    console.log('正在获取所有菜谱...');
    const recipes = await Recipe.find({});
    console.log(`共找到 ${recipes.length} 个菜谱`);
    
    // 2. 获取所有饮食计划，用于确定菜谱在饮食计划中的餐点类型
    console.log('正在获取所有饮食计划...');
    const dietPlans = await DietPlan.find({}).populate('meals.breakfast meals.lunch meals.dinner meals.morningSnack meals.afternoonSnack');
    console.log(`共找到 ${dietPlans.length} 个饮食计划`);
    
    // 3. 创建菜谱ID到餐点类型的映射
    const recipeToMealTypeMap = new Map();
    
    dietPlans.forEach(plan => {
      if (plan.meals.breakfast) recipeToMealTypeMap.set(plan.meals.breakfast._id.toString(), 'breakfast');
      if (plan.meals.lunch) recipeToMealTypeMap.set(plan.meals.lunch._id.toString(), 'lunch');
      if (plan.meals.dinner) recipeToMealTypeMap.set(plan.meals.dinner._id.toString(), 'dinner');
      if (plan.meals.morningSnack) recipeToMealTypeMap.set(plan.meals.morningSnack._id.toString(), 'snack');
      if (plan.meals.afternoonSnack) recipeToMealTypeMap.set(plan.meals.afternoonSnack._id.toString(), 'snack');
    });
    
    console.log(`从饮食计划中提取了 ${recipeToMealTypeMap.size} 个菜谱的餐点类型`);
    
    // 4. 修复菜谱分类
    const updateResults = {
      totalRecipes: recipes.length,
      updatedRecipes: 0,
      byMealType: 0,
      byName: 0,
      unchanged: 0,
      categories: {
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        snack: 0
      }
    };
    
    const updates = [];
    
    for (const recipe of recipes) {
      const recipeId = recipe._id.toString();
      let newCategory = null;
      let updateReason = '';
      
      // 首先查看在饮食计划中的餐点类型
      if (recipeToMealTypeMap.has(recipeId)) {
        newCategory = recipeToMealTypeMap.get(recipeId);
        updateReason = 'mealType';
        updateResults.byMealType++;
      } 
      // 如果饮食计划中没有，则通过名称推断
      else {
        newCategory = inferCategoryFromName(recipe.name);
        updateReason = 'name';
        updateResults.byName++;
      }
      
      // 如果当前category与推断出的不同，则更新
      if (recipe.category !== newCategory) {
        console.log(`[更新] ID: ${recipeId} - 名称: ${recipe.name} - 旧分类: ${recipe.category} -> 新分类: ${newCategory} (根据${updateReason})`);
        
        recipe.category = newCategory;
        updates.push(recipe.save());
        updateResults.updatedRecipes++;
      } else {
        updateResults.unchanged++;
      }
      
      // 统计各分类数量
      updateResults.categories[newCategory]++;
    }
    
    // 5. 批量保存更新
    if (updates.length > 0) {
      await Promise.all(updates);
      console.log(`已更新 ${updates.length} 个菜谱的分类`);
    }
    
    // 6. 输出统计信息
    console.log('\n===== 更新统计 =====');
    console.log(`总菜谱数: ${updateResults.totalRecipes}`);
    console.log(`更新菜谱数: ${updateResults.updatedRecipes}`);
    console.log(`- 根据饮食计划餐点类型更新: ${updateResults.byMealType}`);
    console.log(`- 根据菜名推断更新: ${updateResults.byName}`);
    console.log(`未变更菜谱数: ${updateResults.unchanged}`);
    console.log('\n各分类菜谱数:');
    console.log(`- 早餐(breakfast): ${updateResults.categories.breakfast}`);
    console.log(`- 午餐(lunch): ${updateResults.categories.lunch}`);
    console.log(`- 晚餐(dinner): ${updateResults.categories.dinner}`);
    console.log(`- 加餐(snack): ${updateResults.categories.snack}`);
    
    // 保存日志到文件
    const logContent = JSON.stringify(updateResults, null, 2);
    fs.writeFileSync('recipe-category-update-log.json', logContent);
    console.log('\n统计信息已保存到 recipe-category-update-log.json');
    
  } catch (error) {
    console.error('修复菜谱分类失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('已断开与数据库的连接');
  }
}

// 执行主函数
fixRecipeCategories().then(() => {
  console.log('脚本执行完毕');
  process.exit(0);
}).catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
