const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries++;
      logger.error(`MongoDB connection attempt ${retries}/${maxRetries} failed: ${error.message}`);
      if (retries === maxRetries) {
        logger.error('Max retries reached. Exiting process.');
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err);
});

module.exports = connectDB;
