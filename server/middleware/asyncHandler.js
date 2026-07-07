// Wraps an async route handler so any rejected promise is forwarded to next(err)
// instead of becoming an unhandled rejection that crashes the process.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
