/**
 * Central error handling middleware.
 * Must be registered LAST in the Express middleware chain.
 *
 * Returns a clean JSON error response — never leaks stack traces in production.
 */
const errorHandler = (err, req, res, next) => {
  // Respect status codes set upstream; default to 500
  const statusCode = res.statusCode && res.statusCode !== 200
    ? res.statusCode
    : 500;

  // Mongoose validation error — surface field-level messages
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: messages,
    });
  }

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: `A record with that ${field} already exists.`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token has expired.' });
  }

  // Generic fallback
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    // Stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
