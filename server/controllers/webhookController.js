const crypto = require('crypto');
const { URL } = require('url');
const Webhook = require('../models/Webhook');

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^169\.254\./,
  /^0\./,
];

const isSafeUrl = (urlString) => {
  try {
    const parsed = new URL(urlString);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== 'http:' && protocol !== 'https:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '::1' || hostname === '0.0.0.0') {
      return false;
    }
    for (const pattern of PRIVATE_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
};

const createWebhook = async (req, res) => {
  try {
    const { url, events, headers } = req.body;
    if (!url || !events || !events.length) {
      return res.status(400).json({ success: false, message: 'URL and events are required.' });
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid URL format.' });
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ success: false, message: 'Only HTTP and HTTPS URLs are allowed.' });
    }

    // Limit URL length
    if (url.length > 2048) {
      return res.status(400).json({ success: false, message: 'URL too long. Maximum 2048 characters.' });
    }

    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await Webhook.create({
      userId: req.user._id,
      url: url.trim(),
      events,
      secret,
      headers: headers || {},
    });

    res.status(201).json({
      success: true,
      message: 'Webhook created successfully.',
      webhook: { ...webhook.toObject(), secret },
    });
  } catch (error) {
    console.error('Create webhook error:', error);
    res.status(500).json({ success: false, message: 'Server error creating webhook.' });
  }
};

const getWebhooks = async (req, res) => {
  try {
    const webhooks = await Webhook.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, webhooks });
  } catch (error) {
    console.error('Get webhooks error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching webhooks.' });
  }
};

const updateWebhook = async (req, res) => {
  try {
    const { url, events, isActive, headers } = req.body;
    const webhook = await Webhook.findOne({ _id: req.params.id, userId: req.user._id });
    if (!webhook) {
      return res.status(404).json({ success: false, message: 'Webhook not found.' });
    }

    if (url) webhook.url = url.trim();
    if (events) webhook.events = events;
    if (typeof isActive === 'boolean') webhook.isActive = isActive;
    if (headers) webhook.headers = headers;

    await webhook.save();
    res.json({ success: true, message: 'Webhook updated successfully.' });
  } catch (error) {
    console.error('Update webhook error:', error);
    res.status(500).json({ success: false, message: 'Server error updating webhook.' });
  }
};

const deleteWebhook = async (req, res) => {
  try {
    const webhook = await Webhook.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!webhook) {
      return res.status(404).json({ success: false, message: 'Webhook not found.' });
    }
    res.json({ success: true, message: 'Webhook deleted successfully.' });
  } catch (error) {
    console.error('Delete webhook error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting webhook.' });
  }
};

const triggerWebhooks = async (event, payload) => {
  try {
    const webhooks = await Webhook.find({ events: event, isActive: true });
    for (const webhook of webhooks) {
      try {
        if (!isSafeUrl(webhook.url)) {
          webhook.failureCount += 1;
          if (webhook.failureCount > 10) webhook.isActive = false;
          await webhook.save();
          continue;
        }

        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(payload))
          .digest('hex');

        const headers = {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
          'X-Webhook-ID': webhook._id.toString(),
        };

        await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        });

        webhook.deliveryCount += 1;
        webhook.lastTriggeredAt = new Date();
        await webhook.save();
      } catch (err) {
        webhook.failureCount += 1;
        if (webhook.failureCount > 10) webhook.isActive = false;
        await webhook.save();
      }
    }
  } catch (error) {
    console.error('Trigger webhooks error:', error);
  }
};

module.exports = { createWebhook, getWebhooks, updateWebhook, deleteWebhook };
