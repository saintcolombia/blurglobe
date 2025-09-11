const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const cart = await Cart.getByUser(req.user._id);
    
    if (!cart) {
      // Create empty cart if none exists
      const newCart = await Cart.createOrGet(req.user._id);
      return res.json({
        success: true,
        data: { cart: newCart }
      });
    }

    res.json({
      success: true,
      data: { cart }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching cart'
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;

    if (!productId || !quantity || !size) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, quantity, and size are required'
      });
    }

    // Validate product exists and is available
    const product = await Product.findById(productId);
    
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable'
      });
    }

    // Check if size is available
    const sizeOption = product.sizes.find(s => s.size === size);
    if (!sizeOption || !sizeOption.inStock || sizeOption.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Selected size is not available or insufficient stock'
      });
    }

    // Get or create cart
    const cart = await Cart.createOrGet(req.user._id);

    // Add item to cart
    await cart.addItem(productId, quantity, size, color, product.price);

    // Get updated cart with populated products
    const updatedCart = await Cart.getByUser(req.user._id);

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: { cart: updatedCart }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding item to cart'
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const cart = await Cart.getByUser(req.user._id);
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find the item in cart
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Validate stock availability
    const product = await Product.findById(item.product);
    const sizeOption = product.sizes.find(s => s.size === item.size);
    
    if (quantity > 0 && (!sizeOption || sizeOption.quantity < quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock for requested quantity'
      });
    }

    await cart.updateItem(itemId, quantity);

    // Get updated cart
    const updatedCart = await Cart.getByUser(req.user._id);

    res.json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated successfully',
      data: { cart: updatedCart }
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating cart item'
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.getByUser(req.user._id);
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.removeItem(itemId);

    // Get updated cart
    const updatedCart = await Cart.getByUser(req.user._id);

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: { cart: updatedCart }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing item from cart'
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.getByUser(req.user._id);
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: { cart }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error clearing cart'
    });
  }
};

// @desc    Apply discount code
// @route   POST /api/cart/discount
// @access  Private
const applyDiscount = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Discount code is required'
      });
    }

    const cart = await Cart.getByUser(req.user._id);
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Simple discount validation (in a real app, you'd have a Discount model)
    const discountCodes = {
      'WELCOME10': { percentage: 10 },
      'SAVE20': { percentage: 20 },
      'FIRSTORDER': { percentage: 15 },
      'STUDENT10': { percentage: 10 }
    };

    const discount = discountCodes[code.toUpperCase()];
    
    if (!discount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount code'
      });
    }

    await cart.applyDiscount(code.toUpperCase(), discount.amount || 0, discount.percentage || 0);

    // Get updated cart
    const updatedCart = await Cart.getByUser(req.user._id);

    res.json({
      success: true,
      message: 'Discount applied successfully',
      data: { cart: updatedCart }
    });
  } catch (error) {
    console.error('Apply discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error applying discount'
    });
  }
};

// @desc    Remove discount
// @route   DELETE /api/cart/discount
// @access  Private
const removeDiscount = async (req, res) => {
  try {
    const cart = await Cart.getByUser(req.user._id);
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.removeDiscount();

    // Get updated cart
    const updatedCart = await Cart.getByUser(req.user._id);

    res.json({
      success: true,
      message: 'Discount removed successfully',
      data: { cart: updatedCart }
    });
  } catch (error) {
    console.error('Remove discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing discount'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyDiscount,
  removeDiscount
};
