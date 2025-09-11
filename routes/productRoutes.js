const express = require('express');
const { 
  getProducts,
  getProduct,
  getFeaturedProducts,
  getNewArrivals,
  getCategories
} = require('../controllers/productController');

const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Private (requires authentication)
router.get('/', protect, getProducts);

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Private (requires authentication)
router.get('/featured', protect, getFeaturedProducts);

// @route   GET /api/products/new-arrivals
// @desc    Get new arrival products
// @access  Private (requires authentication)
router.get('/new-arrivals', protect, getNewArrivals);

// @route   GET /api/products/categories
// @desc    Get product categories, brands, and seasons
// @access  Private (requires authentication)
router.get('/categories', protect, getCategories);

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Private (requires authentication)
router.get('/:id', protect, getProduct);

module.exports = router;
