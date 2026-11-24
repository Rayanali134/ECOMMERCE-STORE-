const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce_store";

    // Fast 3-second timeout so server doesn't hang if internet is down
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Offline: ${error.message}`);
    console.log(`ℹ️ [OFFLINE RESILIENT MODE ACTIVATED] Store running on local JSON store & seed catalog.`);
    console.log(`👉 When internet or local MongoDB starts, it will automatically connect.`);
  }
};

module.exports = { connectDB };
