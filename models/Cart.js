const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be an integer'
    }
  },
  size: {
    type: String,
    required: true
  },
  color: {
    name: String,
    hex: String
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be positive']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price must be positive']
  }
}, {
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  taxRate: {
    type: Number,
    default: 0.15, // 15% VAT for South Africa
    min: [0, 'Tax rate cannot be negative']
  },
  shipping: {
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cost cannot be negative']
    },
    freeShippingThreshold: {
      type: Number,
      default: 500, // Free shipping over R500
      min: [0, 'Free shipping threshold cannot be negative']
    },
    isFree: {
      type: Boolean,
      default: false
    }
  },
  total: {
    type: Number,
    default: 0,
    min: [0, 'Total cannot be negative']
  },
  currency: {
    type: String,
    default: 'ZAR',
    enum: ['ZAR']
  },
  discount: {
    code: String,
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative']
    },
    percentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100%']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Indexes for better performance
cartSchema.index({ user: 1 });
cartSchema.index({ updatedAt: -1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for total items count
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for total weight
cartSchema.virtual('totalWeight').get(function() {
  return this.items.reduce((total, item) => {
    const productWeight = item.product?.weight || 0;
    return total + (productWeight * item.quantity);
  }, 0);
});

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => total + item.totalPrice, 0);
  
  // Apply discount
  let discountAmount = 0;
  if (this.discount.percentage > 0) {
    discountAmount = (this.subtotal * this.discount.percentage) / 100;
  } else if (this.discount.amount > 0) {
    discountAmount = this.discount.amount;
  }
  
  const subtotalAfterDiscount = Math.max(0, this.subtotal - discountAmount);
  
  // Calculate tax (VAT)
  this.tax = subtotalAfterDiscount * this.taxRate;
  
  // Calculate shipping
  this.shipping.isFree = subtotalAfterDiscount >= this.shipping.freeShippingThreshold;
  const shippingCost = this.shipping.isFree ? 0 : this.shipping.cost;
  
  // Calculate total
  this.total = subtotalAfterDiscount + this.tax + shippingCost;
  
  // Update expiry date on modification
  if (this.items.length > 0) {
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity, size, color, price) {
  // Check if item already exists with same product, size, and color
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() &&
    item.size === size &&
    (item.color?.name === color?.name || (!item.color && !color))
  );
  
  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].totalPrice = this.items[existingItemIndex].quantity * price;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      quantity,
      size,
      color,
      price,
      totalPrice: quantity * price
    });
  }
  
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItem = async function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    this.items.pull(itemId);
  } else {
    // Update quantity and total price
    item.quantity = quantity;
    item.totalPrice = quantity * item.price;
  }
  
  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(itemId) {
  this.items.pull(itemId);
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = async function() {
  this.items = [];
  this.discount = { code: '', amount: 0, percentage: 0 };
  return this.save();
};

// Method to apply discount
cartSchema.methods.applyDiscount = async function(discountCode, amount = 0, percentage = 0) {
  this.discount = {
    code: discountCode,
    amount: amount,
    percentage: percentage
  };
  return this.save();
};

// Method to remove discount
cartSchema.methods.removeDiscount = async function() {
  this.discount = { code: '', amount: 0, percentage: 0 };
  return this.save();
};

// Method to set shipping cost
cartSchema.methods.setShippingCost = async function(cost, freeThreshold = 500) {
  this.shipping.cost = cost;
  this.shipping.freeShippingThreshold = freeThreshold;
  return this.save();
};

// Static method to get cart by user
cartSchema.statics.getByUser = function(userId) {
  return this.findOne({ user: userId, isActive: true })
    .populate({
      path: 'items.product',
      select: 'name price images slug inStock totalQuantity sizes'
    });
};

// Static method to create or get cart
cartSchema.statics.createOrGet = async function(userId) {
  let cart = await this.getByUser(userId);
  
  if (!cart) {
    cart = new this({
      user: userId,
      items: [],
      shipping: {
        cost: 99, // Default shipping cost R99
        freeShippingThreshold: 500
      }
    });
    await cart.save();
  }
  
  return cart;
};

// Static method to cleanup expired carts
cartSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
    isActive: false
  });
};

module.exports = mongoose.model('Cart', cartSchema);
