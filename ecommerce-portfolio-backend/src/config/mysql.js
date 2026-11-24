const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let pool = null;
let isConnected = false;

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = parseInt(process.env.DB_PORT || "3306", 10);
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "";
const DB_NAME = process.env.DB_NAME || "ecommerce_portfolio";
const JWT_SECRET = process.env.JWT_SECRET || "ecommerce_secret_key_123456";

async function initMySQL() {
  try {
    // Step 1: Connect to MySQL server (without selecting DB yet)
    const initConn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      connectTimeout: 4000,
    });

    // Step 2: Auto-create database if it does not exist
    await initConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await initConn.end();

    // Step 3: Create connection pool with database selected
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Step 4: Create & upgrade tables for phpMyAdmin / MySQL
    await createTables();

    // Step 5: Seed default products & admin users
    await seedDefaultProducts();
    await seedDefaultUsers();
    await seedDefaultSettings();
    await seedDefaultTestimonials();

    isConnected = true;
    console.log(`✅ [MySQL & phpMyAdmin Connected]: Database "${DB_NAME}" active on ${DB_HOST}:${DB_PORT}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ MySQL Connection Notice: ${error.message}`);
    console.log(`👉 If using XAMPP: Start MySQL in XAMPP Control Panel.`);
    console.log(`👉 If using MySQL Workbench: Verify DB_PASSWORD in backend .env.`);
    return false;
  }
}

