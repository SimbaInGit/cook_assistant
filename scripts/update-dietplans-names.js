/**
 * 更新饮食计划表中的菜品名称
 * 
 * 该脚本用于更新 dietplans 表中的历史数据，
 * 从 recipes 表中获取各餐菜品名称，然后更新到 dietplans 表中的相应字段
 */

const mongoose = require('mongoose');
require('dotenv').config(); // 加载环境变量

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

// 定义饮食计划模型
const DietPlan = mongoose.model('DietPlan', new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  date: Date,
  meals: {
    breakfast: mongoose.Schema.Types.ObjectId,
    breakfastName: String,
    lunch: mongoose.Schema.Types.ObjectId,
    lunchName: String,
    dinner: mongoose.Schema.Types.ObjectId,
    dinnerName: String,
    morningSnack: mongoose.Schema.Types.ObjectId,
    morningSnackName: String,
    afternoonSnack: mongoose.Schema.Types.ObjectId,
    afternoonSnackName: String
  },
  nutritionSummary: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    fiber: Number
  },
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true }));

// 定义菜谱模型
const Recipe = mongoose.model('Recipe', new mongoose.Schema({
  name: String,
  // 其他字段省略，我们只需要 _id 和 name
}));

// 更新饮食计划中的菜品名称
const updateDietPlansNames = async () => {
  try {
    console.log('开始更新饮食计划中的菜品名称...');
    
    // 获取所有饮食计划
    const dietPlans = await DietPlan.find({}).lean();
    console.log(`找到 ${dietPlans.length} 个饮食计划需要更新`);
    
    let updateCount = 0;
    let errorCount = 0;
    
    // 处理每个饮食计划
    for (const plan of dietPlans) {
      try {
        const meals = plan.meals;
        const updates = {};
        let hasUpdates = false;
        
        // 处理早餐
        if (meals.breakfast && !meals.breakfastName) {
          const recipe = await Recipe.findById(meals.breakfast).lean();
          if (recipe && recipe.name) {
            updates['meals.breakfastName'] = recipe.name;
            hasUpdates = true;
            console.log(`饮食计划 ${plan._id}: 更新早餐名称为 "${recipe.name}"`);
          }
        }
        
        // 处理午餐
        if (meals.lunch && !meals.lunchName) {
          const recipe = await Recipe.findById(meals.lunch).lean();
          if (recipe && recipe.name) {
            updates['meals.lunchName'] = recipe.name;
            hasUpdates = true;
            console.log(`饮食计划 ${plan._id}: 更新午餐名称为 "${recipe.name}"`);
          }
        }
        
        // 处理晚餐
        if (meals.dinner && !meals.dinnerName) {
          const recipe = await Recipe.findById(meals.dinner).lean();
          if (recipe && recipe.name) {
            updates['meals.dinnerName'] = recipe.name;
            hasUpdates = true;
            console.log(`饮食计划 ${plan._id}: 更新晚餐名称为 "${recipe.name}"`);
          }
        }
        
        // 处理上午加餐
        if (meals.morningSnack && !meals.morningSnackName) {
          const recipe = await Recipe.findById(meals.morningSnack).lean();
          if (recipe && recipe.name) {
            updates['meals.morningSnackName'] = recipe.name;
            hasUpdates = true;
            console.log(`饮食计划 ${plan._id}: 更新上午加餐名称为 "${recipe.name}"`);
          }
        }
        
        // 处理下午加餐
        if (meals.afternoonSnack && !meals.afternoonSnackName) {
          const recipe = await Recipe.findById(meals.afternoonSnack).lean();
          if (recipe && recipe.name) {
            updates['meals.afternoonSnackName'] = recipe.name;
            hasUpdates = true;
            console.log(`饮食计划 ${plan._id}: 更新下午加餐名称为 "${recipe.name}"`);
          }
        }
        
        // 执行更新
        if (hasUpdates) {
          await DietPlan.updateOne({ _id: plan._id }, { $set: updates });
          updateCount++;
          console.log(`饮食计划 ${plan._id}: 更新成功`);
        }
      } catch (error) {
        console.error(`处理饮食计划 ${plan._id} 时出错:`, error);
        errorCount++;
      }
    }
    
    console.log('更新完成！');
    console.log(`成功更新: ${updateCount} 个饮食计划`);
    console.log(`失败: ${errorCount} 个饮食计划`);
    
  } catch (error) {
    console.error('更新过程中发生错误:', error);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  await updateDietPlansNames();
  console.log('脚本执行完毕，正在断开数据库连接...');
  await mongoose.connection.close();
  console.log('数据库连接已关闭');
};

// 执行主函数
main().catch(err => {
  console.error('脚本执行失败:', err);
  process.exit(1);
});
