const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.log("MONGO_URI not found. Using in-memory transactions.");
    return false;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Mongo connection error: ${error.message}`);
    console.log("Using in-memory transactions as fallback.");
    return false;
  }
};

module.exports = connectDB;