async function ensureColumn(tableName, columnName, columnDefinition) {
  if (!pool) return;
  try {
    const [cols] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [DB_NAME, tableName, columnName]
    );
    if (cols.length === 0) {
      await pool.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnDefinition}`);
    }
  } catch (err) {
    // Ignore schema check errors
  }
}

async function createTables() {
  if (!pool) return;

  // 1. Products Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      categoryName VARCHAR(100) NOT NULL,
      shortDescription TEXT,
      description LONGTEXT,
      price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      salePrice DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      discountPercent INT DEFAULT 0,
      stock INT NOT NULL DEFAULT 10,
      inStock BOOLEAN DEFAULT TRUE,
      rating DECIMAL(2,1) DEFAULT 4.9,
      numReviews INT DEFAULT 20,
      image VARCHAR(500),
      imagesJson JSON,
      variantsJson JSON,
      specificationsJson JSON,
      tagsJson JSON,
      isFeatured BOOLEAN DEFAULT TRUE,
      isBestSeller BOOLEAN DEFAULT FALSE,
      isNewArrival BOOLEAN DEFAULT TRUE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await ensureColumn("products", "specificationsJson", "JSON DEFAULT NULL");
  await ensureColumn("products", "tagsJson", "JSON DEFAULT NULL");
  await ensureColumn("products", "isBestSeller", "BOOLEAN DEFAULT FALSE");
  await ensureColumn("products", "isNewArrival", "BOOLEAN DEFAULT TRUE");

  // 2. Orders Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      orderNumber VARCHAR(50) UNIQUE NOT NULL,
      customerName VARCHAR(150) NOT NULL,
      customerEmail VARCHAR(150) NOT NULL,
      customerPhone VARCHAR(50) NOT NULL,
      customerWhatsapp VARCHAR(50),
      customerAddress TEXT NOT NULL,
      customerCity VARCHAR(100) NOT NULL,
      customerPostalCode VARCHAR(20),
      customerNotes TEXT,
      itemsJson JSON NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      shippingFee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      totalAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      paymentMethod VARCHAR(50) DEFAULT 'cash_on_delivery',
      paymentStatus VARCHAR(50) DEFAULT 'unpaid',
      orderStatus VARCHAR(50) DEFAULT 'pending',
      trackingNumber VARCHAR(100),
      adminNotes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await ensureColumn("orders", "adminNotes", "TEXT DEFAULT NULL");
  await ensureColumn("orders", "trackingNumber", "VARCHAR(100) DEFAULT NULL");

  // 3. Support Inquiries / Contact Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ticketNumber VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(150) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      whatsapp VARCHAR(50),
      email VARCHAR(150),
      category VARCHAR(100) DEFAULT 'General Support',
      budget VARCHAR(50),
      orderNumber VARCHAR(50),
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'new',
      priority VARCHAR(50) DEFAULT 'normal',
      adminReply TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await ensureColumn("inquiries", "ticketNumber", "VARCHAR(50) DEFAULT NULL");
  await ensureColumn("inquiries", "category", "VARCHAR(100) DEFAULT 'General Support'");
  await ensureColumn("inquiries", "orderNumber", "VARCHAR(50) DEFAULT NULL");
  await ensureColumn("inquiries", "whatsapp", "VARCHAR(50) DEFAULT NULL");
  await ensureColumn("inquiries", "priority", "VARCHAR(50) DEFAULT 'normal'");
  await ensureColumn("inquiries", "adminReply", "TEXT DEFAULT NULL");
  try {
    await pool.query(`ALTER TABLE inquiries MODIFY COLUMN status VARCHAR(50) DEFAULT 'new'`);
  } catch (e) {}

  // 4. Users / Admin Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      phone VARCHAR(50) DEFAULT '',
      isActive BOOLEAN DEFAULT TRUE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await ensureColumn("users", "phone", "VARCHAR(50) DEFAULT ''");
  await ensureColumn("users", "isActive", "BOOLEAN DEFAULT TRUE");

  // 5. Store Settings & Policies Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT PRIMARY KEY DEFAULT 1,
      storeName VARCHAR(150) NOT NULL DEFAULT 'EcoStore',
      storeTagline VARCHAR(255) DEFAULT 'Premium Online Store & Fast Deliveries',
      contactEmail VARCHAR(150) DEFAULT 'rayanali0560@gmail.com',
      contactPhone VARCHAR(50) DEFAULT '+92 321 3633473',
      whatsappNumber VARCHAR(50) DEFAULT '+92 321 3633473',
      shippingFee DECIMAL(10,2) DEFAULT 200.00,
      freeShippingThreshold DECIMAL(10,2) DEFAULT 3000.00,
      returnPolicyDays INT DEFAULT 7,
      returnPolicyText TEXT,
      faqsJson JSON,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // 6. Testimonials & Customer Reviews Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      city VARCHAR(150) DEFAULT 'Pakistan',
      product VARCHAR(200) DEFAULT 'General Store Review',
      rating TINYINT NOT NULL DEFAULT 5,
      message TEXT NOT NULL,
      image VARCHAR(500) DEFAULT '',
      approved BOOLEAN DEFAULT FALSE,
      featured BOOLEAN DEFAULT FALSE,
      verified BOOLEAN DEFAULT TRUE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await ensureColumn("testimonials", "city", "VARCHAR(150) DEFAULT 'Pakistan'");
  await ensureColumn("testimonials", "product", "VARCHAR(200) DEFAULT 'General Store Review'");
  await ensureColumn("testimonials", "rating", "TINYINT NOT NULL DEFAULT 5");
  await ensureColumn("testimonials", "approved", "BOOLEAN DEFAULT FALSE");
  await ensureColumn("testimonials", "featured", "BOOLEAN DEFAULT FALSE");
  await ensureColumn("testimonials", "verified", "BOOLEAN DEFAULT TRUE");
}

const DEFAULT_STORE_SETTINGS = {
  storeName: "EcoStore",
  storeTagline: "Premium Online Store & Fast Deliveries",
  contactEmail: "rayanali0560@gmail.com",
  contactPhone: "+92 321 3633473",
  whatsappNumber: "+92 321 3633473",
  shippingFee: 200,
  freeShippingThreshold: 3000,
  returnPolicyDays: 7,
  returnPolicyText:
    "We provide a 7-day hassle-free return and exchange policy on all eligible items. Products must be in original condition with tags and packaging intact. Contact our WhatsApp helpline (+92 321 3633473) with your Order ID to initiate an exchange or refund.",
  faqs: [
    {
      question: "How do I request a return or exchange?",
      answer:
        "Simply message our WhatsApp support team (+92 321 3633473) with your Order ID and photo/video of the item within 7 days of delivery.",
      category: "Returns",
    },
    {
      question: "Do you offer nationwide Cash on Delivery?",
      answer:
        "Yes! We deliver across Pakistan with Cash on Delivery (COD). You pay upon receiving your package.",
      category: "Payments",
    },
    {
      question: "How long does standard delivery take?",
      answer:
        "Orders are dispatched within 24 hours. Standard delivery across Karachi, Lahore, Islamabad, and nationwide takes 2-4 business days via TCS & Leopards.",
      category: "Delivery",
    },
    {
      question: "Who covers return shipping fees?",
      answer:
        "If you received a defective, damaged, or incorrect item, EcoStore covers 100% of return courier charges. For size exchanges, standard shipping applies.",
      category: "Returns",
    },
  ],
};

async function seedDefaultSettings() {
  if (!pool) return;
  try {
    const [rows] = await pool.query(`SELECT id FROM settings WHERE id = 1 LIMIT 1`);
    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO settings (id, storeName, storeTagline, contactEmail, contactPhone, whatsappNumber, shippingFee, freeShippingThreshold, returnPolicyDays, returnPolicyText, faqsJson)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          DEFAULT_STORE_SETTINGS.storeName,
          DEFAULT_STORE_SETTINGS.storeTagline,
          DEFAULT_STORE_SETTINGS.contactEmail,
          DEFAULT_STORE_SETTINGS.contactPhone,
          DEFAULT_STORE_SETTINGS.whatsappNumber,
          DEFAULT_STORE_SETTINGS.shippingFee,
          DEFAULT_STORE_SETTINGS.freeShippingThreshold,
          DEFAULT_STORE_SETTINGS.returnPolicyDays,
          DEFAULT_STORE_SETTINGS.returnPolicyText,
          JSON.stringify(DEFAULT_STORE_SETTINGS.faqs),
        ]
      );
      console.log("⚙️ Seeded Default Store Settings & Return Policy in MySQL");
    }
  } catch (err) {
    console.warn("seedDefaultSettings error:", err.message);
  }
}

async function seedDefaultUsers() {
  if (!pool) return;
  const adminEmails = ["rayanali0560@gmail.com", "rayanali0564@gmail.com", "admin@ecostore.com"];

  for (const email of adminEmails) {
    const [rows] = await pool.query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [email]);
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await pool.query(
        `INSERT INTO users (name, email, password, role, phone, isActive) VALUES (?, ?, ?, 'admin', '0321 3633473', TRUE)`,
        ["Rayan Ali", email, hashedPassword]
      );
      console.log(`👤 Seeded Admin in MySQL: ${email} (Password: admin123)`);
    }
  }
}

const DEFAULT_TESTIMONIALS = [
  {
    name: "Hamza Tariq",
    city: "Lahore, Punjab",
    product: "Aura Pro Wireless Headphones",
    rating: 5,
    message:
      "Ordered on Cash on Delivery. Parcel arrived via TCS in just 2 days. Sound quality, ANC, and packaging are 100% genuine and luxurious. Highly recommend EcoStore!",
    approved: true,
    featured: true,
    verified: true,
  },
  {
    name: "Zainab Malik",
    city: "Islamabad, F-10",
    product: "Apex Velocity Sneakers",
    rating: 5,
    message:
      "I was skeptical about shoe sizing, so I asked the Store AI Assistant and confirmed on WhatsApp. Support team was super friendly, and the shoes fit like a glove. 7-Day return guarantee gives real peace of mind.",
    approved: true,
    featured: true,
    verified: true,
  },
  {
    name: "Bilal Ahmed",
    city: "Karachi, DHA Phase 6",
    product: "Classic Chronograph Watch",
    rating: 5,
    message:
      "Extremely sleek build, heavy stainless steel finish, and accurate dial. The COD checkout was smooth without any upfront deposit. 5 stars for authentic quality!",
    approved: true,
    featured: true,
    verified: true,
  },
  {
    name: "Ayesha Noor",
    city: "Rawalpindi, Bahria Town",
    product: "Minimalist Italian Leather Wallet",
    rating: 5,
    message:
      "100% original full-grain leather. Very satisfied with the quick doorstep delivery and packaging quality. Definitely buying again!",
    approved: true,
    featured: true,
    verified: true,
  },
];

async function seedDefaultTestimonials() {
  if (!pool) return;
  try {
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM testimonials`);
    if (rows[0]?.total === 0) {
      for (const t of DEFAULT_TESTIMONIALS) {
        await pool.query(
          `INSERT INTO testimonials (name, city, product, rating, message, approved, featured, verified)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [t.name, t.city, t.product, t.rating, t.message, t.approved ? 1 : 0, t.featured ? 1 : 0, t.verified ? 1 : 0]
        );
      }
      console.log("⭐ Seeded Initial Verified Testimonials & Reviews in MySQL");
    }
  } catch (err) {
    console.warn("seedDefaultTestimonials error:", err.message);
  }
}

// Modern Docker / Tech studio photography catalog
const DOCKER_PRODUCTS = [
  {
    slug: "docker-tactical-anc-wireless-headphones",
    title: "Docker Edition Hybrid ANC Studio Wireless Headphones",
    category: "Audio & Headphones",
    categoryName: "Audio & Headphones",
    shortDescription: "Studio-grade 40mm neodymium drivers, active hybrid noise cancellation, and 40-hour ultra battery life.",
    description: "Built for creators, engineers, and music enthusiasts. Features custom tuned 40mm neodymium acoustic drivers, aerospace-grade matte black finish, active hybrid noise suppression, and plush memory foam cushions for all-day comfort.",
    price: 18500,
    salePrice: 14999,
    discountPercent: 19,
    stock: 25,
    rating: 4.9,
    numReviews: 48,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
    imagesJson: JSON.stringify([
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=80",
    ]),
    variantsJson: JSON.stringify([{ name: "Color", options: ["Matte Black", "Graphite Gray"] }]),
    specificationsJson: JSON.stringify([
      { title: "Driver Size", value: "40mm Dynamic Neodymium" },
      { title: "Battery Life", value: "Up to 40 Hours with ANC" },
      { title: "Connectivity", value: "Bluetooth 5.3 + 3.5mm Aux" },
      { title: "Warranty", value: "1 Year Official Replacement" },
    ]),
    tagsJson: JSON.stringify(["headphones", "audio", "anc", "wireless", "docker"]),
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
  },
  {
    slug: "stealth-chrono-316l-sapphire-watch",
    title: "Stealth Chrono 316L Sapphire Tactical Chronograph Watch",
    category: "Smart Watches",
    categoryName: "Smart Watches",
    shortDescription: "Precision Japanese quartz chronograph encased in 316L surgical stainless steel with sapphire crystal.",
    description: "Uncompromising minimalism meets industrial durability. Encased in high-grade 316L matte black steel with anti-reflective scratchproof sapphire crystal glass and 50M water resistance.",
    price: 12500,
    salePrice: 9999,
    discountPercent: 20,
    stock: 18,
    rating: 4.8,
    numReviews: 36,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80",
    imagesJson: JSON.stringify([
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200&q=80",
    ]),
    variantsJson: JSON.stringify([{ name: "Strap", options: ["Cognac Brown Leather", "Obsidian Black Silicone"] }]),
    specificationsJson: JSON.stringify([
      { title: "Case Material", value: "316L Surgical Stainless Steel" },
      { title: "Glass", value: "Scratch-Resistant Sapphire Crystal" },
      { title: "Water Resistance", value: "5 ATM / 50 Meters" },
      { title: "Movement", value: "Precision Japanese Quartz" },
    ]),
    tagsJson: JSON.stringify(["watch", "chronograph", "tactical", "docker", "luxury"]),
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
  },
  {
    slug: "apex-cyber-knit-running-shoes",
    title: "Apex Cyber-Knit Stealth Performance Running Shoes",
    category: "Footwear",
    categoryName: "Footwear",
    shortDescription: "Aerodynamic breathable engineered mesh with carbon-plate energy rebound cushioning.",
    description: "Designed for peak athletic speed and futuristic streetwear style. Dual-layer cyber-knit upper provides seamless airflow while the carbon-fiber midsole delivers explosive energy return.",
    price: 14500,
    salePrice: 11999,
    discountPercent: 17,
    stock: 30,
    rating: 4.9,
    numReviews: 52,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
    imagesJson: JSON.stringify([
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&q=80",
    ]),
    variantsJson: JSON.stringify([{ name: "Size (EU)", options: ["40", "41", "42", "43", "44", "45"] }]),
    specificationsJson: JSON.stringify([
      { title: "Sole Tech", value: "Carbon-Plate Rebound Cushioning" },
      { title: "Upper Material", value: "Engineered Cyber-Knit Breathable Mesh" },
      { title: "Weight", value: "220g (Ultra-Lightweight)" },
      { title: "Usage", value: "Road Running, Gym, Streetwear" },
    ]),
    tagsJson: JSON.stringify(["shoes", "sneakers", "running", "docker", "fitness"]),
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
  },
  {
    slug: "carbon-shield-rfid-leather-wallet",
    title: "Carbon-Shield RFID Minimalist Bifold Leather Wallet",
    category: "Fashion & Apparel",
    categoryName: "Fashion & Apparel",
    shortDescription: "Handcrafted full-grain matte leather with built-in aerospace RFID blocking lining and 8 card slots.",
    description: "Combines timeless Italian craftsmanship with high-tech security. Built-in RFID protection safeguards your contactless cards against wireless digital skimming.",
    price: 4500,
    salePrice: 3499,
    discountPercent: 22,
    stock: 45,
    rating: 4.9,
    numReviews: 64,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=1200&q=80",
    imagesJson: JSON.stringify([
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=1200&q=80",
    ]),
    variantsJson: JSON.stringify([{ name: "Color", options: ["Matte Black", "Vintage Tan"] }]),
    specificationsJson: JSON.stringify([
      { title: "Material", value: "100% Full-Grain Cowhide Leather" },
      { title: "RFID Protection", value: "13.56 MHz Frequency Shielding" },
      { title: "Capacity", value: "8 Cards + 2 Currency Slots" },
    ]),
    tagsJson: JSON.stringify(["wallet", "leather", "rfid", "docker", "accessories"]),
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
  },
  {
    slug: "cyberpack-modular-tactical-backpack",
    title: "CyberPack Modular Waterproof Tactical Tech Backpack",
    category: "Accessories",
    categoryName: "Accessories",
    shortDescription: "1000D Cordura ballistic waterproof nylon, YKK weatherproof zippers, and dedicated 16-inch laptop chamber.",
    description: "The ultimate tactical commuter backpack. Engineered with water-repellent 1000D Cordura, ergonomic breathable back padding, secret travel passport pocket, and built-in USB-C pass-through port.",
    price: 8500,
    salePrice: 6999,
    discountPercent: 18,
    stock: 20,
    rating: 4.9,
    numReviews: 29,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80",
    imagesJson: JSON.stringify([
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80",
    ]),
    variantsJson: JSON.stringify([{ name: "Color", options: ["Stealth Black", "Olive Drab"] }]),
    specificationsJson: JSON.stringify([
      { title: "Capacity", value: "28 Liters" },
      { title: "Material", value: "1000D Ballistic Waterproof Nylon" },
      { title: "Laptop Sleeve", value: "Fits up to 16-inch MacBook / Laptop" },
    ]),
    tagsJson: JSON.stringify(["backpack", "tactical", "docker", "travel", "waterproof"]),
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
  },
  {
    slug: "magvolt-100w-gan-charging-station",
    title: "MagVolt 100W GaN Industrial Fast Desktop Charging Station",
    category: "Electronics",
    categoryName: "Electronics",
    shortDescription: "Ultra-compact Gallium Nitride (GaN) fast charger with 4 ports (3x USB-C PD 3.0 + 1x USB-A QC 4.0).",
    description: "Supercharge your laptop, smartphone, tablet, and smart watch simultaneously at full speed. Advanced GaN technology runs 40% cooler with intelligent multi-protection against surges and overheating.",
    price: 7200,
    salePrice: 5799,
    discountPercent: 19,
    stock: 35,
    rating: 5.0,
    numReviews: 41,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1200&q=80",
    imagesJson: JSON.stringify([
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1200&q=80",
    ]),
    variantsJson: JSON.stringify([{ name: "Finish", options: ["Space Gray", "Matte Silver"] }]),
    specificationsJson: JSON.stringify([
      { title: "Total Power", value: "100W Max Fast Delivery" },
      { title: "Ports", value: "3x USB-C (PD 3.0) + 1x USB-A (QC 4.0)" },
      { title: "Tech", value: "Next-Gen GaN III Semiconductor" },
    ]),
    tagsJson: JSON.stringify(["charger", "gan", "tech", "docker", "gadget"]),
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
  },
];

async function seedDefaultProducts() {
  if (!pool) return;

  for (const p of DOCKER_PRODUCTS) {
    const [existing] = await pool.query(`SELECT id FROM products WHERE slug = ? LIMIT 1`, [p.slug]);
    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO products 
          (slug, title, category, categoryName, shortDescription, description, price, salePrice, discountPercent, stock, inStock, rating, numReviews, image, imagesJson, variantsJson, specificationsJson, tagsJson, isFeatured, isBestSeller, isNewArrival)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.slug,
          p.title,
          p.category,
          p.categoryName,
          p.shortDescription,
          p.description,
          p.price,
          p.salePrice,
          p.discountPercent,
          p.stock,
          p.rating,
          p.numReviews,
          p.image,
          p.imagesJson,
          p.variantsJson,
          p.specificationsJson,
          p.tagsJson,
          p.isFeatured,
          p.isBestSeller,
          p.isNewArrival,
        ]
      );
    } else {
      // Update with fresh docker-style images & details
      await pool.query(
        `UPDATE products SET 
          title = ?, category = ?, categoryName = ?, shortDescription = ?, description = ?,
          price = ?, salePrice = ?, discountPercent = ?, image = ?, imagesJson = ?,
          variantsJson = ?, specificationsJson = ?, tagsJson = ?, isFeatured = ?, isBestSeller = ?, isNewArrival = ?
         WHERE id = ?`,
        [
          p.title,
          p.category,
          p.categoryName,
          p.shortDescription,
          p.description,
          p.price,
          p.salePrice,
          p.discountPercent,
          p.image,
          p.imagesJson,
          p.variantsJson,
          p.specificationsJson,
          p.tagsJson,
          p.isFeatured,
          p.isBestSeller,
          p.isNewArrival,
          existing[0].id,
        ]
      );
    }
  }
}

// ----------------------------------------------------
// Helper: Map DB Product Row to Frontend Standard Object
// ----------------------------------------------------
function mapProductRow(r) {
  if (!r) return null;

  let images = [];
  try {
    images = typeof r.imagesJson === "string" ? JSON.parse(r.imagesJson) : r.imagesJson || [];
  } catch (e) {
    images = [r.image].filter(Boolean);
  }
  if (!images || images.length === 0) {
    images = [r.image].filter(Boolean);
  }

  let variants = [];
  try {
    const rawVariants = typeof r.variantsJson === "string" ? JSON.parse(r.variantsJson) : r.variantsJson || [];
    if (Array.isArray(rawVariants)) {
      variants = rawVariants.map((v) => {
        let opts = [];
        if (Array.isArray(v.options)) {
          opts = v.options.map(String).filter(Boolean);
        } else if (typeof v.options === "string") {
          opts = v.options.split(/[, ]+/).map((s) => s.trim()).filter(Boolean);
        } else if (v.options) {
          opts = [String(v.options)];
        }
        return {
          name: v.name || "Option",
          options: opts,
        };
      });
    }
  } catch (e) {
    variants = [];
  }

  let specifications = [];
  try {
    specifications = typeof r.specificationsJson === "string" ? JSON.parse(r.specificationsJson) : r.specificationsJson || [];
  } catch (e) {
    specifications = [];
  }

  let tags = [];
  try {
    tags = typeof r.tagsJson === "string" ? JSON.parse(r.tagsJson) : r.tagsJson || [];
  } catch (e) {
    tags = [];
  }

  return {
    ...r,
    _id: String(r.id),
    id: String(r.id),
    title: r.title,
    categoryName: r.categoryName || r.category || "General",
    category: r.category || r.categoryName || "General",
    price: Number(r.price),
    salePrice: r.salePrice ? Number(r.salePrice) : Number(r.price),
    stock: Number(r.stock),
    inStock: Boolean(r.stock > 0 && r.inStock),
    rating: Number(r.rating || 4.9),
    numReviews: Number(r.numReviews || 15),
    isFeatured: Boolean(r.isFeatured),
    isBestSeller: Boolean(r.isBestSeller),
    isNewArrival: Boolean(r.isNewArrival),
    image: images[0] || r.image || "",
    images,
    variants,
    specifications,
    tags,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

// ----------------------------------------------------
// Helper: Map DB Order Row to Frontend Standard Object
// ----------------------------------------------------
function mapOrderRow(r) {
  if (!r) return null;

  let items = [];
  try {
    items = typeof r.itemsJson === "string" ? JSON.parse(r.itemsJson) : r.itemsJson || [];
  } catch (e) {
    items = [];
  }

  return {
    _id: String(r.id),
    id: r.id,
    orderNumber: r.orderNumber,
    customer: {
      name: r.customerName || "Customer",
      email: r.customerEmail || "",
      phone: r.customerPhone || "",
      whatsapp: r.customerWhatsapp || r.customerPhone || "",
      address: r.customerAddress || "",
      city: r.customerCity || "",
      postalCode: r.customerPostalCode || "",
      notes: r.customerNotes || "",
    },
    items,
    subtotal: Number(r.subtotal || 0),
    shippingFee: Number(r.shippingFee || 0),
    discount: Number(r.discount || 0),
    totalAmount: Number(r.totalAmount || 0),
    paymentMethod: r.paymentMethod || "cash_on_delivery",
    paymentStatus: r.paymentStatus || "unpaid",
    orderStatus: r.orderStatus || "pending",
    trackingNumber: r.trackingNumber || "",
    adminNotes: r.adminNotes || "",
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

// ----------------------------------------------------
// PRODUCTS CRUD (MySQL & phpMyAdmin)
// ----------------------------------------------------

async function mysqlGetProducts(params = {}) {
  if (!pool || !isConnected) return null;
  const [rows] = await pool.query(`SELECT * FROM products ORDER BY id DESC`);
  return rows.map(mapProductRow);
}

async function mysqlGetProduct(idOrSlug) {
  if (!pool || !isConnected || !idOrSlug) return null;
  const isNumeric = /^\d+$/.test(String(idOrSlug));
  const query = isNumeric
    ? `SELECT * FROM products WHERE id = ? LIMIT 1`
    : `SELECT * FROM products WHERE slug = ? LIMIT 1`;
  const [rows] = await pool.query(query, [idOrSlug]);
  if (rows.length === 0) return null;
  return mapProductRow(rows[0]);
}

async function mysqlCreateProduct(body) {
  if (!pool || !isConnected) return null;
  const title = (body.title || "New Product").trim();
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const slug = `${baseSlug || "item"}-${randomSuffix}`;

  const categoryName = (body.categoryName || body.category || "Smart Watches").trim();
  const category = categoryName;
  const shortDescription = (body.shortDescription || title).trim();
  const description = (body.description || shortDescription).trim();
  const price = Number(body.price || 0);
  const salePrice = body.salePrice ? Number(body.salePrice) : price;
  const discountPercent = price > salePrice && price > 0 ? Math.round(((price - salePrice) / price) * 100) : 0;
  const stock = Number(body.stock !== undefined ? body.stock : 10);
  const inStock = stock > 0;
  const rating = 5.0;
  const numReviews = 1;

  let images = [];
  if (Array.isArray(body.images) && body.images.length > 0) {
    images = body.images.filter((img) => typeof img === "string" && img.trim());
  }
  if (images.length === 0 && body.imageUrl && typeof body.imageUrl === "string" && body.imageUrl.trim()) {
    images = [body.imageUrl.trim()];
  }
  if (images.length === 0 && body.image && typeof body.image === "string" && body.image.trim()) {
    images = [body.image.trim()];
  }
  if (images.length === 0) {
    images = ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80"];
  }
  const image = images[0] || "";

  const variants = Array.isArray(body.variants) ? body.variants : [];
  const specifications = Array.isArray(body.specifications) ? body.specifications : [];
  const tags = Array.isArray(body.tags) ? body.tags : [];
  const isFeatured = body.isFeatured !== undefined ? Boolean(body.isFeatured) : true;
  const isBestSeller = body.isBestSeller !== undefined ? Boolean(body.isBestSeller) : false;
  const isNewArrival = body.isNewArrival !== undefined ? Boolean(body.isNewArrival) : true;

  const [res] = await pool.query(
    `INSERT INTO products 
      (slug, title, category, categoryName, shortDescription, description, price, salePrice, discountPercent, stock, inStock, rating, numReviews, image, imagesJson, variantsJson, specificationsJson, tagsJson, isFeatured, isBestSeller, isNewArrival)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      slug,
      title,
      category,
      categoryName,
      shortDescription,
      description,
      price,
      salePrice,
      discountPercent,
      stock,
      inStock,
      rating,
      numReviews,
      image,
      JSON.stringify(images),
      JSON.stringify(variants),
      JSON.stringify(specifications),
      JSON.stringify(tags),
      isFeatured,
      isBestSeller,
      isNewArrival,
    ]
  );

  return mysqlGetProduct(res.insertId);
}

