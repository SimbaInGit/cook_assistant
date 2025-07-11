import mongoose, { Document, Schema } from 'mongoose';

// 食物安全数据接口
export interface IFoodSafety extends Document {
  name: string;           // 食物名称
  category: string;       // 食物分类
  safetyLevel: string;    // 安全级别 (放心吃/适量吃/要慎吃/不能吃)
  description: string;    // 食物描述
  reason: string;         // 安全级别原因
  alternatives?: string[]; // 替代食物
  tips?: string[];        // 食用小贴士
  createdAt: Date;        // 创建时间
  updatedAt: Date;        // 更新时间
}

// 食物安全数据模型Schema
const FoodSafetySchema = new Schema<IFoodSafety>(
  {
    name: {
      type: String,
      required: [true, '请输入食物名称'],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, '请选择食物分类'],
      enum: [
        'fruits', // 水果类
        'vegetables', // 蔬菜类
        'meat', // 肉类
        'seafood', // 海鲜类
        'dairy', // 乳制品
        'grains', // 谷物类
        'nuts', // 坚果类
        'drinks', // 饮品类
        'herbs', // 草药类
        'snacks', // 零食类
        'other', // 其他
      ],
    },
    safetyLevel: {
      type: String,
      required: [true, '请选择安全级别'],
      enum: ['safe', 'moderate', 'caution', 'unsafe'],
      // safe: 放心吃
      // moderate: 适量吃
      // caution: 要慎吃
      // unsafe: 不能吃
    },
    description: {
      type: String,
      required: [true, '请输入食物描述'],
    },
    reason: {
      type: String,
      required: [true, '请输入安全级别原因'],
    },
    alternatives: [String], // 替代食物
    tips: [String], // 食用小贴士
  },
  {
    timestamps: true,
  }
);

// 创建索引以便快速查找
FoodSafetySchema.index({ name: 'text', description: 'text' });

// 避免在测试环境中重复编译模型
export default mongoose.models.FoodSafety || mongoose.model<IFoodSafety>('FoodSafety', FoodSafetySchema);
