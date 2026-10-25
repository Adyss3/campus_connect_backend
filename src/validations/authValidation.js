const { check, validationResult } = require('express-validator');

// Validation for user registration
const registerValidation = [
  check('firstName', 'First name is required').not().isEmpty().trim(),
  check('firstName', 'First name must be at most 50 characters').isLength({ max: 50 }),
  
  check('lastName', 'Last name is required').not().isEmpty().trim(),
  check('lastName', 'Last name must be at most 50 characters').isLength({ max: 50 }),
  
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  
  check('university', 'University name is required').not().isEmpty().trim(),
  
  check('role', 'Invalid role').optional().isIn(['Student', 'Entrepreneur', 'Admin']),
];

// Validation for user login
const loginValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists(),
];

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors to be a clean array of error messages
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
    });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  validate,
};