async function mysqlUpdateProduct(id, body) {
  if (!pool || !isConnected || !id) return null;
  const isNumeric = /^\d+$/.test(String(id));
  const whereClause = isNumeric ? "id = ?" : "slug = ?";

  const updates = [];
  const params = [];

  if (body.title !== undefined) {
    updates.push("title = ?");
    params.push(body.title.trim());
  }
  if (body.categoryName !== undefined || body.category !== undefined) {
    const cat = (body.categoryName || body.category).trim();
    updates.push("category = ?", "categoryName = ?");
    params.push(cat, cat);
  }
  if (body.price !== undefined) {
    const p = Number(body.price);
    updates.push("price = ?");
    params.push(p);
  }
  if (body.salePrice !== undefined) {
    const sp = body.salePrice ? Number(body.salePrice) : null;
    updates.push("salePrice = ?");
    params.push(sp);
  }
  if (body.stock !== undefined) {
    const s = Number(body.stock);
    updates.push("stock = ?", "inStock = ?");
    params.push(s, s > 0);
  }
  if (body.shortDescription !== undefined) {
    updates.push("shortDescription = ?");
    params.push(body.shortDescription.trim());
  }
  if (body.description !== undefined) {
    updates.push("description = ?");
    params.push(body.description.trim());
  }
  if (body.images !== undefined || body.image !== undefined) {
    let images = [];
    if (Array.isArray(body.images) && body.images.length > 0) {
      images = body.images.filter(Boolean);
    } else if (body.image) {
      images = [body.image];
    }
    if (images.length > 0) {
      updates.push("image = ?", "imagesJson = ?");
      params.push(images[0], JSON.stringify(images));
    }
  }
  if (body.variants !== undefined) {
    updates.push("variantsJson = ?");
    params.push(JSON.stringify(body.variants));
  }
  if (body.specifications !== undefined) {
    updates.push("specificationsJson = ?");
    params.push(JSON.stringify(body.specifications));
  }
  if (body.tags !== undefined) {
    updates.push("tagsJson = ?");
    params.push(JSON.stringify(body.tags));
  }
  if (body.isFeatured !== undefined) {
    updates.push("isFeatured = ?");
    params.push(Boolean(body.isFeatured));
  }
  if (body.isBestSeller !== undefined) {
    updates.push("isBestSeller = ?");
    params.push(Boolean(body.isBestSeller));
  }
  if (body.isNewArrival !== undefined) {
    updates.push("isNewArrival = ?");
    params.push(Boolean(body.isNewArrival));
  }

  if (updates.length > 0) {
    params.push(id);
    await pool.query(`UPDATE products SET ${updates.join(", ")} WHERE ${whereClause}`, params);
  }

  return mysqlGetProduct(id);
}

