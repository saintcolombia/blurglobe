const express = require('express');
const { body } = require('express-validator');
const { 
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyDiscount,
  removeDiscount
} = require('../controllers/cartController');

const { protect } = require('../middleware/auth');
const { handleValidationErrors, cartLimiter } = require('../middleware/security');

const router = express.Router();

// Add to cart validation
const addToCartValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),
  body('size')
    .notEmpty()
    .withMessage('Size is required'),
  body('color.name')
    .optional()
    .isLength({ min: 2, max: 30 })
    .withMessage('Color name must be between 2 and 30 characters'),
  body('color.hex')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color hex must be a valid hex color code')
];

// Update cart item validation
const updateCartValidation = [
  body('quantity')
    .isInt({ min: 0, max: 10 })
    .withMessage('Quantity must be between 0 and 10')
];

// Apply discount validation
const discountValidation = [
  body('code')
    .isLength({ min: 2, max: 20 })
    .trim()
    .withMessage('Discount code must be between 2 and 20 characters')
];

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, getCart);

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add',
  protect,
  cartLimiter,
  addToCartValidation,
  handleValidationErrors,
  addToCart
);

// @route   PUT /api/cart/update/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/update/:itemId',
  protect,
  cartLimiter,
  updateCartValidation,
  handleValidationErrors,
  updateCartItem
);

// @route   DELETE /api/cart/remove/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:itemId',
  protect,
  cartLimiter,
  removeFromCart
);

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear',
  protect,
  cartLimiter,
  clearCart
);

// @route   POST /api/cart/discount
// @desc    Apply discount code to cart
// @access  Private
router.post('/discount',
  protect,
  cartLimiter,
  discountValidation,
  handleValidationErrors,
  applyDiscount
);

// @route   DELETE /api/cart/discount
// @desc    Remove discount from cart
// @access  Private
router.delete('/discount',
  protect,
  cartLimiter,
  removeDiscount
);

module.exports = router;
