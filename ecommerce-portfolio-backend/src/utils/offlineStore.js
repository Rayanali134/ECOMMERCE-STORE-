const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const DATA_DIR = path.join(__dirname, "../../data");
const PRODUCTS_FILE = path.join(DATA_DIR, "offline_products.json");
const ORDERS_FILE = path.join(DATA_DIR, "offline_orders.json");
const INQUIRIES_FILE = path.join(DATA_DIR, "offline_inquiries.json");

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(file, fallback = []) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    }
  } catch (err) {
    console.error("Read JSON Error:", err.message);
  }
  return fallback;
}

function writeJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Write JSON Error:", err.message);
  }
}

// Built-in modern docker-style catalog
const DEFAULT_OFFLINE_PRODUCTS = [
  {
    _id: "prod-1",
    id: "prod-1",
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
    inStock: true,
    rating: 4.9,
    numReviews: 48,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&q=80",
    ],
    variants: [{ name: "Color", options: ["Matte Black", "Graphite Gray"] }],
    specifications: [
      { title: "Driver Size", value: "40mm Dynamic Neodymium" },
      { title: "Battery Life", value: "Up to 40 Hours with ANC" },
      { title: "Connectivity", value: "Bluetooth 5.3 + 3.5mm Aux" },
      { title: "Warranty", value: "1 Year Official Replacement" },
    ],
    tags: ["headphones", "audio", "anc", "wireless", "docker"],
  },
  {
    _id: "prod-2",
    id: "prod-2",
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
    inStock: true,
    rating: 4.8,
    numReviews: 36,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200&q=80",
    ],
    variants: [{ name: "Strap", options: ["Cognac Brown Leather", "Obsidian Black Silicone"] }],
    specifications: [
      { title: "Case Material", value: "316L Surgical Stainless Steel" },
      { title: "Glass", value: "Scratch-Resistant Sapphire Crystal" },
      { title: "Water Resistance", value: "5 ATM / 50 Meters" },
    ],
    tags: ["watch", "chronograph", "tactical", "docker", "luxury"],
  },
  {
    _id: "prod-3",
    id: "prod-3",
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
    inStock: true,
    rating: 4.9,
    numReviews: 52,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&q=80",
    ],
    variants: [{ name: "Size (EU)", options: ["40", "41", "42", "43", "44", "45"] }],
    specifications: [
      { title: "Sole Tech", value: "Carbon-Plate Rebound Cushioning" },
      { title: "Upper Material", value: "Engineered Cyber-Knit Breathable Mesh" },
    ],
    tags: ["shoes", "sneakers", "running", "docker", "fitness"],
  },
  {
    _id: "prod-4",
    id: "prod-4",
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
    inStock: true,
    rating: 4.9,
    numReviews: 64,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=1200&q=80",
    ],
    variants: [{ name: "Color", options: ["Matte Black", "Vintage Tan"] }],
    specifications: [
      { title: "Material", value: "100% Full-Grain Cowhide Leather" },
      { title: "Capacity", value: "8 Cards + 2 Currency Slots" },
    ],
    tags: ["wallet", "leather", "rfid", "docker", "accessories"],
  },
  {
    _id: "prod-5",
    id: "prod-5",
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
    inStock: true,
    rating: 4.9,
    numReviews: 29,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80",
    ],
    variants: [{ name: "Color", options: ["Stealth Black", "Olive Drab"] }],
    specifications: [
      { title: "Capacity", value: "28 Liters" },
      { title: "Material", value: "1000D Ballistic Waterproof Nylon" },
    ],
    tags: ["backpack", "tactical", "docker", "travel", "waterproof"],
  },
  {
    _id: "prod-6",
    id: "prod-6",
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
    inStock: true,
    rating: 5.0,
    numReviews: 41,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1200&q=80",
    ],
    variants: [{ name: "Finish", options: ["Space Gray", "Matte Silver"] }],
    specifications: [
      { title: "Total Power", value: "100W Max Fast Delivery" },
      { title: "Ports", value: "3x USB-C (PD 3.0) + 1x USB-A (QC 4.0)" },
    ],
    tags: ["charger", "gan", "tech", "docker", "gadget"],
  },
];

// Initialize offline products file if empty
if (!fs.existsSync(PRODUCTS_FILE)) {
  writeJson(PRODUCTS_FILE, DEFAULT_OFFLINE_PRODUCTS);
}

