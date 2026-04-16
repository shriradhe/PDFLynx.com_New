const ApiKey = require('../models/ApiKey');
const AuditLog = require('../models/AuditLog');

const createApiKey = async (req, res) => {
  try {
    const { name, permissions, expiresAt, rateLimit } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'API key name is required.' });
    }

    const rawKey = ApiKey.generateKey();
    const hashedKey = ApiKey.hashKey(rawKey);
    const keyPrefix = ApiKey.getKeyPrefix(rawKey);

    const apiKey = await ApiKey.create({
      userId: req.user._id,
      name: name.trim(),
      key: rawKey,
      keyPrefix,
      hashedKey,
      permissions: permissions || ['pdf:read', 'pdf:write'],
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      rateLimit: rateLimit || 1000,
    });

    AuditLog.create({
      userId: req.user._id,
      action: 'api.key.create',
      status: 'success',
      metadata: { keyName: apiKey.name },
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'API key created successfully. Save this key — it will not be shown again.',
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        key: rawKey,
        keyPrefix: apiKey.keyPrefix,
        permissions: apiKey.permissions,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({ success: false, message: 'Server error creating API key.' });
  }
};

const getApiKeys = async (req, res) => {
  try {
    const apiKeys = await ApiKey.find({ userId: req.user._id })
      .select('-key -hashedKey')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, apiKeys });
  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching API keys.' });
  }
};

const revokeApiKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findOne({ _id: req.params.id, userId: req.user._id });
    if (!apiKey) {
      return res.status(404).json({ success: false, message: 'API key not found.' });
    }

    apiKey.isActive = false;
    await apiKey.save();

    AuditLog.create({
      userId: req.user._id,
      action: 'api.key.revoke',
      status: 'success',
      metadata: { keyName: apiKey.name },
    }).catch(() => {});

    res.json({ success: true, message: 'API key revoked successfully.' });
  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({ success: false, message: 'Server error revoking API key.' });
  }
};

const updateApiKey = async (req, res) => {
  try {
    const { name, permissions, isActive, rateLimit } = req.body;
    const apiKey = await ApiKey.findOne({ _id: req.params.id, userId: req.user._id });
    if (!apiKey) {
      return res.status(404).json({ success: false, message: 'API key not found.' });
    }

    if (name) apiKey.name = name.trim();
    if (permissions) apiKey.permissions = permissions;
    if (typeof isActive === 'boolean') apiKey.isActive = isActive;
    if (rateLimit) apiKey.rateLimit = rateLimit;

    await apiKey.save();

    res.json({ success: true, message: 'API key updated successfully.' });
  } catch (error) {
    console.error('Update API key error:', error);
    res.status(500).json({ success: false, message: 'Server error updating API key.' });
  }
};

module.exports = { createApiKey, getApiKeys, revokeApiKey, updateApiKey };
