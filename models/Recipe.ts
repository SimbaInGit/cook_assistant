import mongoose, { Document, Schema } from 'mongoose';

// 食谱接口（单个菜品）
export interface IRecipe extends Document {
  name: string;           // 菜品名称
  category: string;       // 分类 (早餐/午餐/晚餐/加餐)
  image?: string;         // 菜品图片URL
  ingredients: {          // 食材列表
    name: string;         // 食材名称
    amount: string;       // 食材用量
  }[];
  steps: string[];        // 烹饪步骤
  preparationTime: number; // 准备时间(分钟)
  cookingTime: number;    // 烹饪时间(分钟)
  nutrition: {            // 营养信息
    calories: number;     // 卡路里
    protein: number;      // 蛋白质(克)
    fat: number;          // 脂肪(克)
    carbs: number;        // 碳水化合物(克)
    fiber: number;        // 纤维(克)
    calcium?: number;     // 钙(毫克)
    iron?: number;        // 铁(毫克)
    folicAcid?: number;   // 叶酸(微克)
    vitaminC?: number;    // 维生素C(毫克)
    vitaminE?: number;    // 维生素E(毫克)
  };
  tips?: string[];        // 孕期小贴士
  isPregnancySafe: boolean; // 是否适合孕妇食用
  trimesterSuitability: {  // 适合的孕期
    first: boolean;       // 第一孕期
    second: boolean;      // 第二孕期
    third: boolean;       // 第三孕期
  };
  suitableConditions?: {  // 适合的健康状况
    gestationalDiabetes?: boolean; // 妊娠期糖尿病
    anemia?: boolean;     // 贫血
    hypertension?: boolean; // 高血压
  };
  createdAt: Date;        // 创建时间
  updatedAt: Date;        // 更新时间
}

// 食谱模型Schema
const RecipeSchema = new Schema<IRecipe>(
  {
    name: {
      type: String,
      required: [true, '请输入菜品名称'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, '请选择菜品分类'],
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    },
    image: {
      type: String,
    },
    ingredients: [
      {
        name: {
          type: String,
          required: [true, '请输入食材名称'],
        },
        amount: {
          type: String,
          required: [true, '请输入食材用量'],
        },
      },
    ],
    steps: {
      type: [String],
      required: [true, '请输入烹饪步骤'],
    },
    preparationTime: {
      type: Number,
      required: [true, '请输入准备时间'],
      min: [0, '时间不能小于0'],
    },
    cookingTime: {
      type: Number,
      required: [true, '请输入烹饪时间'],
      min: [0, '时间不能小于0'],
    },
    nutrition: {
      calories: {
        type: Number,
        required: [true, '请输入卡路里'],
      },
      protein: {
        type: Number,
        required: [true, '请输入蛋白质含量'],
      },
      fat: {
        type: Number,
        required: [true, '请输入脂肪含量'],
      },
      carbs: {
        type: Number,
        required: [true, '请输入碳水化合物含量'],
      },
      fiber: {
        type: Number,
        required: [true, '请输入纤维含量'],
      },
      calcium: Number,
      iron: Number,
      folicAcid: Number,
      vitaminC: Number,
      vitaminE: Number,
    },
    tips: [String],
    isPregnancySafe: {
      type: Boolean,
      required: [true, '请标明是否适合孕妇食用'],
      default: true,
    },
    trimesterSuitability: {
      first: {
        type: Boolean,
        default: true,
      },
      second: {
        type: Boolean,
        default: true,
      },
      third: {
        type: Boolean,
        default: true,
      },
    },
    suitableConditions: {
      gestationalDiabetes: {
        type: Boolean,
        default: false,
      },
      anemia: {
        type: Boolean,
        default: false,
      },
      hypertension: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// 避免在测试环境中重复编译模型
export default mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);
