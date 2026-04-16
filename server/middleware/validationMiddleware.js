// ─── Input Validation Middleware ──────────────────────────────────────────────
// Simple, dependency-free validation for PDF tool request bodies

const validate = (rules) => (req, _res, next) => {
  const errors = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = req.body[field];

    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value === undefined || value === null || value === '') {
      if (rule.default !== undefined) {
        req.body[field] = rule.default;
      }
      continue;
    }

    if (rule.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push(`${field} must be a number`);
        continue;
      }
      if (rule.min !== undefined && num < rule.min) {
        errors.push(`${field} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && num > rule.max) {
        errors.push(`${field} must be at most ${rule.max}`);
      }
      req.body[field] = num;
    }

    if (rule.type === 'string') {
      if (typeof value !== 'string') {
        errors.push(`${field} must be a string`);
        continue;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field} must be at most ${rule.maxLength} characters`);
      }
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
      }
    }

    if (rule.type === 'json') {
      if (typeof value === 'string') {
        try {
          req.body[field] = JSON.parse(value);
        } catch {
          errors.push(`${field} must be valid JSON`);
        }
      } else if (typeof value !== 'object') {
        errors.push(`${field} must be valid JSON`);
      }
    }

    if (rule.type === 'hexColor') {
      if (typeof value !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(value)) {
        errors.push(`${field} must be a valid hex color (e.g. #888888)`);
      }
    }
  }

  if (errors.length > 0) {
    return _res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  next();
};

// ─── Validation Rules per Tool ────────────────────────────────────────────────

const splitValidation = validate({
  splitMode: { type: 'string', enum: ['all', 'range', 'every'], default: 'all' },
  ranges: { type: 'json', required: false },
  every: { type: 'number', min: 1, max: 10000, required: false },
});

const rotateValidation = validate({
  rotation: { type: 'number', min: 1, max: 359, default: 90 },
  pages: { type: 'json', required: false },
});

const watermarkValidation = validate({
  text: { type: 'string', maxLength: 200, default: 'CONFIDENTIAL' },
  fontSize: { type: 'number', min: 6, max: 200, default: 60 },
  opacity: { type: 'number', min: 0.01, max: 1, default: 0.25 },
  colorHex: { type: 'hexColor', default: '#888888' },
  rotation: { type: 'number', min: -360, max: 360, default: -45 },
  position: {
    type: 'string',
    enum: ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
    default: 'center',
  },
});

const protectValidation = validate({
  userPassword: { type: 'string', maxLength: 128, required: true },
  ownerPassword: { type: 'string', maxLength: 128, required: false },
});

const unlockValidation = validate({
  password: { type: 'string', maxLength: 128, default: '' },
});

const pageNumbersValidation = validate({
  startNumber: { type: 'number', min: 1, max: 999999, default: 1 },
  position: {
    type: 'string',
    enum: ['bottom-center', 'bottom-left', 'bottom-right', 'top-center', 'top-left', 'top-right'],
    default: 'bottom-center',
  },
  fontSize: { type: 'number', min: 6, max: 72, default: 12 },
  format: { type: 'string', enum: ['numeric', 'page-n-of-total'], default: 'numeric' },
  margin: { type: 'number', min: 10, max: 100, default: 30 },
});

const convertValidation = validate({
  type: {
    type: 'string',
    enum: ['pdf-to-jpg', 'jpg-to-pdf', 'pdf-to-word'],
    required: true,
  },
});

const ocrValidation = validate({});

module.exports = {
  validate,
  splitValidation,
  rotateValidation,
  watermarkValidation,
  protectValidation,
  unlockValidation,
  pageNumbersValidation,
  convertValidation,
  ocrValidation,
};
