require('dotenv').config();
const User = require('../models/User');
const connectDB = require('../config/database');

// Test users data
const testUsers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'Password123',
    phone: '0812345678',
    dateOfBirth: new Date('1995-06-15'),
    gender: 'male',
    address: {
      street: '123 Main Street',
      city: 'Cape Town',
      province: 'Western Cape',
      postalCode: '8001'
    },
    preferences: {
      newsletter: true,
      smsUpdates: false
    }
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    password: 'Password123',
    phone: '0823456789',
    dateOfBirth: new Date('1992-03-22'),
    gender: 'female',
    address: {
      street: '456 Oak Avenue',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '2000'
    },
    preferences: {
      newsletter: true,
      smsUpdates: true
    }
  },
  {
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.johnson@example.com',
    password: 'Password123',
    phone: '0834567890',
    dateOfBirth: new Date('1988-11-08'),
    gender: 'male',
    address: {
      street: '789 Pine Road',
      city: 'Durban',
      province: 'KwaZulu-Natal',
      postalCode: '4000'
    },
    preferences: {
      newsletter: false,
      smsUpdates: true
    }
  },
  {
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@example.com',
    password: 'Password123',
    phone: '0845678901',
    dateOfBirth: new Date('1990-09-12'),
    gender: 'female',
    address: {
      street: '321 Elm Street',
      city: 'Port Elizabeth',
      province: 'Eastern Cape',
      postalCode: '6000'
    },
    preferences: {
      newsletter: true,
      smsUpdates: false
    }
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@blurglobe.com',
    password: 'Admin@BlurGlobe2025',
    phone: '0800000000',
    dateOfBirth: new Date('1985-01-01'),
    gender: 'other',
    address: {
      street: '100 Admin Street',
      city: 'Cape Town',
      province: 'Western Cape',
      postalCode: '8001'
    },
    role: 'admin',
    preferences: {
      newsletter: true,
      smsUpdates: true
    }
  }
];

const seedUsers = async () => {
  try {
    await connectDB();
    
    console.log('🧹 Checking existing users...');
    
    // Don't delete existing users, just add new ones
    const existingEmails = await User.find({}, 'email').lean();
    const existingEmailsSet = new Set(existingEmails.map(u => u.email));
    
    const newUsers = testUsers.filter(user => !existingEmailsSet.has(user.email));
    
    if (newUsers.length === 0) {
      console.log('ℹ️  All test users already exist in the database');
      
      // Show existing users
      const allUsers = await User.find({}, 'firstName lastName email role createdAt').lean();
      console.log('\n📋 Existing users:');
      allUsers.forEach(user => {
        console.log(`   • ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role} - Created: ${user.createdAt.toLocaleDateString()}`);
      });
      
      process.exit(0);
    }
    
    console.log(`👤 Creating ${newUsers.length} new users...`);
    
    const createdUsers = [];
    for (const userData of newUsers) {
      try {
        const user = await User.create(userData);
        createdUsers.push(user);
        console.log(`   ✅ Created: ${user.firstName} ${user.lastName} (${user.email})`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`   ⚠️  User ${userData.email} already exists`);
        } else {
          console.log(`   ❌ Failed to create ${userData.email}:`, error.message);
        }
      }
    }
    
    console.log(`\n🎉 Successfully created ${createdUsers.length} users!`);
    
    // Show statistics
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const userCount = await User.countDocuments({ role: 'user' });
    
    console.log('\n📊 User Statistics:');
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Admin users: ${adminCount}`);
    console.log(`   Regular users: ${userCount}`);
    
    // Show all users
    const allUsers = await User.find({}, 'firstName lastName email role createdAt').lean();
    console.log('\n📋 All users in database:');
    allUsers.forEach(user => {
      console.log(`   • ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role} - Created: ${user.createdAt.toLocaleDateString()}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

// Test user creation function
const testUserCreation = async () => {
  try {
    await connectDB();
    
    console.log('🧪 Testing user creation...');
    
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test.user.${Date.now()}@example.com`,
      password: 'TestPassword123',
      phone: '0999999999',
      dateOfBirth: new Date('1995-01-01'),
      gender: 'other',
      address: {
        street: '999 Test Street',
        city: 'Test City',
        province: 'Gauteng',
        postalCode: '9999'
      }
    };
    
    const user = await User.create(testUser);
    console.log('✅ Test user created successfully:', user.fullName);
    
    // Test login
    const isPasswordValid = await user.comparePassword('TestPassword123');
    console.log('✅ Password validation works:', isPasswordValid);
    
    // Clean up test user
    await User.findByIdAndDelete(user._id);
    console.log('🧹 Test user cleaned up');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ User creation test failed:', error);
    process.exit(1);
  }
};

module.exports = { seedUsers, testUsers };

// Run seeding if this file is executed directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'test') {
    testUserCreation();
  } else {
    seedUsers();
  }
}