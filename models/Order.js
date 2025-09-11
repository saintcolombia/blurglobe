const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be positive']
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  size: {
    type: String,
    required: true
  },
  color: {
    name: String,
    hex: String
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price must be positive']
  }
}, {
  timestamps: true
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    province: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'South Africa'
    },
    instructions: String
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: {
      type: String,
      default: 'South Africa'
    },
    sameAsShipping: {
      type: Boolean,
      default: true
    }
  },
  paymentInfo: {
    method: {
      type: String,
      required: true,
      enum: ['card', 'payfast', 'eft', 'cash_on_delivery']
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'partial_refund']
    },
    transactionId: String,
    paymentDate: Date,
    cardLast4: String,
    cardType: String
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    tax: {
      type: Number,
      required: true,
      min: [0, 'Tax cannot be negative']
    },
    taxRate: {
      type: Number,
      default: 0.15
    },
    shipping: {
      cost: {
        type: Number,
        required: true,
        min: [0, 'Shipping cost cannot be negative']
      },
      method: {
        type: String,
        default: 'standard'
      },
      isFree: {
        type: Boolean,
        default: false
      }
    },
    discount: {
      code: String,
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Discount amount cannot be negative']
      }
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  },
  currency: {
    type: String,
    default: 'ZAR',
    enum: ['ZAR']
  },
  status: {
    type: String,
    default: 'pending',
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'returned',
      'refunded'
    ]
  },
  tracking: {
    number: String,
    courier: String,
    url: String,
    history: [{
      status: String,
      location: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      description: String
    }]
  },
  fulfillment: {
    estimatedDelivery: Date,
    actualDelivery: Date,
    shippedDate: Date,
    warehouse: {
      type: String,
      default: 'main'
    }
  },
  customerNotes: String,
  adminNotes: String,
  refund: {
    amount: {
      type: Number,
      default: 0
    },
    reason: String,
    date: Date,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  isGift: {
    type: Boolean,
    default: false
  },
  giftMessage: String,
  newsletter: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
orderSchema.index({ user: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'paymentInfo.status': 1 });
orderSchema.index({ 'tracking.number': 1 });

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for is completed
orderSchema.virtual('isCompleted').get(function() {
  return ['delivered', 'cancelled', 'returned', 'refunded'].includes(this.status);
});

// Virtual for can cancel
orderSchema.virtual('canCancel').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

// Virtual for can return
orderSchema.virtual('canReturn').get(function() {
  const deliveredDate = this.fulfillment.actualDelivery;
  if (!deliveredDate || this.status !== 'delivered') return false;
  
  // Can return within 30 days of delivery
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return deliveredDate > thirtyDaysAgo;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Find the latest order for today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const latestOrder = await this.constructor.findOne({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    }).sort({ createdAt: -1 });
    
    let sequence = 1;
    if (latestOrder && latestOrder.orderNumber) {
      const lastSequence = parseInt(latestOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }
    
    this.orderNumber = `BG${year}${month}${day}${sequence.toString().padStart(4, '0')}`;
  }
  
  // Set estimated delivery date if not set
  if (!this.fulfillment.estimatedDelivery && this.status === 'confirmed') {
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + 5); // 5 business days
    this.fulfillment.estimatedDelivery = estimatedDate;
  }
  
  next();
});

// Method to add tracking history
orderSchema.methods.addTrackingHistory = async function(status, location, description) {
  this.tracking.history.push({
    status,
    location,
    description,
    timestamp: new Date()
  });
  
  // Update main status if it's a significant tracking update
  const statusMap = {
    'shipped': 'shipped',
    'out_for_delivery': 'out_for_delivery',
    'delivered': 'delivered'
  };
  
  if (statusMap[status]) {
    this.status = statusMap[status];
    
    if (status === 'delivered') {
      this.fulfillment.actualDelivery = new Date();
    } else if (status === 'shipped') {
      this.fulfillment.shippedDate = new Date();
    }
  }
  
  return this.save();
};

// Method to update order status
orderSchema.methods.updateStatus = async function(newStatus, adminNotes) {
  const validTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['processing', 'cancelled'],
    'processing': ['shipped', 'cancelled'],
    'shipped': ['out_for_delivery', 'delivered'],
    'out_for_delivery': ['delivered'],
    'delivered': ['returned'],
    'cancelled': [],
    'returned': ['refunded'],
    'refunded': []
  };
  
  if (!validTransitions[this.status]?.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  if (adminNotes) {
    this.adminNotes = adminNotes;
  }
  
  // Update fulfillment dates
  if (newStatus === 'shipped' && !this.fulfillment.shippedDate) {
    this.fulfillment.shippedDate = new Date();
  } else if (newStatus === 'delivered' && !this.fulfillment.actualDelivery) {
    this.fulfillment.actualDelivery = new Date();
  }
  
  return this.save();
};

// Method to process refund
orderSchema.methods.processRefund = async function(amount, reason, processedBy) {
  this.refund = {
    amount: amount,
    reason: reason,
    date: new Date(),
    processedBy: processedBy
  };
  
  this.status = amount >= this.pricing.total ? 'refunded' : this.status;
  this.paymentInfo.status = amount >= this.pricing.total ? 'refunded' : 'partial_refund';
  
  return this.save();
};

// Static method to get orders by user
orderSchema.statics.getByUser = function(userId, status = null) {
  const query = { user: userId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get orders by date range
orderSchema.statics.getByDateRange = function(startDate, endDate, status = null) {
  const query = {
    createdAt: { $gte: startDate, $lte: endDate }
  };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get sales statistics
orderSchema.statics.getSalesStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $nin: ['cancelled', 'refunded'] }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' },
        averageOrderValue: { $avg: '$pricing.total' },
        totalItems: { $sum: { $sum: '$items.quantity' } }
      }
    }
  ]);
};

// Static method to get top selling products
orderSchema.statics.getTopSellingProducts = function(limit = 10, startDate, endDate) {
  const matchStage = {
    status: { $nin: ['cancelled', 'refunded'] }
  };
  
  if (startDate && endDate) {
    matchStage.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        productName: { $first: '$items.name' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.totalPrice' }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
