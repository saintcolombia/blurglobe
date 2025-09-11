require('dotenv').config();
const Product = require('../models/Product');
const connectDB = require('../config/database');

// Streetwear product data with South African pricing
const streetwearProducts = [
  // Men's T-Shirts
  {
    name: "Urban Edge Classic Tee",
    description: "Premium cotton blend T-shirt featuring minimalist streetwear design. Perfect for everyday wear with superior comfort and durability. Features ribbed crew neck and double-needle hem for lasting quality.",
    shortDescription: "Classic cotton tee with urban minimalist design",
    price: 299,
    originalPrice: 399,
    category: "T-Shirts",
    subcategory: "Basic Tees",
    gender: "men",
    season: "All Season",
    brand: "Urban Edge",
    sku: "UE-TEE-001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
        alt: "Urban Edge Classic Tee - Black",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Black", hex: "#000000", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop"] },
      { name: "White", hex: "#FFFFFF", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop"] },
      { name: "Grey", hex: "#808080", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop"] }
    ],
    sizes: [
      { size: "S", quantity: 25, inStock: true },
      { size: "M", quantity: 30, inStock: true },
      { size: "L", quantity: 35, inStock: true },
      { size: "XL", quantity: 20, inStock: true }
    ],
    material: "100% Premium Cotton",
    careInstructions: "Machine wash cold, tumble dry low",
    features: ["Ribbed crew neck", "Double-needle hem", "Pre-shrunk fabric"],
    tags: ["streetwear", "urban", "casual", "basic"],
    weight: 200,
    isFeatured: true,
    isNewArrival: true
  },

  // Women's T-Shirts
  {
    name: "Ethereal Oversized Crop",
    description: "Trendy oversized crop top with a modern streetwear aesthetic. Made from soft cotton blend for comfort and style. Perfect for layering or wearing solo with high-waisted bottoms.",
    shortDescription: "Oversized crop top with modern streetwear vibes",
    price: 349,
    originalPrice: 449,
    category: "T-Shirts",
    subcategory: "Crop Tops",
    gender: "women",
    season: "Summer",
    brand: "Ethereal",
    sku: "ETH-CROP-001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop",
        alt: "Ethereal Oversized Crop - Pink",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Pink", hex: "#FFC0CB", images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop"] },
      { name: "White", hex: "#FFFFFF", images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop"] },
      { name: "Lavender", hex: "#E6E6FA", images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop"] }
    ],
    sizes: [
      { size: "XS", quantity: 15, inStock: true },
      { size: "S", quantity: 25, inStock: true },
      { size: "M", quantity: 30, inStock: true },
      { size: "L", quantity: 20, inStock: true }
    ],
    material: "60% Cotton, 40% Polyester",
    careInstructions: "Machine wash cold, air dry recommended",
    features: ["Oversized fit", "Cropped length", "Drop shoulder design"],
    tags: ["streetwear", "crop", "oversized", "trendy"],
    weight: 180,
    isFeatured: true
  },

  // Men's Hoodies
  {
    name: "Shadow Realm Hoodie",
    description: "Premium heavyweight hoodie with embroidered graphics and fleece lining. Features kangaroo pocket and adjustable drawstring hood. Perfect for cold weather and street style.",
    shortDescription: "Premium heavyweight hoodie with embroidered details",
    price: 899,
    originalPrice: 1199,
    category: "Hoodies",
    subcategory: "Pullover Hoodies",
    gender: "men",
    season: "Winter",
    brand: "Shadow Realm",
    sku: "SR-HOOD-001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop",
        alt: "Shadow Realm Hoodie - Black",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Black", hex: "#000000", images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop"] },
      { name: "Dark Grey", hex: "#2F2F2F", images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop"] },
      { name: "Navy", hex: "#000080", images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop"] }
    ],
    sizes: [
      { size: "M", quantity: 20, inStock: true },
      { size: "L", quantity: 25, inStock: true },
      { size: "XL", quantity: 30, inStock: true },
      { size: "XXL", quantity: 15, inStock: true }
    ],
    material: "80% Cotton, 20% Polyester Fleece",
    careInstructions: "Machine wash cold, tumble dry medium",
    features: ["Fleece lined", "Embroidered graphics", "Kangaroo pocket", "Adjustable hood"],
    tags: ["hoodie", "streetwear", "premium", "embroidered"],
    weight: 650,
    isBestseller: true
  },

  // Women's Hoodies
  {
    name: "Cosmic Dreams Oversized Hoodie",
    description: "Ultra-soft oversized hoodie with celestial-inspired graphics. Perfect for cozy street style with dropped shoulders and extended length. Features thumb holes in sleeves.",
    shortDescription: "Oversized hoodie with celestial graphics and thumb holes",
    price: 799,
    originalPrice: 999,
    category: "Hoodies",
    subcategory: "Oversized Hoodies",
    gender: "women",
    season: "Winter",
    brand: "Cosmic Dreams",
    sku: "CD-HOOD-001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
        alt: "Cosmic Dreams Oversized Hoodie - Purple",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Purple", hex: "#800080", images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop"] },
      { name: "Sage Green", hex: "#9CAF88", images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop"] },
      { name: "Dusty Rose", hex: "#DCAE96", images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop"] }
    ],
    sizes: [
      { size: "XS", quantity: 12, inStock: true },
      { size: "S", quantity: 20, inStock: true },
      { size: "M", quantity: 25, inStock: true },
      { size: "L", quantity: 18, inStock: true }
    ],
    material: "70% Cotton, 30% Polyester",
    careInstructions: "Machine wash cold, air dry for best results",
    features: ["Oversized fit", "Thumb holes", "Extended length", "Drop shoulder"],
    tags: ["hoodie", "oversized", "cosmic", "cozy"],
    weight: 580,
    isNewArrival: true
  },

  // Men's Sweatshirts
  {
    name: "Velocity Crewneck",
    description: "Clean minimalist crewneck sweatshirt with subtle logo embroidery. Made from premium French terry cotton for comfort and durability. Perfect for layering or standalone wear.",
    shortDescription: "Minimalist crewneck with premium French terry cotton",
    price: 649,
    originalPrice: 799,
    category: "Sweatshirts",
    subcategory: "Crewnecks",
    gender: "men",
    season: "Autumn",
    brand: "Velocity",
    sku: "VEL-CREW-001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop",
        alt: "Velocity Crewneck - Grey",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Heather Grey", hex: "#8B8680", images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop"] },
      { name: "Navy", hex: "#000080", images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop"] },
      { name: "Forest Green", hex: "#228B22", images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop"] }
    ],
    sizes: [
      { size: "S", quantity: 18, inStock: true },
      { size: "M", quantity: 25, inStock: true },
      { size: "L", quantity: 28, inStock: true },
      { size: "XL", quantity: 22, inStock: true }
    ],
    material: "100% French Terry Cotton",
    careInstructions: "Machine wash cold, tumble dry low",
    features: ["French terry construction", "Embroidered logo", "Ribbed cuffs and hem"],
    tags: ["sweatshirt", "minimalist", "premium", "layering"],
    weight: 450
  },

  // Men's Jackets
  {
    name: "Street Legend Bomber",
    description: "Premium bomber jacket with MA-1 styling and modern streetwear details. Features multiple pockets, ribbed cuffs, and durable water-resistant coating. Perfect for urban adventures.",
    shortDescription: "MA-1 style bomber with modern streetwear details",
    price: 1299,
    originalPrice: 1699,
    category: "Jackets",
    subcategory: "Bomber Jackets",
    gender: "men",
    season: "Autumn",
    brand: "Street Legend",
    sku: "SL-BOMB-001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&h=800&fit=crop",
        alt: "Street Legend Bomber - Olive",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Olive", hex: "#808000", images: ["https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&h=800&fit=crop"] },
      { name: "Black", hex: "#000000", images: ["https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&h=800&fit=crop"] },
      { name: "Navy", hex: "#000080", images: ["https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&h=800&fit=crop"] }
    ],
    sizes: [
      { size: "M", quantity: 15, inStock: true },
      { size: "L", quantity: 20, inStock: true },
      { size: "XL", quantity: 18, inStock: true },
      { size: "XXL", quantity: 10, inStock: true }
    ],
    material: "100% Nylon with Polyester Lining",
    careInstructions: "Dry clean or hand wash cold",
    features: ["Water-resistant", "Multiple pockets", "Ribbed cuffs", "MA-1 styling"],
    tags: ["bomber", "jacket", "streetwear", "urban"],
    weight: 750,
    isFeatured: true
  },

  // Women's Jackets
  {
    name: "Neon Nights Windbreaker",
    description: "Lightweight windbreaker with reflective details and neon accents. Perfect for active lifestyles and night activities. Features packable design and adjustable hood.",
    shortDescription: "Lightweight windbreaker with reflective neon accents",
    price: 899,
    originalPrice: 1199,
    category: "Jackets",
    subcategory: "Windbreakers",
    gender: "women",
    season: "Spring",
    brand: "Neon Nights",
    sku: "NN-WIND-001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=800&fit=crop",
        alt: "Neon Nights Windbreaker - Black with Neon",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Black/Neon Pink", hex: "#000000", images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=800&fit=crop"] },
      { name: "White/Neon Green", hex: "#FFFFFF", images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=800&fit=crop"] }
    ],
    sizes: [
      { size: "XS", quantity: 12, inStock: true },
      { size: "S", quantity: 18, inStock: true },
      { size: "M", quantity: 22, inStock: true },
      { size: "L", quantity: 15, inStock: true }
    ],
    material: "100% Nylon Ripstop",
    careInstructions: "Machine wash cold, air dry",
    features: ["Reflective details", "Packable", "Adjustable hood", "Neon accents"],
    tags: ["windbreaker", "reflective", "neon", "active"],
    weight: 350,
    isNewArrival: true
  },

  // Men's Jeans
  {
    name: "Urban Rebel Slim Fit",
    description: "Premium denim with modern slim fit and subtle distressing. Made from stretch denim for comfort and mobility. Features classic five-pocket styling with modern updates.",
    shortDescription: "Premium slim fit jeans with stretch denim",
    price: 899,
    originalPrice: 1199,
    category: "Jeans",
    subcategory: "Slim Fit",
    gender: "men",
    season: "All Season",
    brand: "Urban Rebel",
    sku: "UR-JEAN-001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop",
        alt: "Urban Rebel Slim Fit - Dark Wash",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Dark Wash", hex: "#1C1C1C", images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop"] },
      { name: "Light Wash", hex: "#6495ED", images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop"] },
      { name: "Black", hex: "#000000", images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop"] }
    ],
    sizes: [
      { size: "30", quantity: 15, inStock: true },
      { size: "32", quantity: 25, inStock: true },
      { size: "34", quantity: 30, inStock: true },
      { size: "36", quantity: 20, inStock: true },
      { size: "38", quantity: 12, inStock: true }
    ],
    material: "98% Cotton, 2% Elastane",
    careInstructions: "Machine wash cold, tumble dry medium",
    features: ["Stretch denim", "Slim fit", "Five-pocket styling", "Subtle distressing"],
    tags: ["jeans", "slim", "denim", "stretch"],
    weight: 600,
    isBestseller: true
  },

  // Women's Jeans
  {
    name: "Midnight Muse High-Rise",
    description: "High-rise skinny jeans with figure-flattering fit and premium stretch denim. Features classic five-pocket design with modern updates. Perfect for both casual and elevated looks.",
    shortDescription: "High-rise skinny jeans with premium stretch",
    price: 849,
    originalPrice: 1099,
    category: "Jeans",
    subcategory: "High-Rise Skinny",
    gender: "women",
    season: "All Season",
    brand: "Midnight Muse",
    sku: "MM-JEAN-001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop",
        alt: "Midnight Muse High-Rise - Dark Blue",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Dark Blue", hex: "#00008B", images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop"] },
      { name: "Black", hex: "#000000", images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop"] },
      { name: "Light Blue", hex: "#ADD8E6", images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop"] }
    ],
    sizes: [
      { size: "26", quantity: 12, inStock: true },
      { size: "28", quantity: 20, inStock: true },
      { size: "30", quantity: 25, inStock: true },
      { size: "32", quantity: 18, inStock: true },
      { size: "34", quantity: 15, inStock: true }
    ],
    material: "92% Cotton, 6% Polyester, 2% Elastane",
    careInstructions: "Machine wash cold, hang dry",
    features: ["High-rise waist", "Skinny fit", "Stretch denim", "Five-pocket design"],
    tags: ["jeans", "high-rise", "skinny", "stretch"],
    weight: 550
  },

  // Men's Joggers
  {
    name: "Motion Flow Track Pants",
    description: "Premium joggers with tapered fit and technical fabric blend. Features elastic waistband with drawstring, zippered pockets, and ankle cuffs. Perfect for both workouts and casual wear.",
    shortDescription: "Premium joggers with technical fabric and zippered pockets",
    price: 599,
    originalPrice: 799,
    category: "Joggers",
    subcategory: "Track Pants",
    gender: "men",
    season: "All Season",
    brand: "Motion Flow",
    sku: "MF-JOG-001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1506629905607-c755abb5ba05?w=800&h=800&fit=crop",
        alt: "Motion Flow Track Pants - Grey",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Charcoal", hex: "#36454F", images: ["https://images.unsplash.com/photo-1506629905607-c755abb5ba05?w=800&h=800&fit=crop"] },
      { name: "Black", hex: "#000000", images: ["https://images.unsplash.com/photo-1506629905607-c755abb5ba05?w=800&h=800&fit=crop"] },
      { name: "Navy", hex: "#000080", images: ["https://images.unsplash.com/photo-1506629905607-c755abb5ba05?w=800&h=800&fit=crop"] }
    ],
    sizes: [
      { size: "S", quantity: 18, inStock: true },
      { size: "M", quantity: 28, inStock: true },
      { size: "L", quantity: 32, inStock: true },
      { size: "XL", quantity: 24, inStock: true }
    ],
    material: "65% Cotton, 35% Polyester",
    careInstructions: "Machine wash cold, tumble dry low",
    features: ["Tapered fit", "Zippered pockets", "Elastic waistband", "Ankle cuffs"],
    tags: ["joggers", "athletic", "comfort", "casual"],
    weight: 420
  },

  // Men's Shorts
  {
    name: "Summer Vibes Board Shorts",
    description: "Versatile board shorts perfect for beach days and casual summer wear. Features quick-dry fabric, mesh lining, and secure pocket with velcro closure. Modern fit with 7-inch inseam.",
    shortDescription: "Quick-dry board shorts with mesh lining",
    price: 449,
    originalPrice: 599,
    category: "Shorts",
    subcategory: "Board Shorts",
    gender: "men",
    season: "Summer",
    brand: "Summer Vibes",
    sku: "SV-SHORT-001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1506629905607-c755abb5ba05?w=800&h=800&fit=crop",
        alt: "Summer Vibes Board Shorts - Blue",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Ocean Blue", hex: "#006994", images: ["https://images.unsplash.com/photo-1506629905607-c755abb5ba05?w=800&h=800&fit=crop"] },
      { name: "Coral", hex: "#FF7F50", images: ["https://images.unsplash.com/photo-1506629905607-c755abb5ba05?w=800&h=800&fit=crop"] },
      { name: "Black", hex: "#000000", images: ["https://images.unsplash.com/photo-1506629905607-c755abb5ba05?w=800&h=800&fit=crop"] }
    ],
    sizes: [
      { size: "S", quantity: 20, inStock: true },
      { size: "M", quantity: 25, inStock: true },
      { size: "L", quantity: 30, inStock: true },
      { size: "XL", quantity: 18, inStock: true }
    ],
    material: "100% Polyester with Mesh Lining",
    careInstructions: "Machine wash cold, air dry",
    features: ["Quick-dry fabric", "Mesh lining", "Secure pocket", "7-inch inseam"],
    tags: ["shorts", "beach", "quick-dry", "summer"],
    weight: 250
  },

  // Men's Sneakers
  {
    name: "Street Elite High-Tops",
    description: "Premium high-top sneakers with leather and suede construction. Features cushioned sole, padded collar, and signature branding. Perfect blend of street style and comfort.",
    shortDescription: "Premium leather high-top sneakers with cushioned sole",
    price: 1499,
    originalPrice: 1999,
    category: "Sneakers",
    subcategory: "High-Top",
    gender: "men",
    season: "All Season",
    brand: "Street Elite",
    sku: "SE-SNEAK-001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop",
        alt: "Street Elite High-Tops - White/Black",
        isPrimary: true
      }
    ],
    colors: [
      { name: "White/Black", hex: "#FFFFFF", images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop"] },
      { name: "All Black", hex: "#000000", images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop"] },
      { name: "Navy/White", hex: "#000080", images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop"] }
    ],
    sizes: [
      { size: "8", quantity: 10, inStock: true },
      { size: "9", quantity: 15, inStock: true },
      { size: "10", quantity: 20, inStock: true },
      { size: "11", quantity: 18, inStock: true },
      { size: "12", quantity: 12, inStock: true }
    ],
    material: "Premium Leather and Suede Upper",
    careInstructions: "Clean with leather cleaner, air dry",
    features: ["High-top design", "Cushioned sole", "Padded collar", "Premium materials"],
    tags: ["sneakers", "high-top", "leather", "street"],
    weight: 800,
    isFeatured: true
  },

  // Women's Sneakers
  {
    name: "Aurora Low-Top Sneakers",
    description: "Stylish low-top sneakers with holographic details and comfortable fit. Features breathable mesh panels, cushioned insole, and durable rubber outsole. Perfect for everyday wear.",
    shortDescription: "Low-top sneakers with holographic details",
    price: 1299,
    originalPrice: 1699,
    category: "Sneakers",
    subcategory: "Low-Top",
    gender: "women",
    season: "All Season",
    brand: "Aurora",
    sku: "AUR-SNEAK-001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&h=800&fit=crop",
        alt: "Aurora Low-Top Sneakers - Holographic",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Holographic", hex: "#C0C0C0", images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&h=800&fit=crop"] },
      { name: "White", hex: "#FFFFFF", images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&h=800&fit=crop"] },
      { name: "Rose Gold", hex: "#E8B4B8", images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&h=800&fit=crop"] }
    ],
    sizes: [
      { size: "6", quantity: 12, inStock: true },
      { size: "7", quantity: 18, inStock: true },
      { size: "8", quantity: 22, inStock: true },
      { size: "9", quantity: 15, inStock: true },
      { size: "10", quantity: 8, inStock: true }
    ],
    material: "Synthetic Upper with Mesh Panels",
    careInstructions: "Clean with damp cloth, air dry",
    features: ["Holographic details", "Breathable mesh", "Cushioned insole", "Rubber outsole"],
    tags: ["sneakers", "holographic", "low-top", "trendy"],
    weight: 650,
    isNewArrival: true
  }
];

// Continue with more products to reach 120+
const additionalProducts = [
  // More Men's T-Shirts
  {
    name: "Retro Wave Graphic Tee",
    description: "Vintage-inspired graphic tee with retro wave design and neon colors. Soft cotton blend with modern fit and vibrant screen-printed graphics.",
    shortDescription: "Vintage graphic tee with retro wave design",
    price: 399,
    originalPrice: 499,
    category: "T-Shirts",
    subcategory: "Graphic Tees",
    gender: "men",
    season: "Summer",
    brand: "Retro Wave",
    sku: "RW-TEE-002",
    images: [{ url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop", alt: "Retro Wave Graphic Tee", isPrimary: true }],
    colors: [{ name: "Black", hex: "#000000", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop"] }],
    sizes: [{ size: "S", quantity: 20, inStock: true }, { size: "M", quantity: 25, inStock: true }, { size: "L", quantity: 30, inStock: true }],
    material: "100% Cotton",
    careInstructions: "Machine wash cold",
    features: ["Vintage design", "Screen printed graphics"],
    tags: ["retro", "graphic", "vintage"],
    weight: 180
  },

  {
    name: "Minimalist Logo Tee",
    description: "Clean and simple logo tee with embroidered branding. Premium cotton construction with relaxed fit for everyday comfort.",
    shortDescription: "Clean logo tee with embroidered branding",
    price: 349,
    category: "T-Shirts",
    subcategory: "Logo Tees",
    gender: "men",
    season: "All Season",
    brand: "Minimalist",
    sku: "MIN-TEE-003",
    images: [{ url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop", alt: "Minimalist Logo Tee", isPrimary: true }],
    colors: [{ name: "White", hex: "#FFFFFF", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop"] }],
    sizes: [{ size: "M", quantity: 25, inStock: true }, { size: "L", quantity: 30, inStock: true }],
    material: "100% Premium Cotton",
    careInstructions: "Machine wash cold",
    features: ["Embroidered logo", "Relaxed fit"],
    tags: ["minimalist", "logo", "clean"],
    weight: 200
  },

  // More Women's Items
  {
    name: "Butterfly Effect Crop Top",
    description: "Delicate crop top with butterfly print and flutter sleeves. Made from lightweight chiffon with comfortable lining.",
    shortDescription: "Butterfly print crop top with flutter sleeves",
    price: 449,
    originalPrice: 599,
    category: "T-Shirts",
    subcategory: "Crop Tops",
    gender: "women",
    season: "Spring",
    brand: "Butterfly Effect",
    sku: "BE-CROP-002",
    images: [{ url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop", alt: "Butterfly Effect Crop Top", isPrimary: true }],
    colors: [{ name: "Pink", hex: "#FFC0CB", images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop"] }],
    sizes: [{ size: "S", quantity: 20, inStock: true }, { size: "M", quantity: 25, inStock: true }],
    material: "Chiffon with Cotton Lining",
    careInstructions: "Hand wash cold",
    features: ["Butterfly print", "Flutter sleeves", "Lined"],
    tags: ["butterfly", "crop", "feminine"],
    weight: 150
  },

  {
    name: "Power Mesh Athletic Top",
    description: "High-performance athletic top with mesh panels and moisture-wicking fabric. Built-in bra and racerback design for active lifestyles.",
    shortDescription: "Athletic top with mesh panels and built-in bra",
    price: 599,
    category: "T-Shirts",
    subcategory: "Athletic Tops",
    gender: "women",
    season: "All Season",
    brand: "Power Mesh",
    sku: "PM-ATH-003",
    images: [{ url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop", alt: "Power Mesh Athletic Top", isPrimary: true }],
    colors: [{ name: "Black", hex: "#000000", images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop"] }],
    sizes: [{ size: "S", quantity: 18, inStock: true }, { size: "M", quantity: 22, inStock: true }],
    material: "Polyester Blend with Mesh",
    careInstructions: "Machine wash cold",
    features: ["Moisture-wicking", "Built-in bra", "Mesh panels"],
    tags: ["athletic", "performance", "mesh"],
    weight: 160
  }
];

// Generate more products to reach 120+ total
const generateMoreProducts = () => {
  const categories = ["T-Shirts", "Hoodies", "Sweatshirts", "Jackets", "Jeans", "Joggers", "Shorts", "Sneakers", "Caps", "Bags", "Accessories"];
  const brands = ["Street Elite", "Urban Edge", "Shadow Realm", "Cosmic Dreams", "Neon Nights", "Velocity", "Motion Flow", "Aurora", "Ethereal", "Midnight Muse"];
  const colors = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Grey", hex: "#808080" },
    { name: "Navy", hex: "#000080" },
    { name: "Red", hex: "#FF0000" },
    { name: "Blue", hex: "#0000FF" },
    { name: "Green", hex: "#008000" },
    { name: "Pink", hex: "#FFC0CB" },
    { name: "Purple", hex: "#800080" },
    { name: "Orange", hex: "#FFA500" }
  ];
  
  const generatedProducts = [];
  
  for (let i = 1; i <= 110; i++) {
    const category = categories[i % categories.length];
    const brand = brands[i % brands.length];
    const gender = i % 2 === 0 ? "men" : "women";
    const season = ["Spring", "Summer", "Autumn", "Winter", "All Season"][i % 5];
    
    const basePrice = Math.floor(Math.random() * 1500) + 200;
    const originalPrice = basePrice + Math.floor(Math.random() * 400) + 100;
    
    const product = {
      name: `${brand} ${category.slice(0, -1)} ${i}`,
      description: `High-quality ${category.toLowerCase()} designed for modern streetwear enthusiasts. Features premium materials and contemporary styling for ultimate comfort and style.`,
      shortDescription: `Premium ${category.toLowerCase()} with modern design`,
      price: basePrice,
      originalPrice: originalPrice,
      category: category,
      subcategory: `Premium ${category}`,
      gender: gender,
      season: season,
      brand: brand,
      sku: `${brand.replace(/\s/g, '').substring(0, 3).toUpperCase()}-${category.substring(0, 3).toUpperCase()}-${String(i).padStart(3, '0')}`,
      images: [{
        url: category === "Sneakers" ? 
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop" :
          gender === "women" ?
            "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop" :
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
        alt: `${brand} ${category} ${i}`,
        isPrimary: true
      }],
      colors: [colors[i % colors.length], colors[(i + 1) % colors.length]],
      sizes: category === "Sneakers" ?
        [
          { size: "8", quantity: Math.floor(Math.random() * 20) + 5, inStock: true },
          { size: "9", quantity: Math.floor(Math.random() * 25) + 10, inStock: true },
          { size: "10", quantity: Math.floor(Math.random() * 30) + 15, inStock: true }
        ] :
        category === "Jeans" ?
        [
          { size: "30", quantity: Math.floor(Math.random() * 20) + 5, inStock: true },
          { size: "32", quantity: Math.floor(Math.random() * 25) + 10, inStock: true },
          { size: "34", quantity: Math.floor(Math.random() * 30) + 15, inStock: true }
        ] :
        [
          { size: "S", quantity: Math.floor(Math.random() * 20) + 5, inStock: true },
          { size: "M", quantity: Math.floor(Math.random() * 25) + 10, inStock: true },
          { size: "L", quantity: Math.floor(Math.random() * 30) + 15, inStock: true },
          { size: "XL", quantity: Math.floor(Math.random() * 20) + 8, inStock: true }
        ],
      material: category === "Jeans" ? "98% Cotton, 2% Elastane" : 
                category === "Sneakers" ? "Premium Synthetic Materials" :
                "Premium Cotton Blend",
      careInstructions: category === "Sneakers" ? "Clean with damp cloth" : "Machine wash cold, tumble dry low",
      features: ["Premium quality", "Modern fit", "Durable construction"],
      tags: ["streetwear", category.toLowerCase(), brand.toLowerCase().replace(/\s/g, '')],
      weight: Math.floor(Math.random() * 500) + 150,
      isFeatured: i % 10 === 0,
      isNewArrival: i % 7 === 0,
      isBestseller: i % 12 === 0
    };
    
    generatedProducts.push(product);
  }
  
  return generatedProducts;
};

// Helper to generate slug
const slugify = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const seedProducts = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Combine all products
    const allProducts = [...streetwearProducts, ...additionalProducts, ...generateMoreProducts()];

    // Prepare products: ensure slug is present and unique
    const preparedProducts = allProducts.map((p, idx) => ({
      ...p,
      slug: slugify(p.name) + '-' + (idx + 1)
    }));
    
    console.log(`Seeding ${preparedProducts.length} products...`);
    
    // Insert products in batches
    const batchSize = 50;
    for (let i = 0; i < preparedProducts.length; i += batchSize) {
      const batch = preparedProducts.slice(i, i + batchSize);
      await Product.insertMany(batch, { ordered: true });
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(preparedProducts.length / batchSize)}`);
    }
    
    console.log(`✅ Successfully seeded ${preparedProducts.length} products!`);
    
    // Log some statistics
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          menProducts: { $sum: { $cond: [{ $eq: ["$gender", "men"] }, 1, 0] } },
          womenProducts: { $sum: { $cond: [{ $eq: ["$gender", "women"] }, 1, 0] } },
          featuredProducts: { $sum: { $cond: ["$isFeatured", 1, 0] } },
          newArrivals: { $sum: { $cond: ["$isNewArrival", 1, 0] } },
          bestsellers: { $sum: { $cond: ["$isBestseller", 1, 0] } }
        }
      }
    ]);
    
    console.log('📊 Product Statistics:', stats[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

module.exports = { seedProducts, streetwearProducts };

// Run seeding if this file is executed directly
if (require.main === module) {
  seedProducts();
}
