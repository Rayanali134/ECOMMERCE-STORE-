require("dotenv").config();
const { connectDB } = require("./config/db");
const {
  User,
  Category,
  Product,
  StoreSettings,
} = require("./models");

const seedCategories = [
  {
    name: "Electronics & Audio",
    slug: "electronics-audio",
    description: "Premium headphones, smart accessories and gadgets",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    isFeatured: true,
  },
  {
    name: "Men's Apparel",
    slug: "mens-apparel",
    description: "Tailored shirts, casual tees, jackets and essentials",
    image:
      "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&q=80",
    isFeatured: true,
  },
  {
    name: "Watches & Accessories",
    slug: "watches-accessories",
    description: "Minimalist luxury timepieces and leather accessories",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    isFeatured: true,
  },
  {
    name: "Footwear & Sneakers",
    slug: "footwear-sneakers",
    description: "Comfortable athletic and lifestyle sneakers",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    isFeatured: true,
  },
];

const seedProducts = [
  {
    title: "Aura Pro Wireless Noise-Cancelling Headphones",
    slug: "aura-pro-wireless-headphones",
    sku: "AURA-HD-001",
    shortDescription:
      "Studio-grade audio with active hybrid noise cancellation, 40-hour battery, and ultra-plush memory foam earcups.",
    description:
      "Experience music like never before. The Aura Pro delivers deep, punchy bass, crisp highs, and crystal-clear mids. With 40 hours of playtime and rapid USB-C charging, your audio journey never stops.",
    price: 18500,
    salePrice: 14999,
    stock: 25,
    categoryName: "Electronics & Audio",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
    ],
    variants: [
      { name: "Color", options: ["Matte Black", "Silver Frost", "Midnight Blue"] },
    ],
    specifications: [
      { title: "Battery Life", value: "40 Hours" },
      { title: "Bluetooth Version", value: "5.3 Ultra Low Latency" },
      { title: "Warranty", value: "1 Year Official Warranty" },
    ],
    tags: ["headphones", "wireless", "audio", "bluetooth"],
    isFeatured: true,
    isBestSeller: true,
    rating: 4.9,
    numReviews: 38,
  },
  {
    title: "Classic Chronograph Leather Watch",
    slug: "classic-chronograph-leather-watch",
    sku: "WTC-CHRONO-002",
    shortDescription:
      "Timeless Japanese quartz movement encased in 316L stainless steel with genuine Italian leather strap.",
    description:
      "Sophisticated elegance for everyday wear and formal occasions. Water-resistant up to 50 meters, featuring scratch-resistant sapphire crystal glass.",
    price: 12500,
    salePrice: 9999,
    stock: 18,
    categoryName: "Watches & Accessories",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
    ],
    variants: [
      { name: "Dial Color", options: ["Emerald Green", "Obsidian Black", "Arctic White"] },
      { name: "Strap", options: ["Brown Leather", "Black Leather"] },
    ],
    specifications: [
      { title: "Case Diameter", value: "42mm" },
      { title: "Water Resistance", value: "5 ATM (50m)" },
      { title: "Glass", value: "Sapphire Crystal" },
    ],
    tags: ["watch", "luxury", "accessories", "leather"],
    isFeatured: true,
    isBestSeller: true,
    rating: 4.8,
    numReviews: 24,
  },
  {
    title: "Apex Velocity Performance Running Shoes",
    slug: "apex-velocity-running-shoes",
    sku: "SHOE-APEX-003",
    shortDescription:
      "Breathable engineered mesh with responsive carbon-infused foam sole for maximum energy return.",
    description:
      "Built for peak performance and casual comfort. The Apex Velocity shoes deliver unparalleled shock absorption and breathable airflow on every stride.",
    price: 14500,
    salePrice: 11999,
    stock: 30,
    categoryName: "Footwear & Sneakers",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
    ],
    variants: [
      { name: "Size (EU)", options: ["40", "41", "42", "43", "44", "45"] },
      { name: "Color", options: ["Crimson Red", "Triple Black", "Ghost White"] },
    ],
    specifications: [
      { title: "Upper Material", value: "Engineered Flymesh" },
      { title: "Cushioning", value: "Air-Foam Double Density" },
      { title: "Weight", value: "240g (Size 42)" },
    ],
    tags: ["shoes", "sneakers", "sports", "running"],
    isFeatured: true,
    isNewArrival: true,
    rating: 4.9,
    numReviews: 42,
  },
  {
    title: "Oversized Heavyweight Cotton Hoodie",
    slug: "oversized-heavyweight-hoodie",
    sku: "HOOD-HVY-004",
    shortDescription:
      "450 GSM French Terry 100% organic cotton hoodie with dropped shoulders and double-layered hood.",
    description:
      "The ultimate streetwear staple. Pre-shrunk for the perfect boxy relaxed fit that holds its shape wash after wash.",
    price: 6500,
    salePrice: 4999,
    stock: 45,
    categoryName: "Men's Apparel",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&q=80",
    ],
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL", "XXL"] },
      { name: "Color", options: ["Washed Black", "Heather Grey", "Sandstone Beige"] },
    ],
    specifications: [
      { title: "Fabric", value: "100% Organic French Terry Cotton (450 GSM)" },
      { title: "Fit", value: "Boxy Oversized" },
    ],
    tags: ["hoodie", "streetwear", "apparel", "winter"],
    isFeatured: true,
    isNewArrival: true,
    rating: 5.0,
    numReviews: 19,
  },
];

const seedDB = async () => {
  try {
    await connectDB();

    console.log("🧹 Clearing old products and categories...");
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log("🌱 Seeding Categories...");
    const createdCategories = await Category.insertMany(seedCategories);

    console.log("🌱 Seeding Products...");
    const productsWithCategory = seedProducts.map((prod) => {
      const cat = createdCategories.find((c) => c.name === prod.categoryName);
      return {
        ...prod,
        category: cat ? cat._id : null,
      };
    });

    await Product.insertMany(productsWithCategory);

    console.log("🌱 Ensuring Default Store Settings & Return Policy...");
    const existingSettings = await StoreSettings.findOne();
    if (!existingSettings) {
      await StoreSettings.create({
        storeName: "EcoStore",
        storeTagline: "Premium Online Store & Direct Ordering",
        contactEmail: "rayanali0560@gmail.com",
        contactPhone: "+92 321 3633473",
        whatsappNumber: "+92 321 3633473",
        currency: "PKR",
        currencySymbol: "Rs.",
        shippingFee: 200,
        freeShippingThreshold: 2500,
      });
    }

    console.log("=========================================");
    console.log("✅ Store Database Seeded Successfully!");
    console.log(`📦 Categories created: ${createdCategories.length}`);
    console.log(`🛍️ Products created: ${seedProducts.length}`);
    console.log("=========================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeder Error:", error.message);
    process.exit(1);
  }
};

seedDB();
