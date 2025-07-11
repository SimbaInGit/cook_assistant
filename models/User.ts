import mongoose, { Document, Schema } from 'mongoose';

// 用户个人健康信息接口
export interface IUserHealth {
  dueDate: Date;            // 预产期
  currentWeek?: number;     // 当前孕周
  allergies?: string[];     // 过敏原
  dislikedFoods?: string[]; // 不喜欢的食物
  healthConditions?: {      // 健康状况
    gestationalDiabetes?: boolean;  // 妊娠期糖尿病
    anemia?: boolean;               // 贫血
    hypertension?: boolean;         // 高血压
    other?: string;                 // 其他健康状况
  };
}

// 用户接口
export interface IUser extends Document {
  name: string;             // 用户名
  email: string;            // 电子邮箱
  password: string;         // 密码
  healthInfo?: IUserHealth; // 健康信息
  createdAt: Date;          // 创建时间
  updatedAt: Date;          // 更新时间
}

// 用户模型Schema
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, '请输入姓名'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, '请输入电子邮箱'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的电子邮箱地址'],
    },
    password: {
      type: String,
      required: [true, '请设置密码'],
      minlength: [6, '密码长度至少为6位'],
    },
    healthInfo: {
      dueDate: {
        type: Date,
      },
      currentWeek: {
        type: Number,
        min: 1,
        max: 42,
      },
      allergies: {
        type: [String],
        default: [],
      },
      dislikedFoods: {
        type: [String],
        default: [],
      },
      healthConditions: {
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
        other: {
          type: String,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// 避免在测试环境中重复编译模型
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
