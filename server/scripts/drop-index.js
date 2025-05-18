// Lưu tệp này dưới dạng server/scripts/drop-index.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

// Kết nối tới MongoDB
const dropOrderIdIndex = async () => {
  try {
    console.log("Connecting to MongoDB...");
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(); // Lấy cơ sở dữ liệu mặc định từ URI

    console.log("Connected successfully! Attempting to drop index...");

    // Liệt kê tất cả các chỉ mục
    const indexes = await db.collection("orders").indexes();
    console.log("Current indexes:", indexes);

    // Xóa chỉ mục orderId_1
    try {
      const result = await db.collection("orders").dropIndex("orderId_1");
      console.log("Index dropped successfully:", result);
    } catch (error) {
      console.log("Error dropping index:", error.message);
      // Nếu chỉ mục không tồn tại, đó là lỗi thông thường, có thể bỏ qua
      if (!error.message.includes("index not found")) {
        throw error;
      }
    }

    console.log("Closing connection...");
    await client.close();
    console.log("Done!");
  } catch (error) {
    console.error("Script failed:", error);
  }
};

// Chạy tập lệnh
dropOrderIdIndex();