async function mysqlDeleteProduct(id) {
  if (!pool || !isConnected || !id) return false;
  const isNumeric = /^\d+$/.test(String(id));
  const whereClause = isNumeric ? "id = ?" : "slug = ?";
  const [res] = await pool.query(`DELETE FROM products WHERE ${whereClause}`, [id]);
  return res.affectedRows > 0;
}

// ----------------------------------------------------
// ORDERS CRUD (MySQL & phpMyAdmin)
// ----------------------------------------------------

async function mysqlGetAllOrders(params = {}) {
  if (!pool || !isConnected) return null;
  const { status, search } = params;
  let sql = `SELECT * FROM orders WHERE 1=1`;
  const sqlParams = [];

  if (status && status !== "all") {
    sql += ` AND orderStatus = ?`;
    sqlParams.push(status);
  }

  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    sql += ` AND (orderNumber LIKE ? OR customerName LIKE ? OR customerPhone LIKE ? OR customerCity LIKE ?)`;
    sqlParams.push(s, s, s, s);
  }

  sql += ` ORDER BY id DESC`;

  const [rows] = await pool.query(sql, sqlParams);
  return rows.map(mapOrderRow);
}

async function mysqlCreateOrder(body) {
  if (!pool || !isConnected) return null;
  const {
    customer = {},
    items = [],
    shippingFee = 0,
    discount = 0,
    paymentMethod = "cash_on_delivery",
  } = body;

  let subtotal = 0;
  const verifiedItems = items.map((it) => {
    const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
    const price = Number(it.price || 0);
    const total = price * qty;
    subtotal += total;
    return {
      product: it.product || it.id,
      title: it.title,
      price,
      quantity: qty,
      image: it.image || "",
      selectedVariant: it.selectedVariant || {},
      total,
    };
  });

  const totalAmount = Math.max(0, subtotal + Number(shippingFee) - Number(discount));
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  const orderNumber = `ORD-${dateStr}-${randomHex}`;

  const [res] = await pool.query(
    `INSERT INTO orders 
      (orderNumber, customerName, customerEmail, customerPhone, customerWhatsapp, customerAddress, customerCity, customerPostalCode, customerNotes, itemsJson, subtotal, shippingFee, discount, totalAmount, paymentMethod, orderStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      orderNumber,
      customer.name || "Customer",
      customer.email || "customer@store.com",
      customer.phone || "",
      customer.whatsapp || customer.phone || "",
      customer.address || "",
      customer.city || "",
      customer.postalCode || "",
      customer.notes || "",
      JSON.stringify(verifiedItems),
      subtotal,
      Number(shippingFee),
      Number(discount),
      totalAmount,
      paymentMethod,
    ]
  );

  return mysqlGetOrder(res.insertId);
}

async function mysqlGetOrder(idOrNumber) {
  if (!pool || !isConnected || !idOrNumber) return null;
  const isNumeric = /^\d+$/.test(String(idOrNumber));
  const query = isNumeric
    ? `SELECT * FROM orders WHERE id = ? LIMIT 1`
    : `SELECT * FROM orders WHERE orderNumber = ? LIMIT 1`;
  const [rows] = await pool.query(query, [idOrNumber]);
  if (rows.length === 0) return null;
  return mapOrderRow(rows[0]);
}

async function mysqlUpdateOrderStatus(id, body = {}) {
  if (!pool || !isConnected || !id) return null;
  const updates = [];
  const params = [];

  if (body.orderStatus !== undefined) {
    updates.push("orderStatus = ?");
    params.push(body.orderStatus);
  }
  if (body.trackingNumber !== undefined) {
    updates.push("trackingNumber = ?");
    params.push(body.trackingNumber);
  }
  if (body.paymentStatus !== undefined) {
    updates.push("paymentStatus = ?");
    params.push(body.paymentStatus);
  }
  if (body.adminNotes !== undefined) {
    updates.push("adminNotes = ?");
    params.push(body.adminNotes);
  }

  if (updates.length > 0) {
    params.push(id);
    const isNumeric = /^\d+$/.test(String(id));
    const whereClause = isNumeric ? "id = ?" : "orderNumber = ?";
    await pool.query(`UPDATE orders SET ${updates.join(", ")} WHERE ${whereClause}`, params);
  }

  return await mysqlGetOrder(id);
}

async function mysqlDeleteOrder(id) {
  if (!pool || !isConnected || !id) return false;
  const isNumeric = /^\d+$/.test(String(id));
  const whereClause = isNumeric ? "id = ?" : "orderNumber = ?";
  const [res] = await pool.query(`DELETE FROM orders WHERE ${whereClause}`, [id]);
  return res.affectedRows > 0;
}

// ----------------------------------------------------
// SUPPORT INQUIRIES & MESSAGES CRUD (MySQL)
// ----------------------------------------------------

async function mysqlGetAllInquiries(params = {}) {
  if (!pool || !isConnected) return null;
  const { status, search } = params;
  let sql = `SELECT * FROM inquiries WHERE 1=1`;
  const sqlParams = [];

  if (status && status !== "all") {
    sql += ` AND status = ?`;
    sqlParams.push(status);
  }
  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    sql += ` AND (ticketNumber LIKE ? OR name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?)`;
    sqlParams.push(s, s, s, s, s);
  }

  sql += ` ORDER BY id DESC`;
  const [rows] = await pool.query(sql, sqlParams);
  return rows.map((r) => ({
    ...r,
    _id: String(r.id),
    id: r.id,
    createdAt: r.created_at || r.createdAt,
    updatedAt: r.updated_at || r.updatedAt,
  }));
}

async function mysqlCreateInquiry(body) {
  if (!pool || !isConnected) return null;
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  const ticketNumber = `SUP-${dateStr}-${randomHex}`;

  const [res] = await pool.query(
    `INSERT INTO inquiries (ticketNumber, name, phone, whatsapp, email, category, budget, orderNumber, message, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
    [
      ticketNumber,
      body.name || "Customer",
      body.phone || "",
      body.whatsapp || body.phone || "",
      body.email || "",
      body.category || "General Support",
      body.budget || "",
      body.orderNumber || "",
      body.message || "",
    ]
  );

  return {
    _id: String(res.insertId),
    id: res.insertId,
    ticketNumber,
    ...body,
    status: "new",
    createdAt: new Date().toISOString(),
  };
}

async function mysqlGetInquiry(ticketNumber) {
  if (!pool || !isConnected || !ticketNumber) return null;
  const cleaned = String(ticketNumber).trim();
  const isNumeric = /^\d+$/.test(cleaned);
  const query = isNumeric
    ? `SELECT * FROM inquiries WHERE id = ? LIMIT 1`
    : `SELECT * FROM inquiries WHERE LOWER(ticketNumber) = LOWER(?) OR ticketNumber = ? LIMIT 1`;
  const [rows] = await pool.query(query, isNumeric ? [cleaned] : [cleaned, cleaned]);
  if (rows.length === 0) return null;
  return {
    ...rows[0],
    _id: String(rows[0].id),
    id: rows[0].id,
    createdAt: rows[0].created_at || rows[0].createdAt,
    updatedAt: rows[0].updated_at || rows[0].updatedAt,
  };
}

async function mysqlUpdateInquiry(id, body = {}) {
  if (!pool || !isConnected || !id) return null;
  const updates = [];
  const params = [];

  const targetStatus =
    body.status !== undefined
      ? body.status
      : body.adminReply
      ? "replied"
      : undefined;

  if (targetStatus !== undefined) {
    updates.push("status = ?");
    params.push(targetStatus);
  }
  if (body.adminReply !== undefined) {
    updates.push("adminReply = ?");
    params.push(body.adminReply);
  }
  if (body.priority !== undefined) {
    updates.push("priority = ?");
    params.push(body.priority);
  }

  updates.push("updated_at = NOW()");

  if (updates.length > 0) {
    params.push(id);
    const isNumeric = /^\d+$/.test(String(id));
    const whereClause = isNumeric ? "id = ?" : "ticketNumber = ?";
    await pool.query(`UPDATE inquiries SET ${updates.join(", ")} WHERE ${whereClause}`, params);
  }

  return await mysqlGetInquiry(id);
}

async function mysqlDeleteInquiry(id) {
  if (!pool || !isConnected || !id) return false;
  const isNumeric = /^\d+$/.test(String(id));
  const whereClause = isNumeric ? "id = ?" : "ticketNumber = ?";
  const [res] = await pool.query(`DELETE FROM inquiries WHERE ${whereClause}`, [id]);
  return res.affectedRows > 0;
}

// ----------------------------------------------------
// CATEGORIES (MySQL)
// ----------------------------------------------------
async function mysqlGetCategories() {
  if (!pool || !isConnected) return null;
  const [rows] = await pool.query(
    `SELECT DISTINCT categoryName as name FROM products WHERE categoryName IS NOT NULL AND categoryName != ''`
  );
  if (rows.length === 0) {
    return [
      { _id: "c-1", name: "Smart Watches", slug: "smart-watches" },
      { _id: "c-2", name: "Audio & Headphones", slug: "audio-headphones" },
      { _id: "c-3", name: "Footwear", slug: "footwear" },
      { _id: "c-4", name: "Fashion & Apparel", slug: "fashion-apparel" },
      { _id: "c-5", name: "Accessories", slug: "accessories" },
      { _id: "c-6", name: "Electronics", slug: "electronics" },
    ];
  }
  return rows.map((r, idx) => ({
    _id: `cat-${idx + 1}`,
    name: r.name,
    slug: r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  }));
}

// ----------------------------------------------------
// AUTH & DASHBOARD METHODS (MySQL)
// ----------------------------------------------------

async function mysqlAuthRegister(name, email, password, role = "admin") {
  if (!pool || !isConnected) return null;
  const cleanEmail = String(email).toLowerCase().trim();

  const [existing] = await pool.query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [cleanEmail]);
  if (existing.length > 0) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [res] = await pool.query(
    `INSERT INTO users (name, email, password, role, phone, isActive) VALUES (?, ?, ?, ?, '', TRUE)`,
    [name.trim(), cleanEmail, hashedPassword, role]
  );

  const user = {
    id: String(res.insertId),
    _id: String(res.insertId),
    name: name.trim(),
    email: cleanEmail,
    role,
  };

  const token = jwt.sign(user, JWT_SECRET, { expiresIn: "30d" });
  return { user, token };
}

