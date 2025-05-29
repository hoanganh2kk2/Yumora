// Lưu tệp này dưới dạng server/scripts/drop-index.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

// Kết nối tới MongoDB và xóa unique index
const dropOrderIdIndex = async () => {
  let client;

  try {
    console.log("🔗 Connecting to MongoDB...");
    console.log("URI:", process.env.MONGODB_URI ? "✅ Found" : "❌ Missing");

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    // Kết nối tới MongoDB
    client = await MongoClient.connect(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
    });

    const db = client.db(); // Lấy database từ URI
    const collection = db.collection("orders");

    console.log("✅ Connected successfully!");

    // Liệt kê tất cả các index hiện tại
    console.log("\n📋 Current indexes:");
    const indexes = await collection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    // Kiểm tra và xóa index orderId_1 nếu tồn tại
    const orderIdIndexExists = indexes.some(
      (index) => index.name === "orderId_1"
    );

    if (orderIdIndexExists) {
      console.log("\n🗑️  Dropping orderId_1 index...");

      try {
        const result = await collection.dropIndex("orderId_1");
        console.log("✅ Successfully dropped orderId_1 index:", result);
      } catch (dropError) {
        if (dropError.message.includes("index not found")) {
          console.log("ℹ️  Index orderId_1 not found (already dropped)");
        } else {
          throw dropError;
        }
      }
    } else {
      console.log(
        "\nℹ️  orderId_1 index not found (already dropped or never existed)"
      );
    }

    // Kiểm tra và xóa các index khác liên quan đến orderId nếu cần
    const otherOrderIdIndexes = indexes.filter(
      (index) => index.name.includes("orderId") && index.name !== "orderId_1"
    );

    if (otherOrderIdIndexes.length > 0) {
      console.log("\n🔍 Found other orderId-related indexes:");
      otherOrderIdIndexes.forEach((index) => {
        console.log(`- ${index.name}:`, JSON.stringify(index.key));
      });

      // Xóa các unique index khác nếu có
      for (const index of otherOrderIdIndexes) {
        if (index.unique) {
          console.log(`🗑️  Dropping unique index: ${index.name}`);
          try {
            await collection.dropIndex(index.name);
            console.log(`✅ Dropped ${index.name}`);
          } catch (error) {
            console.log(`⚠️  Could not drop ${index.name}:`, error.message);
          }
        }
      }
    }

    // Tạo lại index thường (không unique) cho orderId
    console.log("\n🔧 Creating new non-unique index for orderId...");
    try {
      await collection.createIndex({ orderId: 1 }, { background: true });
      console.log("✅ Created new non-unique index for orderId");
    } catch (createError) {
      console.log("⚠️  Could not create new index:", createError.message);
    }

    // Tạo compound indexes để tối ưu performance
    console.log("\n🔧 Creating compound indexes for better performance...");

    const compoundIndexes = [
      { userId: 1, orderId: 1 },
      { userId: 1, createdAt: -1 },
      { orderId: 1, createdAt: -1 },
    ];

    for (const indexSpec of compoundIndexes) {
      try {
        await collection.createIndex(indexSpec, { background: true });
        console.log(`✅ Created compound index:`, JSON.stringify(indexSpec));
      } catch (createError) {
        if (createError.message.includes("already exists")) {
          console.log(
            `ℹ️  Compound index already exists:`,
            JSON.stringify(indexSpec)
          );
        } else {
          console.log(
            `⚠️  Could not create compound index:`,
            createError.message
          );
        }
      }
    }

    // Hiển thị index cuối cùng
    console.log("\n📋 Final indexes:");
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach((index, i) => {
      const uniqueText = index.unique ? " (UNIQUE)" : "";
      console.log(
        `${i + 1}. ${index.name}${uniqueText}:`,
        JSON.stringify(index.key)
      );
    });

    console.log("\n🎉 Index migration completed successfully!");
  } catch (error) {
    console.error("\n❌ Script failed:", error);
    console.error("Error details:", error.message);

    if (error.message.includes("authentication")) {
      console.log("\n💡 Suggestions:");
      console.log("- Check your MongoDB URI credentials");
      console.log("- Ensure the user has proper permissions");
    } else if (error.message.includes("ENOTFOUND")) {
      console.log("\n💡 Suggestions:");
      console.log("- Check your internet connection");
      console.log("- Verify the MongoDB server address");
    }

    process.exit(1);
  } finally {
    if (client) {
      console.log("\n🔒 Closing connection...");
      await client.close();
      console.log("✅ Connection closed.");
    }
  }
};

// Thêm validation cho environment
const validateEnvironment = () => {
  if (!process.env.MONGODB_URI) {
    console.error("❌ Error: MONGODB_URI environment variable is required");
    console.log("\n💡 Please set your MongoDB URI in .env file:");
    console.log("MONGODB_URI=mongodb://localhost:27017/your_database");
    console.log("or");
    console.log(
      "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database"
    );
    process.exit(1);
  }
};

// Chạy script
console.log("🚀 Starting MongoDB Index Migration Script");
console.log("==========================================");

validateEnvironment();
dropOrderIdIndex();
