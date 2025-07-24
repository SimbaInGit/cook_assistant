/**
 * 更新饮食计划表中的菜品名称到新的结构
 * 
 * 该脚本用于将 dietplans 表中的数据结构更新为新的嵌套对象格式，
 * 每个餐食的引用和名称将组成一个对象。
 * 
 * 特性：
 * 1. 批量处理，防止内存溢出
 * 2. 断点续传，支持从指定位置继续执行
 * 3. 详细日志输出
 * 4. 错误处理与重试机制
 * 
 * 用法：
 * node migrate-dietplans-structure.js [--start=索引] [--batch=批次大小] [--dry-run]
 * 
 * 参数：
 * --start: 从指定索引开始处理（默认0）
 * --batch: 每批处理的数量（默认10）
 * --dry-run: 仅模拟执行，不实际更新数据库
 */

const mongoose = require('mongoose');
require('dotenv').config(); // 加载环境变量

// 解析命令行参数
const args = process.argv.slice(2).reduce((result, arg) => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=');
    result[key] = value !== undefined ? value : true;
  }
  return result;
}, {});

// 配置项
const config = {
  startIndex: parseInt(args.start || 0, 10),
  batchSize: parseInt(args.batch || 10, 10),
  dryRun: args['dry-run'] === true,
};

console.log('脚本配置:', config);

// 连接数据库
const connectDB = async () => {
  try {
    console.log('尝试连接数据库...');
    console.log(`MongoDB URI: ${process.env.MONGODB_URI.substring(0, 20)}...`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('数据库连接成功！');
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};

// 定义饮食计划模型（使用混合Schema，更符合数据库实际结构）
const mealSchema = new mongoose.Schema({
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
  name: String
}, { _id: false });

const OldDietPlan = mongoose.model('DietPlan', new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  date: Date,
  meals: {
    breakfast: { type: mongoose.Schema.Types.Mixed },
    lunch: { type: mongoose.Schema.Types.Mixed },
    dinner: { type: mongoose.Schema.Types.Mixed },
    morningSnack: { type: mongoose.Schema.Types.Mixed },
    afternoonSnack: { type: mongoose.Schema.Types.Mixed }
  },
  nutritionSummary: Object,
  createdAt: Date,
  updatedAt: Date
}, { collection: 'dietplans' })); // 指定集合名称

// 定义菜谱模型
const Recipe = mongoose.model('Recipe', new mongoose.Schema({
  name: String,
  // 其他字段省略，我们只需要 _id 和 name
}));