async function mysqlAuthLogin(email, password) {
  if (!pool || !isConnected) return null;
  const cleanEmail = String(email).toLowerCase().trim();

  const [rows] = await pool.query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [cleanEmail]);
  if (rows.length === 0) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const userRow = rows[0];
  const isMatch = await bcrypt.compare(password, userRow.password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const user = {
    id: String(userRow.id),
    _id: String(userRow.id),
    name: userRow.name,
    email: userRow.email,
    role: userRow.role || "admin",
  };

  const token = jwt.sign(user, JWT_SECRET, { expiresIn: "30d" });
  return { user, token };
}

async function mysqlGetUserById(id) {
  if (!pool || !isConnected || !id) return null;
  const [rows] = await pool.query(`SELECT id, name, email, role, isActive FROM users WHERE id = ? LIMIT 1`, [id]);
  if (rows.length === 0) return null;
  return {
    ...rows[0],
    _id: String(rows[0].id),
    id: String(rows[0].id),
    isActive: Boolean(rows[0].isActive),
  };
}

async function mysqlGetDashboardStats() {
  if (!pool || !isConnected) return null;

  const [[prodCount]] = await pool.query(`SELECT COUNT(*) as count FROM products`);
  const [[orderCount]] = await pool.query(`SELECT COUNT(*) as count FROM orders`);
  const [[pendingCount]] = await pool.query(`SELECT COUNT(*) as count FROM orders WHERE orderStatus = 'pending'`);
  const [[revenueSum]] = await pool.query(`SELECT COALESCE(SUM(totalAmount), 0) as total FROM orders`);
  const [[inqCount]] = await pool.query(`SELECT COUNT(*) as count FROM inquiries`);
  const [[unreadInq]] = await pool.query(`SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'`);

  const [recentOrdersRows] = await pool.query(`SELECT * FROM orders ORDER BY id DESC LIMIT 5`);
  const [recentProductsRows] = await pool.query(`SELECT * FROM products ORDER BY id DESC LIMIT 5`);
  const [recentInquiriesRows] = await pool.query(`SELECT * FROM inquiries ORDER BY id DESC LIMIT 5`);

  const recentOrders = recentOrdersRows.map(mapOrderRow);
  const recentProducts = recentProductsRows.map(mapProductRow);

  return {
    success: true,
    stats: {
      totalProducts: prodCount.count,
      totalOrders: orderCount.count,
      pendingOrders: pendingCount.count,
      totalRevenue: Number(revenueSum.total),
      totalInquiries: inqCount.count,
      unreadInquiries: unreadInq.count,
      totalCustomers: Math.max(1, orderCount.count),
      lowStockProducts: 0,
    },
    recentOrders,
    recentProducts,
    recentInquiries: recentInquiriesRows.map((r) => ({ ...r, _id: String(r.id), id: r.id })),
  };
}

