const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price must be positive']
  },
  currency: {
    type: String,
    default: 'ZAR',
    enum: ['ZAR']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'T-Shirts',
      'Hoodies',
      'Sweatshirts',
      'Jackets',
      'Jeans',
      'Joggers',
      'Shorts',
      'Sneakers',
      'Accessories',
      'Caps',
      'Bags',
      'Underwear'
    ]
  },
  subcategory: {
    type: String,
    required: [true, 'Subcategory is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['men', 'women', 'unisex']
  },
  season: {
    type: String,
    required: [true, 'Season is required'],
    enum: ['Spring', 'Summer', 'Autumn', 'Winter', 'All Season']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    uppercase: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  colors: [{
    name: {
      type: String,
      required: true
    },
    hex: {
      type: String,
      required: true,
      match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color']
    },
    images: [String]
  }],
  sizes: [{
    size: {
      type: String,
      required: true,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '26', '28', '30', '32', '34', '36', '38', '40', '42', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']
    },
    inStock: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative']
    }
  }],
  material: {
    type: String,
    required: [true, 'Material is required']
  },
  careInstructions: {
    type: String,
    required: [true, 'Care instructions are required']
  },
  features: [String],
  tags: [String],
  inStock: {
    type: Boolean,
    default: true
  },
  totalQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Total quantity cannot be negative']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required (in grams)'],
    min: [0, 'Weight must be positive']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    verified: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  saleEndDate: Date,
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String]
}, {
  timestamps: true
});

// Indexes for better performance
productSchema.index({ category: 1, gender: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ tags: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ isActive: 1, isFeatured: 1 });

// Virtual for sale percentage
productSchema.virtual('salePercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for is on sale
productSchema.virtual('isOnSale').get(function() {
  return this.originalPrice && this.originalPrice > this.price;
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();
  }
  next();
});

// Pre-save middleware to calculate total quantity
productSchema.pre('save', function(next) {
  if (this.sizes && this.sizes.length > 0) {
    this.totalQuantity = this.sizes.reduce((total, size) => total + size.quantity, 0);
    this.inStock = this.totalQuantity > 0;
  }
  next();
});

// Static method to get products by category
productSchema.statics.getByCategory = function(category, gender = null) {
  const query = { category, isActive: true };
  if (gender && gender !== 'unisex') {
    query.gender = { $in: [gender, 'unisex'] };
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ isFeatured: true, isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get new arrivals
productSchema.statics.getNewArrivals = function(limit = 10) {
  return this.find({ isNewArrival: true, isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get bestsellers
productSchema.statics.getBestsellers = function(limit = 10) {
  return this.find({ isBestseller: true, isActive: true })
    .sort({ 'rating.average': -1, 'rating.count': -1 })
    .limit(limit);
};

// Method to add review
productSchema.methods.addReview = function(userId, rating, comment) {
  this.reviews.push({
    user: userId,
    rating: rating,
    comment: comment,
    verified: false // Can be updated based on purchase history
  });
  
  // Recalculate average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = totalRating / this.reviews.length;
  this.rating.count = this.reviews.length;
  
  return this.save();
};

// Method to update stock
productSchema.methods.updateStock = function(sizeId, quantity) {
  const size = this.sizes.id(sizeId);
  if (size) {
    size.quantity = quantity;
    size.inStock = quantity > 0;
    // Recalculate total quantity
    this.totalQuantity = this.sizes.reduce((total, s) => total + s.quantity, 0);
    this.inStock = this.totalQuantity > 0;
  }
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
