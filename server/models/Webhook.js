const mongoose = require('mongoose');

const WebhookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    url: {
      type: String,
      required: [true, 'Webhook URL is required'],
      trim: true,
    },
    events: {
      type: [String],
      required: true,
      enum: ['pdf.completed', 'pdf.failed', 'user.registered', 'file.expired'],
    },
    secret: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastTriggeredAt: {
      type: Date,
    },
    deliveryCount: {
      type: Number,
      default: 0,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    headers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

WebhookSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Webhook', WebhookSchema);