// ----------------------------------------------------
// STORE SETTINGS & RETURN POLICY (MySQL)
// ----------------------------------------------------
async function mysqlGetSettings() {
  if (!pool || !isConnected) return DEFAULT_STORE_SETTINGS;
  try {
    const [rows] = await pool.query(`SELECT * FROM settings WHERE id = 1 LIMIT 1`);
    if (rows.length === 0) {
      await seedDefaultSettings();
      return DEFAULT_STORE_SETTINGS;
    }
    const r = rows[0];
    let faqs = [];
    try {
      faqs = typeof r.faqsJson === "string" ? JSON.parse(r.faqsJson) : (r.faqsJson || []);
    } catch (e) {
      faqs = DEFAULT_STORE_SETTINGS.faqs;
    }
    return {
      storeName: r.storeName || DEFAULT_STORE_SETTINGS.storeName,
      storeTagline: r.storeTagline || DEFAULT_STORE_SETTINGS.storeTagline,
      contactEmail: r.contactEmail || DEFAULT_STORE_SETTINGS.contactEmail,
      contactPhone: r.contactPhone || DEFAULT_STORE_SETTINGS.contactPhone,
      whatsappNumber: r.whatsappNumber || DEFAULT_STORE_SETTINGS.whatsappNumber,
      shippingFee: Number(r.shippingFee !== null ? r.shippingFee : 200),
      freeShippingThreshold: Number(r.freeShippingThreshold !== null ? r.freeShippingThreshold : 3000),
      returnPolicyDays: Number(r.returnPolicyDays !== null ? r.returnPolicyDays : 7),
      returnPolicyText: r.returnPolicyText || DEFAULT_STORE_SETTINGS.returnPolicyText,
      faqs: Array.isArray(faqs) && faqs.length > 0 ? faqs : DEFAULT_STORE_SETTINGS.faqs,
      updatedAt: r.updatedAt,
    };
  } catch (err) {
    console.warn("mysqlGetSettings error:", err.message);
    return DEFAULT_STORE_SETTINGS;
  }
}

