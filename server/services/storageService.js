const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const useS3 = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_BUCKET_NAME);
let s3Client;

if (useS3) {
  try {
    const { S3Client } = require('@aws-sdk/client-s3');
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    logger.info('AWS S3 storage initialized');
  } catch (err) {
    logger.error('Failed to initialize S3 client:', err.message);
  }
}

const uploadFile = async (buffer, filename, contentType = 'application/pdf') => {
  if (useS3 && s3Client) {
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `outputs/${filename}`,
      Body: buffer,
      ContentType: contentType,
    }));
    return { filename, isRemote: true, url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/outputs/${filename}` };
  }

  const outputDir = path.join(__dirname, '..', process.env.OUTPUT_DIR || 'outputs');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, buffer);
  return { filename, isRemote: false, path: filePath, url: `/outputs/${filename}` };
};

const deleteFile = async (filename) => {
  if (useS3 && s3Client) {
    const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `outputs/${filename}`,
    }));
  } else {
    const filePath = path.join(__dirname, '..', process.env.OUTPUT_DIR || 'outputs', filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};

const getDownloadUrl = (req, filename, fileMeta) => {
  if (fileMeta?.isRemote) return fileMeta.url;
  return `${req.protocol}://${req.get('host')}/outputs/${filename}`;
};

const isS3Enabled = () => useS3;

module.exports = { uploadFile, deleteFile, getDownloadUrl, isS3Enabled };
