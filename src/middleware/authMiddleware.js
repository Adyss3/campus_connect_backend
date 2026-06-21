const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes by verifying JWT token
 */
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route. Token missing.',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    // We attach the user to the request object so subsequent middleware/controllers can use it.
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized. User no longer exists.',
      });
    }

    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({
      success: false,
      error: 'Not authorized. Token is invalid or expired.',
    });
  }
};

/**
 * Grant access to specific roles
 * @param  {...string} roles Array of roles allowed to access the route
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user ? req.user.role : 'unknown'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

/**
 * Require user to be verified
 */
const requireVerified = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You must be a verified user to use this feature.',
    });
  }
};

module.exports = {
  protect,
  authorize,
  requireVerified,
};