// ----------------------------------------------------
// PRODUCT METHODS
// ----------------------------------------------------
function getOfflineProducts() {
  const prods = readJson(PRODUCTS_FILE, DEFAULT_OFFLINE_PRODUCTS);
  return prods.length > 0 ? prods : DEFAULT_OFFLINE_PRODUCTS;
}

function getOfflineProductById(idOrSlug) {
  if (!idOrSlug) return null;
  const s = String(idOrSlug).toLowerCase().trim();
  const list = getOfflineProducts();
  return (
    list.find(
      (p) =>
        p._id === s ||
        p.id === s ||
        p.slug.toLowerCase() === s ||
        p.title.toLowerCase().includes(s)
    ) || list[0]
  );
}

function createOfflineProduct(body) {
  const list = getOfflineProducts();
  const title = (body.title || "New Product").trim();
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const slug = `${baseSlug || "item"}-${randomSuffix}`;
  const id = "off-prod-" + Date.now();

  const price = Number(body.price || 0);
  const salePrice = body.salePrice ? Number(body.salePrice) : price;
  const discountPercent = price > salePrice && price > 0 ? Math.round(((price - salePrice) / price) * 100) : 0;
  const stock = Number(body.stock !== undefined ? body.stock : 10);

  const images = Array.isArray(body.images) && body.images.length > 0
    ? body.images.filter(Boolean)
    : [body.imageUrl || body.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80"];

  const newProd = {
    _id: id,
    id,
    slug,
    title,
    categoryName: body.categoryName || body.category || "Smart Watches",
    category: body.category || body.categoryName || "Smart Watches",
    shortDescription: (body.shortDescription || title).trim(),
    description: (body.description || title).trim(),
    price,
    salePrice,
    discountPercent,
    stock,
    inStock: stock > 0,
    rating: 5.0,
    numReviews: 1,
    image: images[0],
    images,
    variants: Array.isArray(body.variants) ? body.variants : [],
    specifications: Array.isArray(body.specifications) ? body.specifications : [],
    tags: Array.isArray(body.tags) ? body.tags : [],
    isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : true,
    isBestSeller: body.isBestSeller !== undefined ? Boolean(body.isBestSeller) : false,
    isNewArrival: body.isNewArrival !== undefined ? Boolean(body.isNewArrival) : true,
    createdAt: new Date().toISOString(),
  };

  list.unshift(newProd);
  writeJson(PRODUCTS_FILE, list);
  return newProd;
}

function updateOfflineProduct(id, body) {
  const list = getOfflineProducts();
  const idx = list.findIndex((p) => p._id === id || p.id === id || p.slug === id);
  if (idx === -1) return null;

  const current = list[idx];
  const price = body.price !== undefined ? Number(body.price) : current.price;
  const salePrice = body.salePrice !== undefined ? (body.salePrice ? Number(body.salePrice) : price) : current.salePrice;
  const stock = body.stock !== undefined ? Number(body.stock) : current.stock;

  let images = current.images;
  if (Array.isArray(body.images) && body.images.length > 0) {
    images = body.images.filter(Boolean);
  } else if (body.imageUrl || body.image) {
    images = [body.imageUrl || body.image];
  }

  const updated = {
    ...current,
    title: body.title !== undefined ? body.title.trim() : current.title,
    categoryName: body.categoryName || body.category || current.categoryName,
    category: body.category || body.categoryName || current.category,
    shortDescription: body.shortDescription !== undefined ? body.shortDescription.trim() : current.shortDescription,
    description: body.description !== undefined ? body.description.trim() : current.description,
    price,
    salePrice,
    stock,
    inStock: stock > 0,
    image: images[0] || current.image,
    images,
    variants: body.variants !== undefined ? body.variants : current.variants,
    specifications: body.specifications !== undefined ? body.specifications : current.specifications,
    tags: body.tags !== undefined ? body.tags : current.tags,
    isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : current.isFeatured,
    isBestSeller: body.isBestSeller !== undefined ? Boolean(body.isBestSeller) : current.isBestSeller,
    isNewArrival: body.isNewArrival !== undefined ? Boolean(body.isNewArrival) : current.isNewArrival,
    updatedAt: new Date().toISOString(),
  };

  list[idx] = updated;
  writeJson(PRODUCTS_FILE, list);
  return updated;
}

function deleteOfflineProduct(id) {
  const list = getOfflineProducts();
  const filtered = list.filter((p) => p._id !== id && p.id !== id && p.slug !== id);
  writeJson(PRODUCTS_FILE, filtered);
  return filtered.length < list.length;
}

// ----------------------------------------------------
// ORDER METHODS
// ----------------------------------------------------
function getOfflineOrders(params = {}) {
  const orders = readJson(ORDERS_FILE, []);
  let filtered = [...orders];

  if (params.status && params.status !== "all") {
    filtered = filtered.filter((o) => (o.orderStatus || "pending").toLowerCase() === params.status.toLowerCase());
  }

  if (params.search && params.search.trim()) {
    const s = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (o) =>
        (o.orderNumber || "").toLowerCase().includes(s) ||
        (o.customer?.name || "").toLowerCase().includes(s) ||
        (o.customer?.phone || "").toLowerCase().includes(s) ||
        (o.customer?.city || "").toLowerCase().includes(s)
    );
  }

  return filtered;
}

