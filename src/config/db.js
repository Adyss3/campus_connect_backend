const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI defined in .env
 * Exits the process on failure — a broken DB connection is not recoverable.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options prevent deprecation warnings in Mongoose 7+
      serverSelectionTimeoutMS: 5000, // fail fast if DB is unreachable
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌  MongoDB connection failed: ${error.message}`);
    process.exit(1); // non-zero exit signals a failed startup
  }
};

module.exports = connectDB;
