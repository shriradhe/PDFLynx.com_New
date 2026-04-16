const mongoose = require('mongoose');
const crypto = require('crypto');

const ApiKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'API key name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    keyPrefix: {
      type: String,
      required: true,
    },
    hashedKey: {
      type: String,
      required: true,
    },
    permissions: {
      type: [String],
      enum: ['pdf:read', 'pdf:write', 'analytics:read', 'webhook:manage'],
      default: ['pdf:read', 'pdf:write'],
    },
    lastUsedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    rateLimit: {
      type: Number,
      default: 1000,
    },
  },
  { timestamps: true }
);

ApiKeySchema.statics.generateKey = function () {
  return `pdflynx_${crypto.randomBytes(32).toString('hex')}`;
};

ApiKeySchema.statics.hashKey = function (key) {
  return crypto.createHash('sha256').update(key).digest('hex');
};

ApiKeySchema.statics.getKeyPrefix = function (key) {
  return key.substring(0, 12) + '...';
};

ApiKeySchema.methods.incrementUsage = async function () {
  const updated = await this.constructor.findByIdAndUpdate(
    this._id,
    { $inc: { usageCount: 1 }, $set: { lastUsedAt: new Date() } },
    { new: true }
  );
  if (updated) {
    this.usageCount = updated.usageCount;
    this.lastUsedAt = updated.lastUsedAt;
  }
  return updated;
};

module.exports = mongoose.model('ApiKey', ApiKeySchema);
