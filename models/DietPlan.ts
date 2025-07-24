import mongoose, { Document, Schema } from 'mongoose';
import { IRecipe } from './Recipe';

// 餐食接口
interface IMeal {
  recipe: mongoose.Types.ObjectId | IRecipe; // 菜谱引用
  name: string;                             // 菜谱名称
}

// 饮食计划接口（一天的饮食计划）
export interface IDietPlan extends Document {
  userId: mongoose.Types.ObjectId; // 用户ID
  date: Date;                     // 日期
  meals: {
    breakfast: IMeal;             // 早餐
    lunch: IMeal;                 // 午餐
    dinner: IMeal;                // 晚餐
    morningSnack?: IMeal;         // 上午加餐
    afternoonSnack?: IMeal;       // 下午加餐
  };
  nutritionSummary?: {           // 营养总结
    calories: number;            // 总卡路里
    protein: number;             // 总蛋白质
    fat: number;                 // 总脂肪
    carbs: number;               // 总碳水化合物
    fiber: number;               // 总纤维
  };
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}

// 饮食计划模型Schema
const DietPlanSchema = new Schema<IDietPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '用户ID是必需的'],
    },
    date: {
      type: Date,
      required: [true, '日期是必需的'],
      default: Date.now,
    },
    meals: {
      breakfast: {
        recipe: {
          type: Schema.Types.ObjectId,
          ref: 'Recipe',
          required: [true, '早餐菜谱是必需的'],
        },
        name: {
          type: String,
          required: [true, '早餐名称是必需的'],
        }
      },
      lunch: {
        recipe: {
          type: Schema.Types.ObjectId,
          ref: 'Recipe',
          required: [true, '午餐菜谱是必需的'],
        },
        name: {
          type: String,
          required: [true, '午餐名称是必需的'],
        }
      },
      dinner: {
        recipe: {
          type: Schema.Types.ObjectId,
          ref: 'Recipe',
          required: [true, '晚餐菜谱是必需的'],
        },
        name: {
          type: String,
          required: [true, '晚餐名称是必需的'],
        }
      },
      morningSnack: {
        recipe: {
          type: Schema.Types.ObjectId,
          ref: 'Recipe',
        },
        name: {
          type: String,
        }
      },
      afternoonSnack: {
        recipe: {
          type: Schema.Types.ObjectId,
          ref: 'Recipe',
        },
        name: {
          type: String,
        }
      },
    },
    nutritionSummary: {
      calories: {
        type: Number,
        required: [true, '总卡路里是必需的'],
      },
      protein: {
        type: Number,
        required: [true, '总蛋白质是必需的'],
      },
      fat: {
        type: Number,
        required: [true, '总脂肪是必需的'],
      },
      carbs: {
        type: Number,
        required: [true, '总碳水化合物是必需的'],
      },
      fiber: {
        type: Number,
        required: [true, '总纤维是必需的'],
      },
    },
  },
  {
    timestamps: true,
  }
);

// 创建索引以便快速查找
DietPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

// 避免在测试环境中重复编译模型
export default mongoose.models.DietPlan || mongoose.model<IDietPlan>('DietPlan', DietPlanSchema);
