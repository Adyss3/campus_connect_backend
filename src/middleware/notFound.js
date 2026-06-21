/**
 * 404 Not Found middleware.
 * Catches any request that falls through all defined routes.
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = notFound;