// 将饮食计划更新为新结构
const updateDietPlansStructure = async () => {
  try {
    console.log('开始更新饮食计划数据结构...');
    
    // 获取所有饮食计划
    const totalCount = await OldDietPlan.countDocuments({});
    console.log(`数据库中共有 ${totalCount} 个饮食计划`);
    
    // 分批查询和处理数据，支持从指定位置开始
    let processedCount = 0;
    let updateCount = 0;
    let errorCount = 0;
    let skipCount = config.startIndex;
    
    console.log(`将从第 ${skipCount} 条记录开始处理，每批 ${config.batchSize} 条记录`);
    
    // 记录开始时间
    const startTime = new Date();
    
    while (processedCount + skipCount < totalCount) {
      // 分批获取数据
      const dietPlans = await OldDietPlan.find({})
        .skip(skipCount + processedCount)
        .limit(config.batchSize)
        .lean();
      
      if (dietPlans.length === 0) break;
      
      console.log(`正在处理第 ${skipCount + processedCount + 1} 至 ${skipCount + processedCount + dietPlans.length} 条记录，总共 ${totalCount} 条`);
      
      // 处理每个饮食计划
      for (const plan of dietPlans) {
        try {
          const oldMeals = plan.meals || {};
          const updates = { $set: { 'meals': {} } };
          let hasUpdates = false;
          
          // 处理早餐
          if (oldMeals.breakfast) {
            let breakfastName = '未命名早餐';
            let recipeId = oldMeals.breakfast;
            
            // 检查现有数据是否已经是新格式
            if (typeof oldMeals.breakfast === 'object' && oldMeals.breakfast !== null) {
              if (oldMeals.breakfast.recipe) {
                recipeId = oldMeals.breakfast.recipe;
                breakfastName = oldMeals.breakfast.name || '未命名早餐';
                console.log(`[${plan._id}] 早餐已经是新格式，使用现有数据`);
              }
            } else {
              // 旧格式，查找菜谱名称
              try {
                const recipe = await Recipe.findById(recipeId).lean();
                if (recipe && recipe.name) {
                  breakfastName = recipe.name;
                  console.log(`[${plan._id}] 找到早餐菜谱名称: "${breakfastName}"`);
                }
              } catch (e) {
                console.error(`[${plan._id}] 获取早餐菜谱名称出错:`, e);
              }
            }
            
            updates.$set['meals.breakfast'] = {
              recipe: recipeId,
              name: breakfastName
            };
            hasUpdates = true;
          }
          
          // 处理午餐
          if (oldMeals.lunch) {
            let lunchName = '未命名午餐';
            let recipeId = oldMeals.lunch;
            
            // 检查现有数据是否已经是新格式
            if (typeof oldMeals.lunch === 'object' && oldMeals.lunch !== null) {
              if (oldMeals.lunch.recipe) {
                recipeId = oldMeals.lunch.recipe;
                lunchName = oldMeals.lunch.name || '未命名午餐';
                console.log(`[${plan._id}] 午餐已经是新格式，使用现有数据`);
              }
            } else {
              // 旧格式，查找菜谱名称
              try {
                const recipe = await Recipe.findById(recipeId).lean();
                if (recipe && recipe.name) {
                  lunchName = recipe.name;
                  console.log(`[${plan._id}] 找到午餐菜谱名称: "${lunchName}"`);
                }
              } catch (e) {
                console.error(`[${plan._id}] 获取午餐菜谱名称出错:`, e);
              }
            }
            
            updates.$set['meals.lunch'] = {
              recipe: recipeId,
              name: lunchName
            };
            hasUpdates = true;
          }
          
          // 处理晚餐
          if (oldMeals.dinner) {
            let dinnerName = '未命名晚餐';
            let recipeId = oldMeals.dinner;
            
            // 检查现有数据是否已经是新格式
            if (typeof oldMeals.dinner === 'object' && oldMeals.dinner !== null) {
              if (oldMeals.dinner.recipe) {
                recipeId = oldMeals.dinner.recipe;
                dinnerName = oldMeals.dinner.name || '未命名晚餐';
                console.log(`[${plan._id}] 晚餐已经是新格式，使用现有数据`);
              }
            } else {
              // 旧格式，查找菜谱名称
              try {
                const recipe = await Recipe.findById(recipeId).lean();
                if (recipe && recipe.name) {
                  dinnerName = recipe.name;
                  console.log(`[${plan._id}] 找到晚餐菜谱名称: "${dinnerName}"`);
                }
              } catch (e) {
                console.error(`[${plan._id}] 获取晚餐菜谱名称出错:`, e);
              }
            }
            
            updates.$set['meals.dinner'] = {
              recipe: recipeId,
              name: dinnerName
            };
            hasUpdates = true;
          }
          
          // 处理上午加餐
          if (oldMeals.morningSnack) {
            let morningSnackName = '未命名上午加餐';
            let recipeId = oldMeals.morningSnack;
            
            // 检查现有数据是否已经是新格式
            if (typeof oldMeals.morningSnack === 'object' && oldMeals.morningSnack !== null) {
              if (oldMeals.morningSnack.recipe) {
                recipeId = oldMeals.morningSnack.recipe;
                morningSnackName = oldMeals.morningSnack.name || '未命名上午加餐';
                console.log(`[${plan._id}] 上午加餐已经是新格式，使用现有数据`);
              }
            } else {
              // 旧格式，查找菜谱名称
              try {
                const recipe = await Recipe.findById(recipeId).lean();
                if (recipe && recipe.name) {
                  morningSnackName = recipe.name;
                  console.log(`[${plan._id}] 找到上午加餐菜谱名称: "${morningSnackName}"`);
                }
              } catch (e) {
                console.error(`[${plan._id}] 获取上午加餐菜谱名称出错:`, e);
              }
            }
            
            updates.$set['meals.morningSnack'] = {
              recipe: recipeId,
              name: morningSnackName
            };
            hasUpdates = true;
          }
          
          // 处理下午加餐
          if (oldMeals.afternoonSnack) {
            let afternoonSnackName = '未命名下午加餐';
            let recipeId = oldMeals.afternoonSnack;
            
            // 检查现有数据是否已经是新格式
            if (typeof oldMeals.afternoonSnack === 'object' && oldMeals.afternoonSnack !== null) {
              if (oldMeals.afternoonSnack.recipe) {
                recipeId = oldMeals.afternoonSnack.recipe;
                afternoonSnackName = oldMeals.afternoonSnack.name || '未命名下午加餐';
                console.log(`[${plan._id}] 下午加餐已经是新格式，使用现有数据`);
              }
            } else {
              // 旧格式，查找菜谱名称
              try {
                const recipe = await Recipe.findById(recipeId).lean();
                if (recipe && recipe.name) {
                  afternoonSnackName = recipe.name;
                  console.log(`[${plan._id}] 找到下午加餐菜谱名称: "${afternoonSnackName}"`);
                }
              } catch (e) {
                console.error(`[${plan._id}] 获取下午加餐菜谱名称出错:`, e);
              }
            }
            
            updates.$set['meals.afternoonSnack'] = {
              recipe: recipeId,
              name: afternoonSnackName
            };
            hasUpdates = true;
          }
          
          // 执行更新
          if (hasUpdates && !config.dryRun) {
            try {
              // 使用 findByIdAndUpdate 而不是 updateOne，可能更好地处理模式验证
              await OldDietPlan.findByIdAndUpdate(
                plan._id,
                updates,
                { new: true, runValidators: false }
              );
              updateCount++;
              console.log(`[${plan._id}] 更新成功`);
            } catch (updateError) {
              console.error(`[${plan._id}] 更新失败:`, updateError);
              
              // 尝试直接替换整个 meals 对象
              try {
                console.log(`[${plan._id}] 尝试使用替代方法更新...`);
                const updatedMeals = {};
                
                if (updates.$set['meals.breakfast']) updatedMeals.breakfast = updates.$set['meals.breakfast'];
                if (updates.$set['meals.lunch']) updatedMeals.lunch = updates.$set['meals.lunch'];
                if (updates.$set['meals.dinner']) updatedMeals.dinner = updates.$set['meals.dinner'];
                if (updates.$set['meals.morningSnack']) updatedMeals.morningSnack = updates.$set['meals.morningSnack'];
                if (updates.$set['meals.afternoonSnack']) updatedMeals.afternoonSnack = updates.$set['meals.afternoonSnack'];
                
                await OldDietPlan.findByIdAndUpdate(
                  plan._id, 
                  { $set: { meals: updatedMeals } },
                  { new: true, runValidators: false }
                );
                updateCount++;
                console.log(`[${plan._id}] 使用替代方法更新成功`);
              } catch (alternativeError) {
                console.error(`[${plan._id}] 替代更新方法也失败:`, alternativeError);
                errorCount++;
              }
            }
          } else if (hasUpdates && config.dryRun) {
            // 干运行模式，不实际更新数据库
            updateCount++;
            console.log(`[${plan._id}] 模拟更新成功 (dry-run模式)`);
            console.log(`  更新内容:`, JSON.stringify(updates.$set).substring(0, 100) + '...');
          }
        } catch (error) {
          console.error(`[${plan._id}] 处理饮食计划时出错:`, error);
          errorCount++;
        }
      }
      
      processedCount += dietPlans.length;
      
      // 计算进度和预估剩余时间
      const elapsedMs = new Date() - startTime;
      const msPerRecord = elapsedMs / processedCount;
      const remainingRecords = totalCount - (skipCount + processedCount);
      const remainingMs = remainingRecords * msPerRecord;
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      
      console.log(`已处理: ${processedCount}/${totalCount - skipCount} 条记录 (${(processedCount / (totalCount - skipCount) * 100).toFixed(2)}%)`);
      console.log(`成功更新: ${updateCount} 个饮食计划, 失败: ${errorCount} 个饮食计划`);
      console.log(`预计剩余时间: 约 ${remainingMinutes} 分钟`);
      
      // 每批处理完暂停一下，避免对数据库造成过大压力
      if (processedCount < totalCount - skipCount) {
        console.log('暂停2秒后继续处理...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // 计算总耗时
    const totalTimeMs = new Date() - startTime;
    const totalMinutes = Math.floor(totalTimeMs / 60000);
    const totalSeconds = Math.floor((totalTimeMs % 60000) / 1000);
    
    console.log('更新完成！');
    console.log(`总计处理: ${processedCount} 个饮食计划`);
    console.log(`成功更新: ${updateCount} 个饮食计划`);
    console.log(`失败: ${errorCount} 个饮食计划`);
    console.log(`总耗时: ${totalMinutes}分${totalSeconds}秒`);
    
    // 如果是断点续传，提供继续执行的命令
    if (skipCount > 0 || processedCount < totalCount) {
      const nextStartIndex = skipCount + processedCount;
      console.log(`\n如需继续从第 ${nextStartIndex} 条记录开始处理，请执行:`);
      console.log(`node scripts/migrate-dietplans-structure.js --start=${nextStartIndex} --batch=${config.batchSize}`);
    }
    
  } catch (error) {
    console.error('更新过程中发生错误:', error);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  await updateDietPlansStructure();
  console.log('脚本执行完毕，正在断开数据库连接...');
  await mongoose.connection.close();
  console.log('数据库连接已关闭');
};

// 执行主函数
main().catch(err => {
  console.error('脚本执行失败:', err);
  process.exit(1);
});
