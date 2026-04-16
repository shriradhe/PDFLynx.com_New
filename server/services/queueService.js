const logger = require('../utils/logger');
const pdfService = require('./pdfService');
const FileRecord = require('../models/FileRecord');
const { getOutputPath, buildDownloadUrl, formatBytes } = require('../utils/fileHelper');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

let connection;
let pdfQueue;
let pdfWorker;
let redisEnabled = process.env.REDIS_ENABLED !== 'false';

const getRedisConnection = () => {
  if (!connection) {
    const IORedis = require('ioredis');
    connection = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
    connection.on('error', (err) => logger.error('Redis connection error:', err.message));
    connection.on('connect', () => logger.info('Redis connected'));
  }
  return connection;
};

const processJob = async (jobData) => {
  const { tool, filePaths, options, recordId, userId } = jobData;
  logger.info(`Processing job: ${tool}`);

  const startTime = Date.now();
  let result;
  switch (tool) {
    case 'merge':
      result = await pdfService.mergePDFs(filePaths);
      break;
    case 'split':
      result = await pdfService.splitPDF(filePaths[0], options.splitMode, options.value);
      break;
    case 'compress':
      result = await pdfService.compressPDF(filePaths[0]);
      break;
    case 'rotate':
      result = await pdfService.rotatePDF(filePaths[0], options.rotation, options.pageNumbers);
      break;
    case 'watermark':
      result = await pdfService.addWatermark(filePaths[0], options.text, options);
      break;
    case 'protect':
      result = await pdfService.protectPDF(filePaths[0], options.userPassword, options.ownerPassword);
      break;
    case 'unlock':
      result = await pdfService.unlockPDF(filePaths[0], options.password);
      break;
    case 'page-numbers':
      result = await pdfService.addPageNumbers(filePaths[0], options);
      break;
    case 'ocr':
      result = await pdfService.performOCR(filePaths[0]);
      break;
    case 'sign':
      result = await pdfService.signPDF(filePaths[0], options);
      break;
    case 'edit':
      result = await pdfService.editPDF(filePaths[0], options.edits);
      break;
    case 'pdf-to-text':
      result = await pdfService.pdfToText(filePaths[0]);
      break;
    case 'pdf-to-png':
      result = await pdfService.pdfToPng(filePaths[0], options.scale || 2.0);
      break;
    case 'pdf-to-jpg':
      result = await pdfService.pdfToImages(filePaths[0], options.scale || 2.0);
      break;
    case 'jpg-to-pdf':
      result = await pdfService.imageToPDF(filePaths);
      break;
    case 'pdf-to-word':
      result = await pdfService.pdfToWord(filePaths[0]);
      break;
    case 'organize':
      result = await pdfService.organizePDF(filePaths[0], options.pageOrder);
      break;
    case 'redact':
      result = await pdfService.redactPDF(filePaths[0], options.regions);
      break;
    case 'html-to-pdf':
      result = await pdfService.htmlToPDF(options.html, options.pdfOptions);
      break;
    default:
      throw new Error(`Unknown tool: ${tool}`);
  }

  const buffers = Array.isArray(result) ? result : [result];
  const baseFilename = `${tool}_${uuidv4()}`;
  let outputMeta;

  if (buffers.length === 1) {
    const ext = tool === 'pdf-to-word' ? '.docx' : tool === 'ocr' ? '.txt' : tool === 'pdf-to-text' ? '.txt' : tool === 'pdf-to-png' ? '.png' : tool === 'pdf-to-jpg' ? '.jpg' : '.pdf';
    const filename = `${baseFilename}${ext}`;
    const outputPath = getOutputPath(filename);
    fs.writeFileSync(outputPath, buffers[0]);
    const stat = fs.statSync(outputPath);
    outputMeta = {
      filename,
      path: outputPath,
      size: stat.size,
      downloadUrl: `/outputs/${filename}`,
    };
  } else {
    const { default: archiver } = await import('archiver');
    const zipFilename = `${baseFilename}.zip`;
    const zipPath = getOutputPath(zipFilename);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(output);
    buffers.forEach((buf, i) => {
      const ext = tool === 'pdf-to-png' ? '.png' : '.jpg';
      archive.append(buf, { name: `${baseFilename}_part${i + 1}${ext}` });
    });
    await archive.finalize();
    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
    });
    const stat = fs.statSync(zipPath);
    outputMeta = {
      filename: zipFilename,
      path: zipPath,
      size: stat.size,
      downloadUrl: `/outputs/${zipFilename}`,
    };
  }

  const processingTimeMs = Date.now() - startTime;
  await FileRecord.findByIdAndUpdate(recordId, {
    status: 'completed',
    outputFiles: [outputMeta],
    processingTimeMs,
  });

  if (userId) {
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, { $inc: { filesProcessed: 1 } });
  }

  return { success: true, output: outputMeta };
};