function createOfflineOrder(body) {
  const { customer, items, shippingFee = 0, discount = 0, paymentMethod = "cash_on_delivery" } = body;
  const orders = readJson(ORDERS_FILE, []);

  let subtotal = 0;
  const verifiedItems = (items || []).map((item) => {
    const p = getOfflineProductById(item.product || item.id || item.slug) || DEFAULT_OFFLINE_PRODUCTS[0];
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    const price = Number(item.price || p.salePrice || p.price);
    const total = price * qty;
    subtotal += total;
    return {
      product: p._id,
      title: item.title || p.title,
      image: item.image || p.images[0],
      price,
      quantity: qty,
      selectedVariant: item.selectedVariant || {},
      total,
    };
  });

  const totalAmount = Math.max(0, subtotal + Number(shippingFee) - Number(discount));
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  const orderNumber = `ORD-${dateStr}-${randomHex}`;

  const newOrder = {
    _id: "off-ord-" + Date.now(),
    id: "off-ord-" + Date.now(),
    orderNumber,
    customer: {
      name: (customer?.name || "Customer").trim(),
      email: (customer?.email || "customer@store.com").trim(),
      phone: (customer?.phone || "0321 3633473").trim(),
      whatsapp: (customer?.whatsapp || customer?.phone || "0321 3633473").trim(),
      address: (customer?.address || "Delivery Address").trim(),
      city: (customer?.city || "Lahore").trim(),
      postalCode: customer?.postalCode || "",
      notes: customer?.notes || "",
    },
    items: verifiedItems,
    subtotal,
    shippingFee: Number(shippingFee),
    discount: Number(discount),
    totalAmount,
    paymentMethod,
    paymentStatus: "unpaid",
    orderStatus: "pending",
    trackingNumber: "",
    createdAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);
  writeJson(ORDERS_FILE, orders.slice(0, 100));
  return newOrder;
}

function getOfflineOrder(idOrNumber) {
  if (!idOrNumber) return null;
  const s = String(idOrNumber).trim().toUpperCase();
  const orders = readJson(ORDERS_FILE, []);
  const found = orders.find((o) => o.orderNumber.toUpperCase() === s || o._id === idOrNumber || o.id === idOrNumber);
  if (found) return found;

  if (s.startsWith("ORD-")) {
    return {
      _id: "ord-demo",
      orderNumber: s,
      orderStatus: "pending",
      createdAt: new Date().toISOString(),
      customer: {
        name: "Valued Customer",
        phone: "+92 321 3633473",
        address: "Gulberg / Clifton",
        city: "Pakistan",
      },
      totalAmount: 14999,
      items: [
        {
          title: "Docker Edition Hybrid ANC Studio Wireless Headphones",
          quantity: 1,
          price: 14999,
          total: 14999,
        },
      ],
    };
  }
  return null;
}

function updateOfflineOrderStatus(id, body = {}) {
  const orders = readJson(ORDERS_FILE, []);
  const idx = orders.findIndex((o) => o._id === id || o.id === id || o.orderNumber === id);
  if (idx === -1) return null;

  if (body.orderStatus !== undefined) orders[idx].orderStatus = body.orderStatus;
  if (body.trackingNumber !== undefined) orders[idx].trackingNumber = body.trackingNumber;
  if (body.paymentStatus !== undefined) orders[idx].paymentStatus = body.paymentStatus;
  orders[idx].updatedAt = new Date().toISOString();

  writeJson(ORDERS_FILE, orders);
  return orders[idx];
}

function deleteOfflineOrder(id) {
  const orders = readJson(ORDERS_FILE, []);
  const filtered = orders.filter((o) => o._id !== id && o.id !== id && o.orderNumber !== id);
  writeJson(ORDERS_FILE, filtered);
  return filtered.length < orders.length;
}