async function mysqlUpdateSettings(body = {}) {
  if (!pool || !isConnected) return DEFAULT_STORE_SETTINGS;
  const current = await mysqlGetSettings();
  const updated = {
    storeName: body.storeName !== undefined ? body.storeName.trim() : current.storeName,
    storeTagline: body.storeTagline !== undefined ? body.storeTagline.trim() : current.storeTagline,
    contactEmail: body.contactEmail !== undefined ? body.contactEmail.trim() : current.contactEmail,
    contactPhone: body.contactPhone !== undefined ? body.contactPhone.trim() : current.contactPhone,
    whatsappNumber: body.whatsappNumber !== undefined ? body.whatsappNumber.trim() : current.whatsappNumber,
    shippingFee: body.shippingFee !== undefined ? Number(body.shippingFee) : current.shippingFee,
    freeShippingThreshold: body.freeShippingThreshold !== undefined ? Number(body.freeShippingThreshold) : current.freeShippingThreshold,
    returnPolicyDays: body.returnPolicyDays !== undefined ? Number(body.returnPolicyDays) : current.returnPolicyDays,
    returnPolicyText: body.returnPolicyText !== undefined ? body.returnPolicyText.trim() : current.returnPolicyText,
    faqs: Array.isArray(body.faqs) ? body.faqs : current.faqs,
  };

  await pool.query(
    `INSERT INTO settings (id, storeName, storeTagline, contactEmail, contactPhone, whatsappNumber, shippingFee, freeShippingThreshold, returnPolicyDays, returnPolicyText, faqsJson)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      storeName = VALUES(storeName),
      storeTagline = VALUES(storeTagline),
      contactEmail = VALUES(contactEmail),
      contactPhone = VALUES(contactPhone),
      whatsappNumber = VALUES(whatsappNumber),
      shippingFee = VALUES(shippingFee),
      freeShippingThreshold = VALUES(freeShippingThreshold),
      returnPolicyDays = VALUES(returnPolicyDays),
      returnPolicyText = VALUES(returnPolicyText),
      faqsJson = VALUES(faqsJson)`,
    [
      updated.storeName,
      updated.storeTagline,
      updated.contactEmail,
      updated.contactPhone,
      updated.whatsappNumber,
      updated.shippingFee,
      updated.freeShippingThreshold,
      updated.returnPolicyDays,
      updated.returnPolicyText,
      JSON.stringify(updated.faqs),
    ]
  );

  return updated;
}

// ========================================
// TESTIMONIALS & REVIEWS CRUD (MySQL / phpMyAdmin)
// ========================================

