const mongoose = require('mongoose');

const FileRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = anonymous user
    },
    tool: {
      type: String,
      required: true,
      enum: [
        'merge',
        'split',
        'compress',
        'pdf-to-jpg',
        'jpg-to-pdf',
        'pdf-to-word',
        'rotate',
        'watermark',
        'protect',
        'unlock',
        'page-numbers',
        'ocr',
        'sign',
        'edit',
        'pdf-to-text',
        'pdf-to-png',
        'organize',
        'redact',
        'html-to-pdf',
        'image-to-pdf',
      ],
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    inputFiles: [
      {
        originalName: String,
        size: Number, // bytes
        mimetype: String,
      },
    ],
    outputFiles: [
      {
        filename: String,
        path: String,
        size: Number,
        downloadUrl: String,
      },
    ],
    errorMessage: {
      type: String,
      default: null,
    },
    processingTimeMs: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + (parseInt(process.env.FILE_TTL_MINUTES) || 30) * 60 * 1000),
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// TTL index for auto-deletion from DB
FileRecordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for user history queries
FileRecordSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('FileRecord', FileRecordSchema);