// ----------------------------------------------------
// INQUIRY METHODS
// ----------------------------------------------------
function getOfflineInquiries(params = {}) {
  const inquiries = readJson(INQUIRIES_FILE, []);
  let filtered = [...inquiries];

  if (params.status && params.status !== "all") {
    filtered = filtered.filter((i) => (i.status || "new").toLowerCase() === params.status.toLowerCase());
  }

  return filtered;
}

function createOfflineInquiry(body) {
  const inquiries = readJson(INQUIRIES_FILE, []);
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  const ticketNumber = `SUP-${dateStr}-${randomHex}`;

  const newInquiry = {
    _id: "off-inq-" + Date.now(),
    id: "off-inq-" + Date.now(),
    ticketNumber,
    name: body.name || "Customer",
    phone: body.phone || "+92 321 3633473",
    whatsapp: body.whatsapp || body.phone || "+92 321 3633473",
    email: body.email || "",
    category: body.category || "General Support",
    budget: body.budget || "",
    orderNumber: body.orderNumber || "",
    message: body.message || "",
    status: "new",
    priority: "normal",
    adminReply: "",
    createdAt: new Date().toISOString(),
  };

  inquiries.unshift(newInquiry);
  writeJson(INQUIRIES_FILE, inquiries.slice(0, 100));
  return newInquiry;
}

function getOfflineInquiry(ticketNumber) {
  if (!ticketNumber) return null;
  const s = String(ticketNumber).trim().toUpperCase();
  const inquiries = readJson(INQUIRIES_FILE, []);
  return inquiries.find((i) => i.ticketNumber.toUpperCase() === s || i._id === ticketNumber) || null;
}

function updateOfflineInquiry(id, body = {}) {
  const inquiries = readJson(INQUIRIES_FILE, []);
  const idx = inquiries.findIndex((i) => i._id === id || i.id === id || i.ticketNumber === id);
  if (idx === -1) return null;

  if (body.status !== undefined) inquiries[idx].status = body.status;
  if (body.adminReply !== undefined) inquiries[idx].adminReply = body.adminReply;
  if (body.priority !== undefined) inquiries[idx].priority = body.priority;
  inquiries[idx].updatedAt = new Date().toISOString();

  writeJson(INQUIRIES_FILE, inquiries);
  return inquiries[idx];
}

function deleteOfflineInquiry(id) {
  const inquiries = readJson(INQUIRIES_FILE, []);
  const filtered = inquiries.filter((i) => i._id !== id && i.id !== id && i.ticketNumber !== id);
  writeJson(INQUIRIES_FILE, filtered);
  return filtered.length < inquiries.length;
}

const SETTINGS_FILE = path.join(DATA_DIR, "offline_settings.json");

