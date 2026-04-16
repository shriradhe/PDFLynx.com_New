const sanitizeString = (str, maxLength = 1000) => {
  if (typeof str !== 'string') return '';
  return str
    .slice(0, maxLength)
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

const sanitizeNumber = (num, min = 0, max = 1000000) => {
  const parsed = Number(num);
  if (isNaN(parsed)) return min;
  return Math.max(min, Math.min(max, parsed));
};

const sanitizeObject = (obj, schema) => {
  const sanitized = {};
  for (const [key, rules] of Object.entries(schema)) {
    const value = obj[key];
    if (value === undefined || value === null) {
      sanitized[key] = rules.default;
      continue;
    }

    switch (rules.type) {
      case 'string':
        sanitized[key] = sanitizeString(value, rules.maxLength || 1000);
        break;
      case 'number':
        sanitized[key] = sanitizeNumber(value, rules.min, rules.max);
        break;
      case 'boolean':
        sanitized[key] = !!value;
        break;
      case 'array':
        sanitized[key] = Array.isArray(value) ? value.slice(0, rules.maxLength || 100) : [];
        break;
      default:
        sanitized[key] = value;
    }
  }
  return sanitized;
};

const sanitizePDFEdit = (edits) => {
  if (!Array.isArray(edits)) return [];
  return edits.slice(0, 50).map(edit => {
    const sanitized = { type: sanitizeString(edit.type, 20) };
    if (edit.type === 'text') {
      sanitized.text = sanitizeString(edit.text, 5000);
      sanitized.page = sanitizeNumber(edit.page, 1, 10000);
      sanitized.x = sanitizeNumber(edit.x, 0, 10000);
      sanitized.y = sanitizeNumber(edit.y, 0, 10000);
      sanitized.fontSize = sanitizeNumber(edit.fontSize, 6, 72);
      sanitized.color = sanitizeString(edit.color, 7);
      sanitized.opacity = sanitizeNumber(edit.opacity, 0, 1);
      sanitized.bold = !!edit.bold;
    } else if (edit.type === 'image') {
      sanitized.imageData = typeof edit.imageData === 'string' ? edit.imageData.slice(0, 10000000) : '';
      sanitized.imageFormat = sanitizeString(edit.imageFormat, 10);
      sanitized.page = sanitizeNumber(edit.page, 1, 10000);
      sanitized.x = sanitizeNumber(edit.x, 0, 10000);
      sanitized.y = sanitizeNumber(edit.y, 0, 10000);
      sanitized.width = sanitizeNumber(edit.width, 10, 5000);
      sanitized.height = sanitizeNumber(edit.height, 10, 5000);
      sanitized.opacity = sanitizeNumber(edit.opacity, 0, 1);
    } else if (edit.type === 'rectangle') {
      sanitized.page = sanitizeNumber(edit.page, 1, 10000);
      sanitized.x = sanitizeNumber(edit.x, 0, 10000);
      sanitized.y = sanitizeNumber(edit.y, 0, 10000);
      sanitized.width = sanitizeNumber(edit.width, 1, 5000);
      sanitized.height = sanitizeNumber(edit.height, 1, 5000);
      sanitized.color = sanitizeString(edit.color, 7);
      sanitized.borderWidth = sanitizeNumber(edit.borderWidth, 1, 20);
      sanitized.opacity = sanitizeNumber(edit.opacity, 0, 1);
    }
    return sanitized;
  });
};

const sanitizeWatermark = (options) => {
  return {
    text: sanitizeString(options.text, 200),
    fontSize: sanitizeNumber(options.fontSize, 6, 200),
    opacity: sanitizeNumber(options.opacity, 0, 1),
    colorHex: sanitizeString(options.colorHex, 7),
    rotation: sanitizeNumber(options.rotation, -360, 360),
    position: sanitizeString(options.position, 20),
  };
};

const sanitizeSignature = (options) => {
  return {
    signatureText: sanitizeString(options.signatureText, 200),
    signatureImageData: typeof options.signatureImageData === 'string' ? options.signatureImageData.slice(0, 10000000) : null,
    signatureImageFormat: sanitizeString(options.signatureImageFormat, 10),
    pageNumber: sanitizeNumber(options.pageNumber, 1, 10000),
    x: sanitizeNumber(options.x, 0, 10000),
    y: sanitizeNumber(options.y, 0, 10000),
    fontSize: sanitizeNumber(options.fontSize, 6, 72),
  };
};

module.exports = {
  sanitizeString,
  sanitizeNumber,
  sanitizeObject,
  sanitizePDFEdit,
  sanitizeWatermark,
  sanitizeSignature,
};
