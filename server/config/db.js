const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error", { message: err.message, stack: err.stack });
  });
  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB reconnected");
  });

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error("MongoDB initial connection failed", { message: err.message, stack: err.stack });
    process.exit(1);
  }
};

module.exports = connectDB;
