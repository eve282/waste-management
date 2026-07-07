const logger = require("../utils/logger");

const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
};

// Maps well-known error types (Mongoose, Multer, body-parser, JWT) to a proper
// HTTP status + a client-safe message, instead of leaking a generic 500.
const resolveKnownError = (err, res) => {
  if (err.statusCode) {
    return { statusCode: err.statusCode, message: err.message };
  }
  if (err.name === "CastError") {
    return { statusCode: 400, message: `Invalid value for ${err.path}: ${err.value}` };
  }
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors || {}).map((e) => e.message);
    return { statusCode: 400, message: details.join(", ") || "Validation failed" };
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return { statusCode: 409, message: `${field} already in use` };
  }
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      const maxMb = Number(process.env.MAX_IMAGE_SIZE_MB) || 5;
      return { statusCode: 400, message: `Upload error: File too large (max ${maxMb}MB)` };
    }
    return { statusCode: 400, message: `Upload error: ${err.message}` };
  }
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return { statusCode: 401, message: "Not authorized, invalid or expired token" };
  }
  if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return { statusCode: 400, message: "Malformed request body" };
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  return { statusCode, message: err.message };
};

const errorHandler = (err, req, res, next) => {
  const { statusCode, message } = resolveKnownError(err, res);
  const logLevel = statusCode >= 500 ? "error" : "warn";
  const isProduction = process.env.NODE_ENV === "production";

  logger[logLevel](err.message, {
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    statusCode,
  });

  // For 4xx we've deliberately crafted a client-safe message above; for an
  // unexpected 5xx in production, don't leak internal/third-party error text.
  const clientMessage = statusCode >= 500 && isProduction ? "Something went wrong. Please try again later." : message;

  res.status(statusCode).json({
    message: clientMessage,
    stack: isProduction ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
