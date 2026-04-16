const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      maxlength: [100, 'Team name cannot exceed 100 characters'],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [TeamMemberSchema],
    plan: {
      type: String,
      enum: ['free', 'starter', 'business', 'enterprise'],
      default: 'free',
    },
    monthlyQuota: {
      type: Number,
      default: 100,
    },
    monthlyUsage: {
      type: Number,
      default: 0,
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        allowApiAccess: false,
        allowWebhooks: false,
        requireApproval: false,
        retentionDays: 30,
      },
    },
  },
  { timestamps: true }
);

TeamSchema.pre('save', function (next) {
  if (this.isNew && this.members.length === 0) {
    this.members.push({
      userId: this.ownerId,
      role: 'owner',
    });
  }
  next();
});

module.exports = mongoose.model('Team', TeamSchema);
