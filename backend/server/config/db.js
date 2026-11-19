const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("⚠️  MONGODB_URI is not set in environment or .env file. Running without MongoDB connection.");
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn("⚠️  Please verify your MONGODB_URI, Atlas IP Access List (0.0.0.0/0), and database user credentials.");
    return false;
  }
};

module.exports = connectDB;