const initQueue = () => {
  if (!redisEnabled) {
    logger.warn('Redis is disabled. Using in-memory processing mode.');
    return null;
  }
  try {
    const { Queue } = require('bullmq');
    const redisConn = getRedisConnection();
    pdfQueue = new Queue('pdf-processing', { connection: redisConn });
    logger.info('PDF processing queue initialized');
    return pdfQueue;
  } catch (err) {
    logger.warn('Queue initialization failed (Redis may not be available). Falling back to in-memory mode:', err.message);
    redisEnabled = false;
    return null;
  }
};

const initWorker = () => {
  if (!redisEnabled) {
    logger.info('PDF processing worker running in in-memory mode');
    return null;
  }
  try {
    const { Worker } = require('bullmq');
    const redisConn = getRedisConnection();
    pdfWorker = new Worker(
      'pdf-processing',
      async (job) => {
        return processJob(job.data);
      },
      { connection: redisConn, concurrency: parseInt(process.env.WORKER_CONCURRENCY) || 3 }
    );

    pdfWorker.on('completed', (job) => {
      logger.info(`Job ${job.id} completed`);
    });

    pdfWorker.on('failed', (job, err) => {
      logger.error(`Job ${job?.id} failed:`, err.message);
      if (job?.data?.recordId) {
        FileRecord.findByIdAndUpdate(job.data.recordId, {
          status: 'failed',
          errorMessage: err.message,
        }).catch(() => {});
      }
    });

    logger.info('PDF processing worker started');
    return pdfWorker;
  } catch (err) {
    logger.warn('Worker initialization failed. Falling back to in-memory mode:', err.message);
    redisEnabled = false;
    return null;
  }
};

const addJob = async (tool, data) => {
  if (pdfQueue) {
    const job = await pdfQueue.add(tool, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { age: 3600 },
      removeOnFail: { age: 86400 },
    });
    return job;
  }

  const jobId = uuidv4();
  processJob(data).catch((err) => {
    logger.error(`In-memory job ${jobId} failed:`, err.message);
    if (data.recordId) {
      FileRecord.findByIdAndUpdate(data.recordId, {
        status: 'failed',
        errorMessage: err.message,
      }).catch(() => {});
    }
  });

  return { id: jobId, getState: async () => 'completed' };
};

const getJobStatus = async (jobId) => {
  if (pdfQueue) {
    const job = await pdfQueue.getJob(jobId);
    if (!job) return null;
    const state = await job.getState();
    return { id: job.id, state, progress: job.progress, data: job.data, failedReason: job.failedReason };
  }
  return { id: jobId, state: 'completed' };
};

const closeQueue = async () => {
  if (pdfWorker) await pdfWorker.close();
  if (pdfQueue) await pdfQueue.close();
  if (connection) await connection.quit();
};

module.exports = { initQueue, initWorker, addJob, getJobStatus, closeQueue, isQueueAvailable: () => !!pdfQueue, isRedisEnabled: () => redisEnabled };
