const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
const outputDir = path.join(__dirname, '..', process.env.OUTPUT_DIR || 'outputs');
const TTL_MINUTES = parseInt(process.env.FILE_TTL_MINUTES) || 30;

/**
 * Delete a single file safely
 */
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (err) {
    console.error(`⚠️  Could not delete file ${filePath}:`, err.message);
  }
  return false;
};

/**
 * Delete multiple files safely
 */
const deleteFiles = (filePaths = []) => {
  filePaths.forEach((fp) => deleteFile(fp));
};

/**
 * Clean files older than TTL_MINUTES from a directory
 */
const cleanDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) return;

  const now = Date.now();
  const ttlMs = TTL_MINUTES * 60 * 1000;
  let cleaned = 0;

  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isFile() && now - stat.mtimeMs > ttlMs) {
          fs.unlinkSync(fullPath);
          cleaned++;
        }
      } catch {
        // skip files that can't be stat-d
      }
    }
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired file(s) from ${path.basename(dirPath)}/`);
    }
  } catch (err) {
    console.error(`⚠️  Error cleaning directory ${dirPath}:`, err.message);
  }
};

/**
 * Start the cleanup cron job — runs every 10 minutes
 */
const startCleanupScheduler = () => {
  cron.schedule('*/10 * * * *', () => {
    cleanDirectory(uploadDir);
    cleanDirectory(outputDir);
  });
  console.log(`🕐 File cleanup scheduler started (TTL: ${TTL_MINUTES} min)`);
};

/**
 * Get the full path in outputs directory
 */
const getOutputPath = (filename) => path.join(outputDir, filename);

/**
 * Get the full path in uploads directory
 */
const getUploadPath = (filename) => path.join(uploadDir, filename);

/**
 * Build a public download URL for an output file
 */
const buildDownloadUrl = (req, filename) => {
  return `/outputs/${filename}`;
};

/**
 * Format bytes to human-readable size
 */
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

module.exports = {
  deleteFile,
  deleteFiles,
  cleanDirectory,
  startCleanupScheduler,
  getOutputPath,
  getUploadPath,
  buildDownloadUrl,
  formatBytes,
};
