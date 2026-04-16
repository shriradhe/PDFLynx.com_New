/**
 * Async Handler Middleware
 * Wraps async route handlers to catch errors and forward to error handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
