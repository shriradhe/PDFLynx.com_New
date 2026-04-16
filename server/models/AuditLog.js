const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    apiKeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApiKey',
    },
    action: {
      type: String,
      required: true,
      index: true,
      enum: [
        'user.register',
        'user.login',
        'user.logout',
        'user.profile.update',
        'user.password.change',
        'user.password.reset.request',
        'user.password.reset.confirm',
        'user.2fa.enable',
        'user.2fa.disable',
        'user.2fa.verify',
        'user.email.verify',
        'api.key.create',
        'api.key.revoke',
        'api.key.update',
        'pdf.merge',
        'pdf.split',
        'pdf.compress',
        'pdf.rotate',
        'pdf.watermark',
        'pdf.protect',
        'pdf.unlock',
        'pdf.page-numbers',
        'pdf.convert',
        'pdf.ocr',
        'pdf.sign',
        'pdf.edit',
        'pdf.pdf-to-text',
        'pdf.pdf-to-png',
        'pdf.organize',
        'pdf.redact',
        'pdf.html-to-pdf',
        'pdf.image-to-pdf',
        'webhook.create',
        'webhook.delete',
        'webhook.trigger',
        'file.upload',
        'file.download',
        'file.delete',
      ],
    },
    resource: {
      type: String,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success',
    },
    errorMessage: {
      type: String,
    },
    duration: {
      type: Number,
    },
  },
  { timestamps: true }
);

AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
