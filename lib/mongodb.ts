// 数据库连接文件
import mongoose from 'mongoose';

// MongoDB连接字符串
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pregnancy-diet-assistant';

// 全局变量避免重复连接
let cachedDb: typeof mongoose | null = null;

/**
 * 连接到MongoDB数据库
 */
export async function connectToDatabase() {
  // 检查是否已经存在缓存的连接
  if (cachedDb) {
    return { db: cachedDb };
  }

  // 创建新连接
  const db = await mongoose.connect(MONGODB_URI);
  
  // 缓存连接
  cachedDb = db;
  
  return { db };
}

/**
 * 断开与MongoDB数据库的连接（仅在测试环境使用）
 */
export async function disconnectFromDatabase() {
  if (cachedDb) {
    await mongoose.disconnect();
    cachedDb = null;
  }
}
