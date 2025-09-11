const Product = require('../models/Product');

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public (but requires authentication for full access)
const getProducts = async (req, res) => {
  try {
    // Only authenticated users can access products
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    const {
      page = 1,
      limit = 12,
      category,
      gender,
      brand,
      minPrice,
      maxPrice,
      season,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      featured,
      newArrivals,
      bestsellers
    } = req.query;

    // Build query
    let query = { isActive: true };

    if (category) query.category = category;
    if (gender && gender !== 'unisex') {
      query.gender = { $in: [gender, 'unisex'] };
    }
    if (brand) query.brand = new RegExp(brand, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (season) query.season = season;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }
    if (featured === 'true') query.isFeatured = true;
    if (newArrivals === 'true') query.isNewArrival = true;
    if (bestsellers === 'true') query.isBestseller = true;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select('-reviews');

    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalProducts: total,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching products'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public (but requires authentication)
const getProduct = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'firstName lastName');

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching product'
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public (but requires authentication)
const getFeaturedProducts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    const { limit = 8 } = req.query;
    
    const products = await Product.find({ 
      isFeatured: true, 
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('-reviews');

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching featured products'
    });
  }
};

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public (but requires authentication)
const getNewArrivals = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    const { limit = 8 } = req.query;
    
    const products = await Product.find({ 
      isNewArrival: true, 
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('-reviews');

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Get new arrivals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching new arrivals'
    });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public (but requires authentication)
const getCategories = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    const categories = await Product.distinct('category', { isActive: true });
    const brands = await Product.distinct('brand', { isActive: true });
    const seasons = await Product.distinct('season', { isActive: true });

    res.json({
      success: true,
      data: {
        categories,
        brands,
        seasons
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching categories'
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getNewArrivals,
  getCategories
};
