const logger = require('./logger');

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (process.env.JWT_SECRET === 'changeme_please_set_this' || process.env.JWT_SECRET.length < 32) {
    logger.warn('JWT_SECRET is weak or using default value. Use a strong random string (at least 32 characters).');
  }

  if (process.env.NODE_ENV === 'production' && process.env.CLIENT_URL === 'http://localhost:5173') {
    logger.warn('CLIENT_URL is set to localhost in production. This may cause CORS issues.');
  }

  logger.info('Environment variables validated successfully.');
};

module.exports = validateEnv;
