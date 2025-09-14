require('dotenv').config();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const connectDB = require('../config/database');

const seedOrders = async () => {
  try {
    await connectDB();
    
    console.log('📦 Starting order seeding...');
    
    // Get users and products
    const users = await User.find({ role: 'user' }).limit(5);
    const products = await Product.find({ isActive: true }).limit(10);
    
    if (users.length === 0) {
      console.log('❌ No users found. Run: node scripts/seedUsers.js first');
      process.exit(1);
    }
    
    if (products.length === 0) {
      console.log('❌ No products found. Run: node scripts/seedProducts.js first');
      process.exit(1);
    }
    
    // Clear existing orders
    await Order.deleteMany({});
    console.log('🧹 Cleared existing orders');
    
    const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const paymentMethods = ['card', 'payfast', 'eft', 'cash_on_delivery'];
    
    const ordersToCreate = [];
    
    // Create 20 orders
    for (let i = 0; i < 20; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
      const orderItems = [];
      let subtotal = 0;
      
      // Create order items
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
        const size = product.sizes[Math.floor(Math.random() * product.sizes.length)];
        const itemTotal = product.price * quantity;
        
        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images[0].url,
          price: product.price,
          quantity: quantity,
          size: size.size,
          totalPrice: itemTotal
        });
        
        subtotal += itemTotal;
      }
      
      const tax = subtotal * 0.15;
      const shippingCost = subtotal >= 500 ? 0 : 99;
      const total = subtotal + tax + shippingCost;
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      
      // Random date in last 60 days
      const daysAgo = Math.floor(Math.random() * 60) + 1;
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      
      const order = {
        user: user._id,
        items: orderItems,
        shippingAddress: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          street: user.address.street,
          city: user.address.city,
          province: user.address.province,
          postalCode: user.address.postalCode,
          country: 'South Africa'
        },
        billingAddress: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          street: user.address.street,
          city: user.address.city,
          province: user.address.province,
          postalCode: user.address.postalCode,
          country: 'South Africa',
          sameAsShipping: true
        },
        paymentInfo: {
          method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          status: 'paid',
          transactionId: `TXN-${Date.now()}-${i}`,
          paymentDate: orderDate
        },
        pricing: {
          subtotal: Math.round(subtotal * 100) / 100,
          tax: Math.round(tax * 100) / 100,
          taxRate: 0.15,
          shipping: {
            cost: shippingCost,
            method: 'standard',
            isFree: shippingCost === 0
          },
          discount: {
            code: '',
            amount: 0
          },
          total: Math.round(total * 100) / 100
        },
        status: status,
        fulfillment: {
          estimatedDelivery: new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          actualDelivery: status === 'delivered' ? new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000) : null
        },
        createdAt: orderDate,
        updatedAt: orderDate
      };
      
      ordersToCreate.push(order);
    }
    
    // Insert orders
    const createdOrders = await Order.insertMany(ordersToCreate);
    
    console.log(`✅ Successfully created ${createdOrders.length} orders!`);
    
    // Show statistics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$pricing.total' }
        }
      }
    ]);
    
    console.log('\n📊 Order Statistics:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} orders, R${stat.totalValue.toFixed(2)}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedOrders();
}

module.exports = { seedOrders };