async function mysqlGetAllTestimonials(query = {}) {
  if (!pool || !isConnected) return DEFAULT_TESTIMONIALS;
  try {
    let sql = `SELECT * FROM testimonials`;
    const params = [];
    const conditions = [];

    if (query.approved !== undefined) {
      conditions.push(`approved = ?`);
      params.push(query.approved === "true" || query.approved === true ? 1 : 0);
    }
    if (query.featured !== undefined) {
      conditions.push(`featured = ?`);
      params.push(query.featured === "true" || query.featured === true ? 1 : 0);
    }
    if (query.status === "pending") {
      conditions.push(`approved = 0`);
    } else if (query.status === "approved") {
      conditions.push(`approved = 1`);
    }

    if (query.search && query.search.trim()) {
      conditions.push(`(name LIKE ? OR message LIKE ? OR product LIKE ? OR city LIKE ?)`);
      const term = `%${query.search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(" AND ");
    }

    sql += ` ORDER BY featured DESC, id DESC`;

    const [rows] = await pool.query(sql, params);
    return rows.map((r) => ({
      ...r,
      approved: Boolean(r.approved),
      featured: Boolean(r.featured),
      verified: Boolean(r.verified),
      createdAt: r.createdAt || r.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error("mysqlGetAllTestimonials error:", err.message);
    return DEFAULT_TESTIMONIALS;
  }
}

async function mysqlGetPublicTestimonials(query = {}) {
  if (!pool || !isConnected) return DEFAULT_TESTIMONIALS.filter((t) => t.approved);
  try {
    let sql = `SELECT * FROM testimonials WHERE approved = 1`;
    const params = [];

    if (query.featured === "true" || query.featured === true) {
      sql += ` AND featured = 1`;
    }

    if (query.product && query.product.trim()) {
      sql += ` AND product LIKE ?`;
      params.push(`%${query.product.trim()}%`);
    }

    sql += ` ORDER BY featured DESC, id DESC LIMIT 50`;

    const [rows] = await pool.query(sql, params);
    if (rows.length === 0) {
      await seedDefaultTestimonials();
      const [seededRows] = await pool.query(sql, params);
      return seededRows.map((r) => ({
        ...r,
        approved: true,
        featured: Boolean(r.featured),
        verified: Boolean(r.verified),
        createdAt: r.createdAt || r.created_at || new Date().toISOString(),
      }));
    }
    return rows.map((r) => ({
      ...r,
      approved: true,
      featured: Boolean(r.featured),
      verified: Boolean(r.verified),
      createdAt: r.createdAt || r.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error("mysqlGetPublicTestimonials error:", err.message);
    return DEFAULT_TESTIMONIALS;
  }
}

async function mysqlCreateTestimonial(data = {}, isAdmin = false) {
  if (!pool || !isConnected) return null;
  const name = (data.name || "").trim() || "Customer";
  const city = (data.city || data.designation || data.role || "").trim() || "Pakistan";
  const product = (data.product || data.projectName || data.project || "").trim() || "EcoStore Product";
  const rating = Math.min(5, Math.max(1, Number(data.rating) || 5));
  const message = (data.message || "").trim();
  const image = (data.image || "").trim();

  const approved = isAdmin ? (data.approved !== undefined ? Boolean(data.approved) : true) : false;
  const featured = isAdmin ? Boolean(data.featured) : false;
  const verified = isAdmin ? (data.verified !== undefined ? Boolean(data.verified) : true) : true;

  if (!message) {
    throw new Error("Review message is required");
  }

  const [result] = await pool.query(
    `INSERT INTO testimonials (name, city, product, rating, message, image, approved, featured, verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, city, product, rating, message, image, approved ? 1 : 0, featured ? 1 : 0, verified ? 1 : 0]
  );

  return {
    id: result.insertId,
    name,
    city,
    product,
    rating,
    message,
    image,
    approved,
    featured,
    verified,
    createdAt: new Date().toISOString(),
  };
}

async function mysqlUpdateTestimonial(id, data = {}) {
  if (!pool || !isConnected) return null;
  const [rows] = await pool.query(`SELECT * FROM testimonials WHERE id = ? LIMIT 1`, [id]);
  if (rows.length === 0) return null;

  const current = rows[0];
  const name = data.name !== undefined ? data.name.trim() : current.name;
  const city = data.city !== undefined ? data.city.trim() : (data.designation !== undefined ? data.designation.trim() : current.city);
  const product = data.product !== undefined ? data.product.trim() : (data.projectName !== undefined ? data.projectName.trim() : (data.project !== undefined ? data.project.trim() : current.product));
  const rating = data.rating !== undefined ? Math.min(5, Math.max(1, Number(data.rating))) : current.rating;
  const message = data.message !== undefined ? data.message.trim() : current.message;
  const image = data.image !== undefined ? data.image.trim() : current.image;
  const approved = data.approved !== undefined ? (Boolean(data.approved) ? 1 : 0) : current.approved;
  const featured = data.featured !== undefined ? (Boolean(data.featured) ? 1 : 0) : current.featured;
  const verified = data.verified !== undefined ? (Boolean(data.verified) ? 1 : 0) : current.verified;

  await pool.query(
    `UPDATE testimonials SET name = ?, city = ?, product = ?, rating = ?, message = ?, image = ?, approved = ?, featured = ?, verified = ? WHERE id = ?`,
    [name, city, product, rating, message, image, approved, featured, verified, id]
  );

  return {
    id: Number(id),
    name,
    city,
    product,
    rating,
    message,
    image,
    approved: Boolean(approved),
    featured: Boolean(featured),
    verified: Boolean(verified),
  };
}

async function mysqlToggleTestimonialStatus(id, field = "approved") {
  if (!pool || !isConnected) return null;
  const allowed = ["approved", "featured", "verified"];
  if (!allowed.includes(field)) field = "approved";

  await pool.query(`UPDATE testimonials SET ${field} = NOT ${field} WHERE id = ?`, [id]);
  const [rows] = await pool.query(`SELECT * FROM testimonials WHERE id = ? LIMIT 1`, [id]);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r,
    approved: Boolean(r.approved),
    featured: Boolean(r.featured),
    verified: Boolean(r.verified),
  };
}

async function mysqlDeleteTestimonial(id) {
  if (!pool || !isConnected) return false;
  const [result] = await pool.query(`DELETE FROM testimonials WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

module.exports = {
  initMySQL,
  isMySQLConnected: () => isConnected,
  mysqlGetProducts,
  mysqlGetProduct,
  mysqlCreateProduct,
  mysqlUpdateProduct,
  mysqlDeleteProduct,
  mysqlGetAllOrders,
  mysqlCreateOrder,
  mysqlGetOrder,
  mysqlUpdateOrderStatus,
  mysqlDeleteOrder,
  mysqlGetAllInquiries,
  mysqlCreateInquiry,
  mysqlGetInquiry,
  mysqlUpdateInquiry,
  mysqlDeleteInquiry,
  mysqlGetCategories,
  mysqlGetSettings,
  mysqlUpdateSettings,
  mysqlGetAllTestimonials,
  mysqlGetPublicTestimonials,
  mysqlCreateTestimonial,
  mysqlUpdateTestimonial,
  mysqlToggleTestimonialStatus,
  mysqlDeleteTestimonial,
  mysqlAuthRegister,
  mysqlAuthLogin,
  mysqlGetUserById,
  mysqlGetDashboardStats,
};
