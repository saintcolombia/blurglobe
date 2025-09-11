const express = require('express');
const { body } = require('express-validator');
const { 
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  deleteAccount
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');
const { 
  handleValidationErrors,
  authLimiter,
  registerLimiter,
  passwordResetLimiter
} = require('../middleware/security');

const router = express.Router();

// Registration validation
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('phone')
    .matches(/^(\+27|0)[6-8][0-9]{8}$/)
    .withMessage('Please provide a valid South African phone number'),
  body('dateOfBirth')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('address.street')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Street address must be between 5 and 100 characters'),
  body('address.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('address.province')
    .isIn(['Western Cape', 'Eastern Cape', 'Northern Cape', 'Free State', 'KwaZulu-Natal', 'North West', 'Gauteng', 'Mpumalanga', 'Limpopo'])
    .withMessage('Please select a valid South African province'),
  body('address.postalCode')
    .matches(/^[0-9]{4}$/)
    .withMessage('Postal code must be a 4-digit number')
];

// Login validation
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Change password validation
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Profile update validation
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^(\+27|0)[6-8][0-9]{8}$/)
    .withMessage('Please provide a valid South African phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other')
];

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', 
  registerLimiter,
  registerValidation,
  handleValidationErrors,
  registerUser
);

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login',
  authLimiter,
  loginValidation,
  handleValidationErrors,
  loginUser
);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile',
  protect,
  updateProfileValidation,
  handleValidationErrors,
  updateProfile
);

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password',
  protect,
  changePasswordValidation,
  handleValidationErrors,
  changePassword
);

// @route   POST /api/users/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password',
  passwordResetLimiter,
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors,
  forgotPassword
);

// @route   PUT /api/users/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.put('/reset-password/:token',
  passwordResetLimiter,
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors,
  resetPassword
);

// @route   DELETE /api/users/profile
// @desc    Delete user account
// @access  Private
router.delete('/profile',
  protect,
  body('password')
    .notEmpty()
    .withMessage('Password is required for account deletion'),
  handleValidationErrors,
  deleteAccount
);

module.exports = router;
