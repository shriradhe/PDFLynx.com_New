const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log rotation: max 10MB per file, keep last 5 files
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_LOG_FILES = 5;

const rotateLog = (logPath) => {
  try {
    const stat = fs.statSync(logPath);
    if (stat.size > MAX_LOG_SIZE) {
      // Rotate: delete oldest, rename others, create new
      const lastLog = `${logPath}.${MAX_LOG_FILES - 1}`;
      if (fs.existsSync(lastLog)) fs.unlinkSync(lastLog);
      for (let i = MAX_LOG_FILES - 2; i >= 0; i--) {
        const src = i === 0 ? logPath : `${logPath}.${i}`;
        if (fs.existsSync(src)) fs.renameSync(src, `${logPath}.${i + 1}`);
      }
    }
  } catch (err) {
    // ignore rotation errors
  }
};

const writeLog = (logPath, message) => {
  try {
    rotateLog(logPath);
    fs.appendFile(logPath, message + '\n', (err) => {
      if (err) console.error('Failed to write log:', err.message);
    });
  } catch (err) {
    console.error('Log rotation failed:', err.message);
  }
};

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  http: '\x1b[35m',
  debug: '\x1b[32m',
  reset: '\x1b[0m',
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
};

const logger = {
  error: (message, meta = {}) => {
    const msg = formatMessage('error', message, meta);
    console.error(`${colors.error}${msg}${colors.reset}`);
    writeLog(path.join(logDir, 'error.log'), msg);
  },
  warn: (message, meta = {}) => {
    const msg = formatMessage('warn', message, meta);
    if (levels[level()] >= levels.warn) {
      console.log(`${colors.warn}${msg}${colors.reset}`);
    }
    writeLog(path.join(logDir, 'combined.log'), msg);
  },
  info: (message, meta = {}) => {
    const msg = formatMessage('info', message, meta);
    if (levels[level()] >= levels.info) {
      console.log(`${colors.info}${msg}${colors.reset}`);
    }
    writeLog(path.join(logDir, 'combined.log'), msg);
  },
  http: (message, meta = {}) => {
    const msg = formatMessage('http', message, meta);
    if (levels[level()] >= levels.http) {
      console.log(`${colors.http}${msg}${colors.reset}`);
    }
    writeLog(path.join(logDir, 'combined.log'), msg);
  },
  debug: (message, meta = {}) => {
    const msg = formatMessage('debug', message, meta);
    if (levels[level()] >= levels.debug) {
      console.log(`${colors.debug}${msg}${colors.reset}`);
    }
    writeLog(path.join(logDir, 'combined.log'), msg);
  },
};

module.exports = logger;
