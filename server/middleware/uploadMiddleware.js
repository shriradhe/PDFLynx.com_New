const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');

// ─── Magic Number Validation ──────────────────────────────────────────────────
const FILE_SIGNATUREATURES = {
  'application/pdf': [
    Buffer.from('255044462d', 'hex'),
  ],
  'image/jpeg': [
    Buffer.from('ffd8ff', 'hex'),
  ],
  'image/jpg': [
    Buffer.from('ffd8ff', 'hex'),
  ],
  'image/png': [
    Buffer.from('89504e47', 'hex'),
  ],
  'image/gif': [
    Buffer.from('47494638', 'hex'),
  ],
  'image/webp': [
    Buffer.from('52494646', 'hex'),
  ],
  'image/tiff': [
    Buffer.from('49492a00', 'hex'),
    Buffer.from('4d4d002a', 'hex'),
  ],
  'image/bmp': [
    Buffer.from('424d', 'hex'),
  ],
};

const validateFileSignature = (buffer, mimetype) => {
  let signatures = FILE_SIGNATUREATURES[mimetype];
  if (!signatures && mimetype === 'image/jpg') {
    signatures = FILE_SIGNATUREATURES['image/jpeg'];
  }
  if (!signatures) return false;

  return signatures.some((sig) => {
    for (let i = 0; i < sig.length; i++) {
      if (buffer[i] !== sig[i]) return false;
    }
    return true;
  });
};

// ─── Storage Engine ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

// ─── File Filter with Magic Number Validation ─────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/tiff',
  ];

  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE',
      `Unsupported file type: ${file.mimetype}. Only PDF and image files are allowed.`));
  }

  cb(null, true);
};

// ─── Post-upload magic number validation middleware ───────────────────────────
const validateUploadedFiles = (req, res, next) => {
  const files = req.files || (req.file ? [req.file] : []);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const buffer = Buffer.alloc(8);
      const fd = fs.openSync(file.path, 'r');
      fs.readSync(fd, buffer, 0, 8, 0);
      fs.closeSync(fd);
      const isValid = validateFileSignature(buffer, file.mimetype);

      if (!isValid) {
        files.forEach(f => { try { fs.unlinkSync(f.path); } catch(e) {} });
        return res.status(400).json({
          success: false,
          message: `File "${file.originalname}" has an invalid signature. The file may be corrupted or malicious.`,
        });
      }
    } catch (err) {
      files.forEach(f => { try { fs.unlinkSync(f.path); } catch(e) {} });
      return res.status(500).json({
        success: false,
        message: `Error validating file "${file.originalname}": ${err.message}`,
      });
    }
  }

  next();
};

// ─── Max file size from env ────────────────────────────────────────────────────
const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB) || 50;

// ─── Multer instances ──────────────────────────────────────────────────────────
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeMB * 1024 * 1024 },
}).single('file');

const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeMB * 1024 * 1024 },
}).array('files', 20);

// ─── Wrappers with proper error handling ──────────────────────────────────────
const handleSingleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: `File too large. Maximum size is ${maxSizeMB}MB.`,
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    validateUploadedFiles(req, res, next);
  });
};

const handleMultipleUpload = (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: `One or more files exceed the ${maxSizeMB}MB limit.`,
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ success: false, message: 'Too many files. Maximum is 20.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    validateUploadedFiles(req, res, next);
  });
};

const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/tiff', 'image/bmp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE',
      `Unsupported file type: ${file.mimetype}. Only image files are allowed.`));
  }
};

const uploadImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: maxSizeMB * 1024 * 1024 },
}).array('files', 30);

const handleImageUpload = (req, res, next) => {
  uploadImages(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: `One or more files exceed the ${maxSizeMB}MB limit.`,
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ success: false, message: 'Too many files. Maximum is 30.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    validateUploadedFiles(req, res, next);
  });
};

module.exports = { handleSingleUpload, handleMultipleUpload, handleImageUpload };