const DEFAULT_OFFLINE_SETTINGS = {
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

function getOfflineSettings() {
  return readJson(SETTINGS_FILE, DEFAULT_OFFLINE_SETTINGS);
}

function updateOfflineSettings(body = {}) {
  const current = getOfflineSettings();
  const updated = {
    ...current,
    ...body,
    shippingFee: body.shippingFee !== undefined ? Number(body.shippingFee) : current.shippingFee,
    freeShippingThreshold: body.freeShippingThreshold !== undefined ? Number(body.freeShippingThreshold) : current.freeShippingThreshold,
    returnPolicyDays: body.returnPolicyDays !== undefined ? Number(body.returnPolicyDays) : current.returnPolicyDays,
    updatedAt: new Date().toISOString(),
  };
  writeJson(SETTINGS_FILE, updated);
  return updated;
}

function getOfflineAuth(email) {
  const secret = process.env.JWT_SECRET || "ecommerce_secret_key_123456";
  const user = {
    id: "admin-offline-id",
    _id: "admin-offline-id",
    name: "Rayan Ali",
    email: email || "rayanali0560@gmail.com",
    role: "admin",
  };
  const token = jwt.sign(user, secret, { expiresIn: "30d" });
  return { user, token };
}

const DEFAULT_OFFLINE_TESTIMONIALS = [
  {
    id: 1,
    name: "Hamza Tariq",
    city: "Lahore, Punjab",
    product: "Aura Pro Wireless Headphones",
    rating: 5,
    message: "Ordered on Cash on Delivery. Parcel arrived via TCS in just 2 days. Sound quality, ANC, and packaging are 100% genuine and luxurious. Highly recommend EcoStore!",
    approved: true,
    featured: true,
    verified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Zainab Malik",
    city: "Islamabad, F-10",
    product: "Apex Velocity Sneakers",
    rating: 5,
    message: "I was skeptical about shoe sizing, so I asked the Store AI Assistant and confirmed on WhatsApp. Support team was super friendly, and the shoes fit like a glove. 7-Day return guarantee gives real peace of mind.",
    approved: true,
    featured: true,
    verified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Bilal Ahmed",
    city: "Karachi, DHA Phase 6",
    product: "Classic Chronograph Watch",
    rating: 5,
    message: "Extremely sleek build, heavy stainless steel finish, and accurate dial. The COD checkout was smooth without any upfront deposit. 5 stars for authentic quality!",
    approved: true,
    featured: true,
    verified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Ayesha Noor",
    city: "Rawalpindi, Bahria Town",
    product: "Minimalist Italian Leather Wallet",
    rating: 5,
    message: "100% original full-grain leather. Very satisfied with the quick doorstep delivery and packaging quality. Definitely buying again!",
    approved: true,
    featured: true,
    verified: true,
    createdAt: new Date().toISOString(),
  },
];

const TESTIMONIALS_FILE = path.join(DATA_DIR, "testimonials.json");

function getOfflineTestimonials(publicOnly = false) {
  const list = readJson(TESTIMONIALS_FILE, DEFAULT_OFFLINE_TESTIMONIALS);
  if (publicOnly) {
    return list.filter((t) => t.approved);
  }
  return list;
}

function createOfflineTestimonial(data = {}, isAdmin = false) {
  const list = getOfflineTestimonials(false);
  const newItem = {
    id: Date.now(),
    name: (data.name || "").trim() || "Customer",
    city: (data.city || data.designation || "").trim() || "Pakistan",
    product: (data.product || data.projectName || "").trim() || "EcoStore Product",
    rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
    message: (data.message || "").trim(),
    image: (data.image || "").trim(),
    approved: isAdmin ? Boolean(data.approved ?? true) : false,
    featured: isAdmin ? Boolean(data.featured) : false,
    verified: isAdmin ? Boolean(data.verified ?? true) : true,
    createdAt: new Date().toISOString(),
  };
  list.unshift(newItem);
  writeJson(TESTIMONIALS_FILE, list);
  return newItem;
}

function updateOfflineTestimonial(id, body = {}) {
  const list = getOfflineTestimonials(false);
  const idx = list.findIndex((t) => String(t.id) === String(id));
  if (idx === -1) return null;
  list[idx] = {
    ...list[idx],
    ...body,
    rating: body.rating !== undefined ? Number(body.rating) : list[idx].rating,
    approved: body.approved !== undefined ? Boolean(body.approved) : list[idx].approved,
    featured: body.featured !== undefined ? Boolean(body.featured) : list[idx].featured,
    verified: body.verified !== undefined ? Boolean(body.verified) : list[idx].verified,
    updatedAt: new Date().toISOString(),
  };
  writeJson(TESTIMONIALS_FILE, list);
  return list[idx];
}

function toggleOfflineTestimonial(id, field = "approved") {
  const list = getOfflineTestimonials(false);
  const idx = list.findIndex((t) => String(t.id) === String(id));
  if (idx === -1) return null;
  list[idx][field] = !list[idx][field];
  list[idx].updatedAt = new Date().toISOString();
  writeJson(TESTIMONIALS_FILE, list);
  return list[idx];
}

function deleteOfflineTestimonial(id) {
  const list = getOfflineTestimonials(false);
  const next = list.filter((t) => String(t.id) !== String(id));
  if (next.length === list.length) return false;
  writeJson(TESTIMONIALS_FILE, next);
  return true;
}

module.exports = {
  getOfflineProducts,
  getOfflineProductById,
  createOfflineProduct,
  updateOfflineProduct,
  deleteOfflineProduct,
  getOfflineOrders,
  createOfflineOrder,
  getOfflineOrder,
  updateOfflineOrderStatus,
  deleteOfflineOrder,
  getOfflineInquiries,
  createOfflineInquiry,
  getOfflineInquiry,
  updateOfflineInquiry,
  deleteOfflineInquiry,
  getOfflineSettings,
  updateOfflineSettings,
  getOfflineTestimonials,
  createOfflineTestimonial,
  updateOfflineTestimonial,
  toggleOfflineTestimonial,
  deleteOfflineTestimonial,
  getOfflineAuth,
};
