require("dotenv").config();
const mysql = require("mysql2/promise");

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = parseInt(process.env.DB_PORT || "3306", 10);
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "";
const DB_NAME = process.env.DB_NAME || "ecommerce_portfolio";

const PRODUCTS_50 = [
  // 1. Audio & Headphones
  {
    slug: "docker-edition-hybrid-anc-studio-wireless-headphones",
    title: "Docker Edition Hybrid ANC Studio Wireless Headphones",
    category: "Audio & Headphones",
    categoryName: "Audio & Headphones",
    shortDescription: "Studio-grade 40mm neodymium drivers, active hybrid noise cancellation, and 40-hour ultra battery life.",
    description: "Built for creators, audio engineers, and music enthusiasts. Features custom tuned 40mm acoustic drivers, matte obsidian black finish, active hybrid noise cancellation, and memory foam cushions.",
    price: 18500,
    salePrice: 14999,
    discountPercent: 19,
    stock: 25,
    rating: 4.9,
    numReviews: 48,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Matte Black", "Graphite Gray"] }],
    specifications: [
      { title: "Driver Size", value: "40mm Dynamic Neodymium" },
      { title: "Battery Life", value: "40 Hours with ANC" },
      { title: "Connectivity", value: "Bluetooth 5.3 + 3.5mm Aux" },
      { title: "Warranty", value: "1 Year Official Warranty" }
    ],
    tags: ["headphones", "audio", "anc", "wireless"],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "airpulse-pro-true-wireless-earbuds",
    title: "AirPulse Pro True Wireless Earbuds with Spatial Audio",
    category: "Audio & Headphones",
    categoryName: "Audio & Headphones",
    shortDescription: "360-degree spatial audio, dual-mic ENC clear calls, and wireless charging case with 32h battery.",
    description: "Compact ergonomic earbuds engineered with 11mm graphene diaphragms for deep sub-bass and crisp vocals. Features IPX5 sweat resistance and touch gesture controls.",
    price: 8500,
    salePrice: 6499,
    discountPercent: 24,
    stock: 40,
    rating: 4.8,
    numReviews: 35,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200&q=80",
      "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Arctic White", "Midnight Black"] }],
    specifications: [
      { title: "Playtime", value: "8h Earbuds + 24h Case" },
      { title: "Water Resistance", value: "IPX5 Splashproof" },
      { title: "Charging", value: "USB-C & Qi Wireless" }
    ],
    tags: ["earbuds", "tws", "audio", "wireless"],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "sonarwave-heavy-bass-portable-bluetooth-speaker",
    title: "SonarWave Heavy Bass 30W Waterproof Bluetooth Speaker",
    category: "Audio & Headphones",
    categoryName: "Audio & Headphones",
    shortDescription: "30W explosive room-filling stereo sound, dual passive radiators, and rugged IPX7 waterproof casing.",
    description: "Take the party anywhere from beach to bedroom. SonarWave features full-frequency drivers, 24-hour non-stop battery, and rugged shockproof silicone bumper.",
    price: 9800,
    salePrice: 7999,
    discountPercent: 18,
    stock: 30,
    rating: 4.9,
    numReviews: 42,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Stealth Black", "Navy Blue", "Forest Green"] }],
    specifications: [
      { title: "Output Power", value: "30W RMS Stereo" },
      { title: "Waterproof", value: "IPX7 Submersible" },
      { title: "Battery", value: "5200mAh (24 Hours)" }
    ],
    tags: ["speaker", "bluetooth", "audio", "waterproof"],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "cybertrack-broadcast-studio-condenser-microphone",
    title: "CyberTrack RGB Studio Condenser USB Microphone",
    category: "Audio & Headphones",
    categoryName: "Audio & Headphones",
    shortDescription: "Cardioid pickup pattern, tap-to-mute sensor, and dynamic RGB ambient lighting for podcasting & gaming.",
    description: "Plug-and-play high-fidelity USB microphone for content creators, streamers, and Zoom calls. Built-in pop filter and anti-vibration shock mount.",
    price: 11200,
    salePrice: 8999,
    discountPercent: 20,
    stock: 22,
    rating: 4.8,
    numReviews: 29,
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&q=80"
    ],
    variants: [{ name: "Mount", options: ["Desk Stand", "Boom Arm Kit"] }],
    specifications: [
      { title: "Sample Rate", value: "192kHz / 24-bit" },
      { title: "Polar Pattern", value: "Cardioid Directional" },
      { title: "Interface", value: "USB-C to USB-A" }
    ],
    tags: ["microphone", "studio", "streaming", "podcast"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "audiophile-open-back-reference-headphones",
    title: "Master Acoustic Open-Back Reference Studio Headphones",
    category: "Audio & Headphones",
    categoryName: "Audio & Headphones",
    shortDescription: "Natural wide soundstage with 50mm planar dynamic drivers and breathable velour pads.",
    description: "Crafted for critical listening, music production, and audiophiles seeking an expansive soundstage without acoustic compression. Features detachable oxygen-free copper cable.",
    price: 24500,
    salePrice: 19999,
    discountPercent: 18,
    stock: 14,
    rating: 5.0,
    numReviews: 19,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=80"
    ],
    variants: [{ name: "Ear Cushion", options: ["Breathable Velour", "Perforated Leather"] }],
    specifications: [
      { title: "Impedance", value: "80 Ohms" },
      { title: "Frequency Response", value: "10Hz - 40,000Hz" },
      { title: "Cable", value: "3.0m Detachable Gold Plated" }
    ],
    tags: ["audiophile", "headphones", "studio", "openback"],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false
  },

  // 2. Smart Watches & Chronographs
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
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200&q=80"
    ],
    variants: [{ name: "Strap", options: ["Cognac Brown Leather", "Obsidian Black Silicone"] }],
    specifications: [
      { title: "Case Material", value: "316L Surgical Stainless Steel" },
      { title: "Glass", value: "Scratch-Resistant Sapphire Crystal" },
      { title: "Water Resistance", value: "5 ATM / 50 Meters" },
      { title: "Movement", value: "Precision Japanese Quartz" }
    ],
    tags: ["watch", "chronograph", "tactical", "luxury"],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "monaco-swiss-automatic-skeleton-watch",
    title: "Monaco Classic Heritage Automatic Mechanical Watch",
    category: "Smart Watches",
    categoryName: "Smart Watches",
    shortDescription: "Exhibition caseback showing 21-jewel self-winding automatic movement with alligator grain strap.",
    description: "No batteries needed. Winds automatically with the natural motion of your wrist. Hand-finished guilloche dial with blued steel hands.",
    price: 22000,
    salePrice: 17999,
    discountPercent: 18,
    stock: 12,
    rating: 4.9,
    numReviews: 24,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80"
    ],
    variants: [{ name: "Dial Color", options: ["Sunburst Silver", "Midnight Navy"] }],
    specifications: [
      { title: "Movement", value: "21-Jewel Automatic Self-Winding" },
      { title: "Power Reserve", value: "42 Hours" },
      { title: "Strap", value: "Genuine Italian Calfskin" }
    ],
    tags: ["automatic", "mechanical", "luxury", "watch"],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "titanium-aero-smartwatch-amoled-display",
    title: "Titanium Aero Ultra AMOLED Smartwatch with Bluetooth Calling",
    category: "Smart Watches",
    categoryName: "Smart Watches",
    shortDescription: "1.43-inch Always-On AMOLED display, aerospace titanium bezel, heart rate & SpO2 tracking.",
    description: "Modern health intelligence and smartphone convenience on your wrist. Features 100+ workout modes, sleep tracking, and up to 14 days battery life on a single charge.",
    price: 13500,
    salePrice: 10499,
    discountPercent: 22,
    stock: 28,
    rating: 4.8,
    numReviews: 53,
    image: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=1200&q=80",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1200&q=80"
    ],
    variants: [{ name: "Bezel", options: ["Titanium Silver", "Deep Charcoal"] }],
    specifications: [
      { title: "Display", value: "1.43\" AMOLED 466x466 (1000 Nits)" },
      { title: "Battery Life", value: "14 Days Typical Use" },
      { title: "Sensors", value: "PPG Heart Rate, SpO2, Accelerometer" }
    ],
    tags: ["smartwatch", "amoled", "fitness", "bluetooth"],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "aviator-vintage-pilot-chronograph-watch",
    title: "Aviator Vintage Flieger Chronograph with Suede Strap",
    category: "Smart Watches",
    categoryName: "Smart Watches",
    shortDescription: "High-contrast luminescent numerals, matte bead-blasted case, and vintage olive suede leather strap.",
    description: "Inspired by mid-century tactical flight instruments. Features Swiss Super-LumiNova on indices for effortless readability in dark cockpits and night drives.",
    price: 14200,
    salePrice: 11499,
    discountPercent: 19,
    stock: 16,
    rating: 4.9,
    numReviews: 31,
    image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=1200&q=80"
    ],
    variants: [{ name: "Dial", options: ["Matte Black", "Desert Sand"] }],
    specifications: [
      { title: "Lume", value: "Swiss Super-LumiNova C3" },
      { title: "Case Diameter", value: "41mm" },
      { title: "Crystal", value: "Double-Domed Mineral Glass" }
    ],
    tags: ["aviator", "pilot", "vintage", "watch"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "vanguard-fitness-smart-band-heart-rate",
    title: "Vanguard Slim Fitness Smart Band with GPS & Sleep Monitor",
    category: "Smart Watches",
    categoryName: "Smart Watches",
    shortDescription: "Ultra-slim 25g lightweight body, 1.47-inch curved display, and 50M swimproof resistance.",
    description: "Track steps, calories, heart rate, and sleep stages 24/7 without feeling bulk on your wrist. Comes with magnetic rapid charging.",
    price: 5500,
    salePrice: 3999,
    discountPercent: 27,
    stock: 50,
    rating: 4.7,
    numReviews: 68,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1200&q=80"
    ],
    variants: [{ name: "Band Color", options: ["Carbon Black", "Graphite Gray", "Rose Mist"] }],
    specifications: [
      { title: "Weight", value: "25g Ultra Lightweight" },
      { title: "Water Resistance", value: "5 ATM (50m Swimproof)" },
      { title: "Battery", value: "Up to 18 Days" }
    ],
    tags: ["smartband", "fitness", "tracker", "health"],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "royal-oak-brushed-steel-mens-dress-watch",
    title: "Imperial Brushed Steel Royal Blue Sunburst Dial Watch",
    category: "Smart Watches",
    categoryName: "Smart Watches",
    shortDescription: "Octagonal beveled bezel with integrated brushed stainless steel bracelet and date window.",
    description: "The epitome of modern luxury horology. Features dual-finish polished and brushed surfaces that catch the light from every angle.",
    price: 15500,
    salePrice: 12499,
    discountPercent: 19,
    stock: 20,
    rating: 4.9,
    numReviews: 27,
    image: "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=1200&q=80"
    ],
    variants: [{ name: "Dial Color", options: ["Sunburst Royal Blue", "Emerald Forest"] }],
    specifications: [
      { title: "Clasp", value: "Butterfly Deployant Clasp" },
      { title: "Material", value: "316L Solid Stainless Steel" },
      { title: "Thickness", value: "9.5mm Slim Profile" }
    ],
    tags: ["luxury", "dresswatch", "steel", "watch"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  },

  // 3. Footwear & Sneakers
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
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&q=80"
    ],
    variants: [{ name: "Size (EU)", options: ["40", "41", "42", "43", "44", "45"] }],
    specifications: [
      { title: "Sole Tech", value: "Carbon-Plate Rebound Cushioning" },
      { title: "Upper Material", value: "Engineered Cyber-Knit Breathable Mesh" },
      { title: "Weight", value: "220g (Ultra-Lightweight)" },
      { title: "Usage", value: "Road Running, Gym, Streetwear" }
    ],
    tags: ["shoes", "sneakers", "running", "fitness"],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "street-phantom-retro-chunky-sneakers",
    title: "Street Phantom Retro Chunky Triple-White Sneakers",
    category: "Footwear",
    categoryName: "Footwear",
    shortDescription: "Premium full-grain leather overlays with sculpted EVA chunky sole for supreme cushioning.",
    description: "Clean, crisp, and comfortable. Triple-white aesthetic designed to pair seamlessly with denim, sweatpants, or tailored trousers.",
    price: 12500,
    salePrice: 9499,
    discountPercent: 24,
    stock: 35,
    rating: 4.8,
    numReviews: 44,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80"
    ],
    variants: [{ name: "Size (EU)", options: ["40", "41", "42", "43", "44", "45"] }],
    specifications: [
      { title: "Upper", value: "Microfiber Leather & Breathable Mesh" },
      { title: "Insole", value: "Orthopedic Memory Foam" },
      { title: "Outsole", value: "Anti-Slip Textured Rubber" }
    ],
    tags: ["sneakers", "white", "chunky", "streetwear"],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "vintage-retro-suede-runner-sneakers",
    title: "Vintage Track Suede Runner Sneakers with Gum Sole",
    category: "Footwear",
    categoryName: "Footwear",
    shortDescription: "Classic 70s track styling crafted with buttery suede and authentic natural gum rubber outsole.",
    description: "Timeless heritage silhouette combining soft suede overlays with vintage nylon side panels for breathable comfort and understated elegance.",
    price: 11500,
    salePrice: 8999,
    discountPercent: 21,
    stock: 25,
    rating: 4.8,
    numReviews: 38,
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=1200&q=80"
    ],
    variants: [{ name: "Size (EU)", options: ["40", "41", "42", "43", "44", "45"] }],
    specifications: [
      { title: "Upper", value: "Natural Suede & Ballistic Nylon" },
      { title: "Outsole", value: "Classic Gum Rubber" },
      { title: "Fit", value: "True to Size" }
    ],
    tags: ["shoes", "vintage", "suede", "gumsole"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "urban-skate-vulcanized-canvas-sneakers",
    title: "Urban Skate Vulcanized Canvas Low-Top Sneakers",
    category: "Footwear",
    categoryName: "Footwear",
    shortDescription: "Heavyweight 12oz canvas upper, double-stitched reinforcements, and waffle grip sole.",
    description: "Durable everyday skate sneakers built to withstand the demands of concrete and skateboarding while offering effortless casual style.",
    price: 6500,
    salePrice: 4999,
    discountPercent: 23,
    stock: 45,
    rating: 4.7,
    numReviews: 61,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1200&q=80"
    ],
    variants: [{ name: "Size (EU)", options: ["40", "41", "42", "43", "44", "45"] }],
    specifications: [
      { title: "Material", value: "12oz Organic Cotton Canvas" },
      { title: "Construction", value: "Vulcanized Rubber Thermal Bond" }
    ],
    tags: ["canvas", "skate", "lowtop", "sneakers"],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "chelsea-full-grain-leather-ankle-boots",
    title: "Heritage Handcrafted Chelsea Ankle Boots in Saddle Brown",
    category: "Footwear",
    categoryName: "Footwear",
    shortDescription: "Pull-on elastic side gusset, Goodyear-welted construction, and vegetable-tanned full-grain leather.",
    description: "Hand-finished saddle brown leather boots that age gracefully with a unique personal patina over time. Comfortable for formal and smart-casual wear.",
    price: 16500,
    salePrice: 13499,
    discountPercent: 18,
    stock: 18,
    rating: 4.9,
    numReviews: 33,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=80"
    ],
    variants: [{ name: "Size (EU)", options: ["40", "41", "42", "43", "44", "45"] }],
    specifications: [
      { title: "Leather", value: "100% Vegetable-Tanned Full Grain" },
      { title: "Sole", value: "Goodyear Welted Stacked Heel" },
      { title: "Origin", value: "Handcrafted Artisan Workshop" }
    ],
    tags: ["boots", "chelsea", "leather", "formal"],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false
  },
  {
    slug: "hyperdunk-retro-high-top-basketball-sneakers",
    title: "HyperDunk Retro High-Top Basketball Leather Sneakers",
    category: "Footwear",
    categoryName: "Footwear",
    shortDescription: "Ankle-locking padded collar, perforated toe box, and dual-density air-cushioned midsole.",
    description: "Iconic court silhouette with bold contrast panelling and maximum impact absorption on jumps, pivots, and street walks.",
    price: 15200,
    salePrice: 12299,
    discountPercent: 19,
    stock: 22,
    rating: 4.8,
    numReviews: 40,
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&q=80"
    ],
    variants: [{ name: "Size (EU)", options: ["40", "41", "42", "43", "44", "45"] }],
    specifications: [
      { title: "Ankle Support", value: "Reinforced Padded High-Top Collar" },
      { title: "Cushioning", value: "Enclosed Air-Sole Unit" }
    ],
    tags: ["hightop", "basketball", "sneakers", "shoes"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "trailblazer-all-weather-tactical-hiking-boots",
    title: "TrailBlazer All-Weather Waterproof Tactical Hiking Boots",
    category: "Footwear",
    categoryName: "Footwear",
    shortDescription: "Vibram deep-lug traction outsole, waterproof membrane lining, and reinforced rubber toe cap.",
    description: "Built to conquer mountain trails, rocky paths, and wet conditions with total ankle stability and zero moisture seepage.",
    price: 17800,
    salePrice: 14499,
    discountPercent: 18,
    stock: 15,
    rating: 5.0,
    numReviews: 26,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=1200&q=80"
    ],
    variants: [{ name: "Size (EU)", options: ["41", "42", "43", "44", "45"] }],
    specifications: [
      { title: "Outsole", value: "Vibram MegaGrip Compound" },
      { title: "Membrane", value: "HydroShield Waterproof Breathable" }
    ],
    tags: ["hiking", "boots", "tactical", "outdoor"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "neon-flux-volt-green-performance-trainers",
    title: "Neon Flux Ultra-Lightweight Gym & Cross-Trainers",
    category: "Footwear",
    categoryName: "Footwear",
    shortDescription: "Seamless 3D knit upper with dynamic arch band support and high-visibility neon accent.",
    description: "Engineered for HIIT, sprints, and heavy weightlifting with flat-ground stability and breathable cooling vents.",
    price: 11000,
    salePrice: 8499,
    discountPercent: 22,
    stock: 26,
    rating: 4.8,
    numReviews: 37,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&q=80"
    ],
    variants: [{ name: "Size (EU)", options: ["40", "41", "42", "43", "44", "45"] }],
    specifications: [
      { title: "Drop", value: "4mm Heel-to-Toe Drop" },
      { title: "Closure", value: "Speed-Lacing System" }
    ],
    tags: ["trainers", "gym", "sneakers", "fitness"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false
  },

  // 4. Apparel & Streetwear
  {
    slug: "heavyweight-french-terry-oversized-hoodie",
    title: "Heavyweight 450 GSM French Terry Boxy Streetwear Hoodie",
    category: "Fashion & Apparel",
    categoryName: "Fashion & Apparel",
    shortDescription: "450 GSM organic French Terry cotton with double-layered hood and relaxed streetwear drop-shoulder fit.",
    description: "The ultimate luxury streetwear hoodie. Pre-shrunk 100% combed cotton, dense ribbed cuffs and hem, and zero drawstring minimalist design.",
    price: 6800,
    salePrice: 5299,
    discountPercent: 22,
    stock: 40,
    rating: 4.9,
    numReviews: 76,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80",
      "https://images.unsplash.com/photo-1578768079052-aa76e520028b?w=1200&q=80"
    ],
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL", "XXL"] },
      { name: "Color", options: ["Washed Charcoal", "Sand Dune", "Olive Sage"] }
    ],
    specifications: [
      { title: "Fabric", value: "100% French Terry Cotton (450 GSM)" },
      { title: "Fit", value: "Boxy Oversized Streetwear Fit" },
      { title: "Care", value: "Machine Wash Cold, Hang Dry" }
    ],
    tags: ["hoodie", "streetwear", "heavyweight", "apparel"],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "acid-wash-vintage-streetwear-pullover-hoodie",
    title: "Acid-Wash Vintage Mineral Wash Pullover Hoodie",
    category: "Fashion & Apparel",
    categoryName: "Fashion & Apparel",
    shortDescription: "Individually garment-dyed mineral wash with kangaroo pocket and soft brushed fleece interior.",
    description: "Every piece has a unique distressed pattern. 400 GSM heavyweight cotton-poly blend offering warmth and effortless vintage aesthetic.",
    price: 6400,
    salePrice: 4899,
    discountPercent: 23,
    stock: 35,
    rating: 4.8,
    numReviews: 49,
    image: "https://images.unsplash.com/photo-1578768079052-aa76e520028b?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1578768079052-aa76e520028b?w=1200&q=80"
    ],
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL", "XXL"] },
      { name: "Color", options: ["Vintage Black", "Faded Slate"] }
    ],
    specifications: [
      { title: "Wash", value: "Handcrafted Mineral Acid Wash" },
      { title: "Weight", value: "400 GSM Fleece" }
    ],
    tags: ["hoodie", "vintage", "acidwash", "apparel"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "minimalist-essential-260gsm-heavy-tee",
    title: "Essential 260 GSM Heavyweight Combed Cotton T-Shirt",
    category: "Fashion & Apparel",
    categoryName: "Fashion & Apparel",
    shortDescription: "Substantial 260 GSM ring-spun cotton that doesn't lose shape, with reinforced collar ribbing.",
    description: "Thick, opaque, and built to last. No see-through fabric, pre-shrunk to retain fit through dozens of wash cycles.",
    price: 3200,
    salePrice: 2499,
    discountPercent: 21,
    stock: 60,
    rating: 4.9,
    numReviews: 88,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&q=80"
    ],
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL", "XXL"] },
      { name: "Color", options: ["Crisp White", "Pitch Black", "Heather Gray"] }
    ],
    specifications: [
      { title: "GSM", value: "260 GSM Heavyweight" },
      { title: "Collar", value: "1-inch High-Density Ribbed Collar" }
    ],
    tags: ["tshirt", "tee", "cotton", "essential"],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "stealth-boxy-drop-shoulder-graphic-tee",
    title: "Stealth Boxy Drop-Shoulder Cyber Graphic T-Shirt",
    category: "Fashion & Apparel",
    categoryName: "Fashion & Apparel",
    shortDescription: "Screenprinted high-density silicone chest graphic with relaxed wide sleeve cut.",
    description: "Modern cyberpunk aesthetics with Japanese typography accents. Made from breathable 240 GSM organic cotton.",
    price: 3500,
    salePrice: 2699,
    discountPercent: 22,
    stock: 45,
    rating: 4.8,
    numReviews: 39,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&q=80"
    ],
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL"] },
      { name: "Color", options: ["Matte Black", "Off-White"] }
    ],
    specifications: [
      { title: "Print Tech", value: "High-Density Silicone Screenprint" },
      { title: "Fit", value: "Drop Shoulder Relaxed" }
    ],
    tags: ["graphictee", "streetwear", "cyberpunk", "tshirt"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "tactical-techwear-waterproof-bomber-jacket",
    title: "Tactical Techwear Weatherproof MA-1 Flight Bomber Jacket",
    category: "Fashion & Apparel",
    categoryName: "Fashion & Apparel",
    shortDescription: "Water-resistant flight nylon with emergency safety orange quilted lining and arm utility pocket.",
    description: "Re-engineered classic MA-1 bomber with DWR water-shedding coating, heavy-duty metal YKK zippers, and windproof ribbed collar.",
    price: 11500,
    salePrice: 8999,
    discountPercent: 21,
    stock: 20,
    rating: 4.9,
    numReviews: 34,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80"
    ],
    variants: [
      { name: "Size", options: ["M", "L", "XL", "XXL"] },
      { name: "Color", options: ["Military Sage Green", "Midnight Black"] }
    ],
    specifications: [
      { title: "Shell", value: "100% Water-Resistant Flight Nylon" },
      { title: "Lining", value: "Thermal Diamond Quilted Polyester" }
    ],
    tags: ["jacket", "bomber", "outerwear", "tactical"],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "vintage-asymmetric-lambskin-leather-biker-jacket",
    title: "Vintage Asymmetric Genuine Lambskin Leather Biker Jacket",
    category: "Fashion & Apparel",
    categoryName: "Fashion & Apparel",
    shortDescription: "100% butter-soft full-grain lambskin with heavy silver hardware and zip cuffs.",
    description: "Classic rock-and-roll silhouette. Cut from premium lambskin that molds perfectly to your physique with satin lining for effortless layering.",
    price: 26500,
    salePrice: 21999,
    discountPercent: 17,
    stock: 10,
    rating: 5.0,
    numReviews: 18,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&q=80"
    ],
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL"] }
    ],
    specifications: [
      { title: "Material", value: "100% Genuine Lambskin Leather" },
      { title: "Hardware", value: "Antiqued Gunmetal YKK Zippers" }
    ],
    tags: ["leather", "jacket", "biker", "luxury"],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false
  },
  {
    slug: "classic-crewneck-athletic-french-terry-sweatshirt",
    title: "Heritage Athletic V-Insert French Terry Crewneck Sweatshirt",
    category: "Fashion & Apparel",
    categoryName: "Fashion & Apparel",
    shortDescription: "Traditional V-notch collar detail, loopback cotton interior, and flatlock anti-chafing seams.",
    description: "Inspired by collegiate athletic apparel. Soft, breathable, and versatile enough to wear under a coat or over a collared shirt.",
    price: 4900,
    salePrice: 3799,
    discountPercent: 22,
    stock: 35,
    rating: 4.8,
    numReviews: 45,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=80"
    ],
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL"] },
      { name: "Color", options: ["Oatmeal Heather", "Forest Moss", "Navy"] }
    ],
    specifications: [
      { title: "Fabric", value: "380 GSM Loopback French Terry" }
    ],
    tags: ["sweatshirt", "crewneck", "apparel", "casual"],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "oversized-raw-hem-skater-cotton-tee",
    title: "Oversized Raw-Hem Skater Washed Cotton T-Shirt",
    category: "Fashion & Apparel",
    categoryName: "Fashion & Apparel",
    shortDescription: "Distressed raw edge hem, dropped shoulders, and ultra-soft pre-washed vintage jersey.",
    description: "Laidback California skate fit with extended length and wide sleeves. Looks great layered over long-sleeve tees.",
    price: 3400,
    salePrice: 2599,
    discountPercent: 23,
    stock: 40,
    rating: 4.7,
    numReviews: 28,
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=80"
    ],
    variants: [
      { name: "Size", options: ["M", "L", "XL"] },
      { name: "Color", options: ["Washed Coal", "Cement Gray"] }
    ],
    specifications: [
      { title: "Fit", value: "Exaggerated Skater Oversize" }
    ],
    tags: ["skater", "oversized", "tee", "streetwear"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  },

  // 5. Accessories & Leather Goods
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
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Matte Black", "Vintage Tan"] }],
    specifications: [
      { title: "Material", value: "100% Full-Grain Cowhide Leather" },
      { title: "RFID Protection", value: "13.56 MHz Frequency Shielding" },
      { title: "Capacity", value: "8 Cards + 2 Currency Slots" }
    ],
    tags: ["wallet", "leather", "rfid", "accessories"],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "tactical-aluminum-quick-access-cardholder-wallet",
    title: "Apex Carbon Fiber & Aluminum Quick-Eject Cardholder",
    category: "Accessories",
    categoryName: "Accessories",
    shortDescription: "Pop-up instant card ejection trigger, carbon fiber plate, and flexible cash money clip band.",
    description: "Slimmest pocket profile imaginable (8mm thin). Press the bottom trigger and your cards fan out ergonomically for 1-second access.",
    price: 3800,
    salePrice: 2899,
    discountPercent: 23,
    stock: 55,
    rating: 4.8,
    numReviews: 72,
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=80"
    ],
    variants: [{ name: "Finish", options: ["Forged Carbon", "Matte Gunmetal"] }],
    specifications: [
      { title: "Capacity", value: "Holds up to 6 Cards + 10 Folded Bills" },
      { title: "Weight", value: "65g Ultra-Light" }
    ],
    tags: ["cardholder", "carbonfiber", "minimalist", "wallet"],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true
  },
  {
    slug: "skyline-polarized-aviator-sunglasses-titanium-frame",
    title: "Skyline Polarized Aviator Sunglasses with Titanium Frame",
    category: "Accessories",
    categoryName: "Accessories",
    shortDescription: "UV400 Category 3 polarized lenses, featherweight titanium alloy frame, and anti-glare coating.",
    description: "Crystal-clear road contrast and zero optical distortion. Includes leather magnetic travel hard case and microfiber cleaning cloth.",
    price: 5800,
    salePrice: 4499,
    discountPercent: 22,
    stock: 35,
    rating: 4.9,
    numReviews: 41,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&q=80",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&q=80"
    ],
    variants: [{ name: "Lens Tint", options: ["Midnight Polarized", "Emerald Green Polarized"] }],
    specifications: [
      { title: "Protection", value: "100% UV400 Protection (UVA & UVB)" },
      { title: "Frame", value: "Corrosion-Proof Titanium Alloy" }
    ],
    tags: ["sunglasses", "aviator", "polarized", "eyewear"],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false
  },
  {
    slug: "wayfarer-matte-black-polarized-lifestyle-shades",
    title: "Pacific Wayfarer Matte Black Acetate Polarized Sunglasses",
    category: "Accessories",
    categoryName: "Accessories",
    shortDescription: "Classic square frame hand-carved from Italian Mazzucchelli acetate with reinforced 5-barrel hinges.",
    description: "Effortless Hollywood cool. Built with shatter-resistant polarized TAC lenses for water sports, driving, and bright sunny afternoons.",
    price: 5200,
    salePrice: 3999,
    discountPercent: 23,
    stock: 30,
    rating: 4.8,
    numReviews: 33,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&q=80"
    ],
    variants: [{ name: "Frame", options: ["Matte Black", "Tortoiseshell"] }],
    specifications: [
      { title: "Hinges", value: "5-Barrel Stainless Steel Riveted" }
    ],
    tags: ["wayfarer", "sunglasses", "eyewear", "polarized"],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "handcrafted-full-grain-leather-reversible-belt",
    title: "Handcrafted 1.5-Inch Full-Grain Reversible Leather Belt",
    category: "Accessories",
    categoryName: "Accessories",
    shortDescription: "Dual-sided black & brown full-grain leather with rotating brushed nickel buckle.",
    description: "Two belts in one. Twist the buckle 180 degrees to switch from obsidian black to saddle brown leather to match any shoes.",
    price: 3600,
    salePrice: 2799,
    discountPercent: 22,
    stock: 40,
    rating: 4.8,
    numReviews: 50,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1200&q=80"
    ],
    variants: [{ name: "Waist Size", options: ["32-34 in", "36-38 in", "40-42 in"] }],
    specifications: [
      { title: "Width", value: "1.5 inches (38mm)" },
      { title: "Buckle", value: "Solid Zinc-Alloy with Satin Nickel Plating" }
    ],
    tags: ["belt", "leather", "reversible", "accessories"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  },

  // 6. Bags & Backpacks
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
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Stealth Black", "Olive Drab"] }],
    specifications: [
      { title: "Capacity", value: "28 Liters" },
      { title: "Material", value: "1000D Ballistic Waterproof Nylon" },
      { title: "Laptop Sleeve", value: "Fits up to 16-inch MacBook / Laptop" }
    ],
    tags: ["backpack", "tactical", "travel", "waterproof"],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "nomad-minimalist-roll-top-urban-backpack",
    title: "Nomad Minimalist Roll-Top Urban Commuter Backpack",
    category: "Accessories",
    categoryName: "Accessories",
    shortDescription: "Expandable 20L-26L roll-top volume, magnetic Fidlock buckle, and quick-access side zip.",
    description: "Sleek architectural design for modern tech professionals and university students. Weather-resistant tarpaulin base stands upright when set on ground.",
    price: 7900,
    salePrice: 5999,
    discountPercent: 24,
    stock: 25,
    rating: 4.8,
    numReviews: 36,
    image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Charcoal Black", "Stone Gray"] }],
    specifications: [
      { title: "Capacity", value: "Expandable 20 to 26 Liters" },
      { title: "Buckle", value: "Magnetic Quick-Snap Fidlock" }
    ],
    tags: ["backpack", "commuter", "rolltop", "laptop"],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "voyager-weekender-leather-canvas-duffle-bag",
    title: "Voyager 45L Heavyweight Canvas & Leather Weekender Duffle",
    category: "Accessories",
    categoryName: "Accessories",
    shortDescription: "Airport carry-on compliant, separate ventilated shoe compartment, and padded shoulder strap.",
    description: "Crafted for 3-5 day getaways and gym sessions. Built from 16oz waxed canvas with brass rivets and reinforced leather bottom feet.",
    price: 9800,
    salePrice: 7799,
    discountPercent: 20,
    stock: 18,
    rating: 4.9,
    numReviews: 25,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Heritage Khaki", "Midnight Black"] }],
    specifications: [
      { title: "Volume", value: "45 Liters (Airline Carry-On Friendly)" },
      { title: "Compartment", value: "Dedicated Shoe/Laundry Pocket" }
    ],
    tags: ["duffle", "travel", "bag", "weekender"],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "executive-vegan-leather-laptop-sleeve-case",
    title: "Executive Ultra-Slim Water-Resistant 14-16\" Laptop Sleeve",
    category: "Accessories",
    categoryName: "Accessories",
    shortDescription: "Shock-absorbing micro-fleece interior, magnetic flap closure, and external accessory pouch.",
    description: "Ultra-slim 15mm silhouette slides effortlessly into backpacks and briefcases while guarding against corner drops and surface scratches.",
    price: 3800,
    salePrice: 2899,
    discountPercent: 24,
    stock: 45,
    rating: 4.8,
    numReviews: 48,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80"
    ],
    variants: [
      { name: "Size", options: ["13-14 inch", "15-16 inch"] },
      { name: "Color", options: ["Dark Espresso", "Slate Black"] }
    ],
    specifications: [
      { title: "Lining", value: "Anti-Scratch Velvet Micro-Fleece" }
    ],
    tags: ["laptopsleeve", "sleeve", "macbook", "accessories"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false
  },

  // 7. Electronics & Smart Tech
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
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1200&q=80"
    ],
    variants: [{ name: "Finish", options: ["Space Gray", "Matte Silver"] }],
    specifications: [
      { title: "Total Power", value: "100W Max Fast Delivery" },
      { title: "Ports", value: "3x USB-C (PD 3.0) + 1x USB-A (QC 4.0)" },
      { title: "Tech", value: "Next-Gen GaN III Semiconductor" }
    ],
    tags: ["charger", "gan", "tech", "gadget"],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true
  },
  {
    slug: "magpack-10000mah-wireless-magnetic-power-bank",
    title: "MagPack 10,000mAh Magnetic Wireless Fast Power Bank",
    category: "Electronics",
    categoryName: "Electronics",
    shortDescription: "Snap-and-charge strong N52 neodymium magnets, 15W wireless + 20W PD bi-directional USB-C.",
    description: "Slim pocketable power that snaps firmly to the back of your phone. Built-in fold-out zinc alloy kickstand for watching YouTube or hands-free FaceTime calls.",
    price: 6500,
    salePrice: 4999,
    discountPercent: 23,
    stock: 40,
    rating: 4.8,
    numReviews: 57,
    image: "https://images.unsplash.com/photo-1609592807664-877f0a99676e?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1609592807664-877f0a99676e?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Deep Space Blue", "Titanium Gray"] }],
    specifications: [
      { title: "Capacity", value: "10,000mAh Li-Polymer" },
      { title: "Wireless Speed", value: "15W Max MagSafe Fast Charge" },
      { title: "Kickstand", value: "Foldable Zinc-Alloy Stand" }
    ],
    tags: ["powerbank", "magsafe", "wireless", "gadget"],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "cyberstrike-75-hot-swappable-mechanical-keyboard",
    title: "CyberStrike 75% Wireless Mechanical Keyboard RGB Hot-Swap",
    category: "Electronics",
    categoryName: "Electronics",
    shortDescription: "Gasket-mounted sound dampening, pre-lubed linear switches, and tri-mode (2.4G + BT 5.0 + USB-C).",
    description: "Thocky, creamy keystrokes right out of the box. Features an aluminum multi-function volume knob, PBT double-shot keycaps, and Mac/Windows layout switch.",
    price: 13800,
    salePrice: 10999,
    discountPercent: 20,
    stock: 20,
    rating: 4.9,
    numReviews: 38,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&q=80"
    ],
    variants: [{ name: "Switch Type", options: ["Pre-Lubed Red (Linear)", "Tactile Brown"] }],
    specifications: [
      { title: "Layout", value: "75% Compact (82 Keys + Rotary Knob)" },
      { title: "Mounting", value: "Silicone Gasket Mount" },
      { title: "Battery", value: "4000mAh (Up to 200h without RGB)" }
    ],
    tags: ["keyboard", "mechanical", "gaming", "desksetup"],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "precision-ergo-multi-device-wireless-mouse",
    title: "PrecisionErgo Silent Wireless Optical Mouse with Thumb Scroll",
    category: "Electronics",
    categoryName: "Electronics",
    shortDescription: "Sculpted 57-degree natural handshake angle, 4000 DPI sensor on glass, and multi-device pairing.",
    description: "Eliminates wrist fatigue during long office hours. Ultra-silent whisper switches reduce click noise by 90% while dual thumb buttons boost productivity.",
    price: 5200,
    salePrice: 3899,
    discountPercent: 25,
    stock: 45,
    rating: 4.8,
    numReviews: 44,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Graphite Matte", "Pale Gray"] }],
    specifications: [
      { title: "DPI Range", value: "800 to 4000 DPI Adjustable" },
      { title: "Connection", value: "Bluetooth + 2.4GHz USB Dongle" }
    ],
    tags: ["mouse", "ergonomic", "wireless", "tech"],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "lumina-monitor-light-bar-desk-lamp",
    title: "Lumina ScreenBar Eye-Care Asymmetric Monitor Desk Light",
    category: "Electronics",
    categoryName: "Electronics",
    shortDescription: "Zero screen glare, auto-dimming touch sensor, and wireless wireless desktop rotary remote dial.",
    description: "Illuminates your workspace without casting any glare or reflection on your monitor screen. Adjustable color temperature from 2700K warm to 6500K daylight.",
    price: 6800,
    salePrice: 5299,
    discountPercent: 22,
    stock: 30,
    rating: 4.9,
    numReviews: 51,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=80"
    ],
    variants: [{ name: "Body Finish", options: ["Anodized Black Aluminum", "Space Silver"] }],
    specifications: [
      { title: "Color Temp", value: "2700K - 6500K Stepless Adjustment" },
      { title: "Power", value: "USB-C Powered (5V 1A)" }
    ],
    tags: ["lightbar", "desksetup", "screenbar", "gadget"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "hydrothermal-smart-led-temperature-water-bottle",
    title: "HydroThermal 500ml Smart LED Temperature Water Flask",
    category: "Electronics",
    categoryName: "Electronics",
    shortDescription: "Double-wall 316 stainless steel vacuum insulation, touch OLED cap displays temperature.",
    description: "Keeps liquids ice cold for 24 hours or piping hot for 12 hours. Tap the waterproof touch cap to instantly view the liquid temperature.",
    price: 3200,
    salePrice: 2499,
    discountPercent: 22,
    stock: 50,
    rating: 4.7,
    numReviews: 63,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Matte Obsidian", "Steel Silver", "Forest Pine"] }],
    specifications: [
      { title: "Insulation", value: "Double-Wall 316 Food-Grade Stainless" },
      { title: "Battery", value: "Internal 500-day longlife cell" }
    ],
    tags: ["flask", "bottle", "smart", "lifestyle"],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false
  },

  // 8. Fragrances & Grooming
  {
    slug: "oud-royale-extrait-de-parfum-100ml",
    title: "Oud Royale Extrait De Parfum 100ml Luxury Fragrance",
    category: "Fragrances",
    categoryName: "Fragrances",
    shortDescription: "Aged Cambodian oud, smoked amber, damask rose, and bourbon vanilla. 14+ hours long-lasting sillage.",
    description: "A commanding fragrance of royalty and mystery. Formulated with 30% pure fragrance oil concentration for intoxicating projection.",
    price: 8800,
    salePrice: 6999,
    discountPercent: 20,
    stock: 25,
    rating: 5.0,
    numReviews: 39,
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200&q=80"
    ],
    variants: [{ name: "Size", options: ["50ml Travel Bottle", "100ml Full Size"] }],
    specifications: [
      { title: "Concentration", value: "Extrait de Parfum (30% Oil)" },
      { title: "Longevity", value: "14+ Hours on Skin / 24+ on Clothes" }
    ],
    tags: ["perfume", "oud", "fragrance", "luxury"],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "aquatic-bergamot-fresh-eau-de-parfum-100ml",
    title: "Aqua Marine Bergamot & Sea Salt Fresh Eau De Parfum 100ml",
    category: "Fragrances",
    categoryName: "Fragrances",
    shortDescription: "Crisp Italian bergamot, sea breeze minerals, Sicilian lemon, and white cedarwood base.",
    description: "The ultimate clean summer signature scent. Uplifting, fresh, and irresistibly vibrant for hot days and office meetings.",
    price: 6800,
    salePrice: 5299,
    discountPercent: 22,
    stock: 30,
    rating: 4.8,
    numReviews: 44,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&q=80"
    ],
    variants: [{ name: "Volume", options: ["100ml Eau de Parfum"] }],
    specifications: [
      { title: "Top Notes", value: "Bergamot, Sea Salt, Lemon" },
      { title: "Heart Notes", value: "Marine Accord, Rosemary" }
    ],
    tags: ["perfume", "fresh", "aquatic", "fragrance"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "amber-noir-leather-smoky-spiced-cologne",
    title: "Amber Noir Smoky Tuscan Leather & Cardamom Cologne",
    category: "Fragrances",
    categoryName: "Fragrances",
    shortDescription: "Intense black cardamom, rich Tuscan leather, smoked birch, and patchouli for evening wear.",
    description: "Bold, seductive, and deeply masculine. Designed for cold winter nights, formal dinners, and memorable impression.",
    price: 7500,
    salePrice: 5999,
    discountPercent: 20,
    stock: 22,
    rating: 4.9,
    numReviews: 31,
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1200&q=80"
    ],
    variants: [{ name: "Volume", options: ["100ml"] }],
    specifications: [
      { title: "Type", value: "Eau de Parfum" },
      { title: "Season", value: "Autumn / Winter / Evening" }
    ],
    tags: ["cologne", "leather", "amber", "fragrance"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false
  },
  {
    slug: "gentlemans-complete-beard-hair-grooming-kit",
    title: "Gentleman's Organic Argan Beard & Hair Grooming Gift Kit",
    category: "Fragrances",
    categoryName: "Fragrances",
    shortDescription: "Cold-pressed Moroccan Argan beard oil, sandalwood beard balm, boar bristle brush, and stainless trimming shears.",
    description: "Everything needed to soften coarse facial hair, eliminate itchiness, and style your beard with a subtle woody scent. Packed in a luxury gift box.",
    price: 4800,
    salePrice: 3699,
    discountPercent: 23,
    stock: 35,
    rating: 4.9,
    numReviews: 52,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&q=80"
    ],
    variants: [{ name: "Scent", options: ["Cedar & Bergamot", "Sandalwood Reserve"] }],
    specifications: [
      { title: "Contents", value: "50ml Oil + 60g Balm + Brush + Shears" },
      { title: "Ingredients", value: "100% Organic Cold-Pressed Oils" }
    ],
    tags: ["grooming", "beard", "care", "kit"],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false
  },

  // Extra 14 Items to make exactly 50+
  {
    slug: "pro-wireless-gaming-headset-surround-sound",
    title: "Apex 7.1 Spatial Surround Sound Pro Wireless Gaming Headset",
    category: "Audio & Headphones",
    categoryName: "Audio & Headphones",
    shortDescription: "Ultra-low 15ms wireless latency, detachable broadcast mic, and breathable cooling gel earcups.",
    description: "Hear every enemy footstep and reload before they see you. Compatible with PC, PS5, Xbox, and Nintendo Switch with 30-hour battery life.",
    price: 13500,
    salePrice: 10499,
    discountPercent: 22,
    stock: 25,
    rating: 4.8,
    numReviews: 32,
    image: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Obsidian Black", "Cyber White"] }],
    specifications: [
      { title: "Latency", value: "15ms Ultra-Low 2.4GHz Dongle" },
      { title: "Compatibility", value: "PC, PS5, Switch, Mobile" }
    ],
    tags: ["gaming", "headset", "audio", "surround"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "smart-anti-loss-airtag-compatible-key-organizer",
    title: "Titanium Anti-Loss Slim Key Organizer with Multitool",
    category: "Accessories",
    categoryName: "Accessories",
    shortDescription: "Silently organizes up to 8 keys with built-in bottle opener and hidden Apple AirTag tracker compartment.",
    description: "End key jingle forever. Crafted from aircraft-grade aluminum alloy with rubber O-ring washers for frictionless key rotation.",
    price: 2800,
    salePrice: 2199,
    discountPercent: 21,
    stock: 60,
    rating: 4.7,
    numReviews: 55,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Matte Black", "Desert Tan"] }],
    specifications: [
      { title: "Capacity", value: "2 to 8 Standard Door Keys" }
    ],
    tags: ["keychain", "organizer", "edc", "accessories"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false
  },
  {
    slug: "cordura-waterproof-travel-toiletries-dopp-kit",
    title: "Expedition 1000D Cordura Waterproof Dopp Kit Toiletry Bag",
    category: "Accessories",
    categoryName: "Accessories",
    shortDescription: "Wipeable waterproof TPU lining, dual side tooth brush slots, and hanging hook for hotel bathrooms.",
    description: "Keeps your liquids and cologne isolated from clothes. Built from heavy Cordura ballistic fabric that repels water and prevents spills.",
    price: 3600,
    salePrice: 2799,
    discountPercent: 22,
    stock: 35,
    rating: 4.9,
    numReviews: 40,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Tactical Black", "Ranger Green"] }],
    specifications: [
      { title: "Lining", value: "Leakproof TPU Easy-Wipe Membrane" }
    ],
    tags: ["doppkit", "travel", "toiletry", "bag"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "leather-desk-pad-extra-large-mouse-mat",
    title: "Executive Dual-Sided PU Leather XXL Desk Mat & Mousepad",
    category: "Accessories",
    categoryName: "Accessories",
    shortDescription: "90cm x 40cm large surface area, water-resistant wipeable finish, and stitched edge perimeter.",
    description: "Elevates any desk setup. Protects your wood or glass table against cup rings, keyboard scratches, and laptop heat.",
    price: 3200,
    salePrice: 2499,
    discountPercent: 22,
    stock: 50,
    rating: 4.8,
    numReviews: 62,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Midnight Black", "Forest Green", "Dark Brown"] }],
    specifications: [
      { title: "Dimensions", value: "900mm x 400mm x 2mm" }
    ],
    tags: ["deskpad", "mousepad", "office", "leather"],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "carbon-fiber-aerospace-metal-money-clip",
    title: "Aerospace Matte Carbon Fiber Minimalist Slim Money Clip",
    category: "Accessories",
    categoryName: "Accessories",
    shortDescription: "Real 3K weave carbon fiber with high-tension spring retention holds up to 30 bills tightly.",
    description: "Weighs only 10 grams. Won't trigger airport metal detectors and snaps back to original shape even after holding bulky cash.",
    price: 2400,
    salePrice: 1899,
    discountPercent: 21,
    stock: 50,
    rating: 4.7,
    numReviews: 47,
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=80"
    ],
    variants: [{ name: "Finish", options: ["Glossy Twill", "Matte Stealth"] }],
    specifications: [
      { title: "Weight", value: "10g Featherweight" }
    ],
    tags: ["moneyclip", "carbonfiber", "edc", "accessories"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false
  },
  {
    slug: "premium-braided-nylon-usb-c-to-usb-c-240w-cable",
    title: "Heavy-Duty 240W USB-C to USB-C Fast Charging 2M Braided Cable",
    category: "Electronics",
    categoryName: "Electronics",
    shortDescription: "Supports 240W Power Delivery 3.1 charging with E-Marker smart chip and zinc-alloy connector housings.",
    description: "Charges MacBooks, gaming laptops, iPads, and Android flagships at maximum potential speed. Tested to withstand 30,000+ bends.",
    price: 2200,
    salePrice: 1699,
    discountPercent: 23,
    stock: 70,
    rating: 4.9,
    numReviews: 95,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1200&q=80"
    ],
    variants: [{ name: "Length", options: ["1.2 Meter", "2.0 Meter"] }],
    specifications: [
      { title: "Max Power", value: "240W (48V / 5A) PD 3.1" },
      { title: "Data Transfer", value: "480 Mbps USB 2.0" }
    ],
    tags: ["cable", "usbc", "fastcharge", "tech"],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "active-fit-breathable-running-gym-cap",
    title: "Apex Laser-Perforated Quick-Dry Athletic Gym Cap",
    category: "Fashion & Apparel",
    categoryName: "Fashion & Apparel",
    shortDescription: "Moisture-wicking technical fabric, laser-cut ventilation zones, and adjustable reflective rear strap.",
    description: "Ultra-lightweight 50g sports cap designed for running in intense summer heat without trapping sweat.",
    price: 2400,
    salePrice: 1799,
    discountPercent: 25,
    stock: 40,
    rating: 4.8,
    numReviews: 38,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Matte Black", "Reflective White"] }],
    specifications: [
      { title: "Weight", value: "52 grams" }
    ],
    tags: ["cap", "running", "athletic", "hat"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "vintage-canvas-field-jacket-with-corduroy-collar",
    title: "Heritage 14oz Waxed Canvas Hunting Field Jacket",
    category: "Fashion & Apparel",
    categoryName: "Fashion & Apparel",
    shortDescription: "Water-shedding waxed finish, antique brass snap closures, and fine wale corduroy collar.",
    description: "Rugged British countryside heritage. Features 4 roomy bellows pockets, plaid flannel lining, and bi-swing back for shoulder movement.",
    price: 13500,
    salePrice: 10499,
    discountPercent: 22,
    stock: 14,
    rating: 5.0,
    numReviews: 21,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80"
    ],
    variants: [
      { name: "Size", options: ["M", "L", "XL"] },
      { name: "Color", options: ["Field Olive", "Tobacco Brown"] }
    ],
    specifications: [
      { title: "Canvas", value: "14oz Waxed Duck Canvas" }
    ],
    tags: ["fieldjacket", "waxedcanvas", "outerwear", "vintage"],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "ultra-comfort-memory-foam-house-slides",
    title: "CloudPuff Ergonomic Recovery Memory Foam Slides",
    category: "Footwear",
    categoryName: "Footwear",
    shortDescription: "4.5cm thick cushioned EVA rebound platform, contoured arch support, and non-slip bottom texture.",
    description: "Feel like you're stepping on clouds after strenuous workouts or long days on your feet. Completely waterproof and washable.",
    price: 3500,
    salePrice: 2699,
    discountPercent: 23,
    stock: 50,
    rating: 4.9,
    numReviews: 73,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1200&q=80"
    ],
    variants: [{ name: "Size (EU)", options: ["40-41", "42-43", "44-45"] }],
    specifications: [
      { title: "Sole Thickness", value: "4.5cm Cloud Cushion" }
    ],
    tags: ["slides", "slippers", "comfort", "footwear"],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "pure-matte-hair-clay-strong-hold-texturizer",
    title: "Artisan Sea Salt & Bentonite Matte Hair Clay (100g)",
    category: "Fragrances",
    categoryName: "Fragrances",
    shortDescription: "Zero shine dry textured finish, pliable all-day high hold, washes out effortlessly with water.",
    description: "Formulated with organic beeswax, bentonite clay, and infused with bergamot and cedarwood essential oils. Adds immense volume to flat hair.",
    price: 2400,
    salePrice: 1899,
    discountPercent: 21,
    stock: 45,
    rating: 4.8,
    numReviews: 54,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&q=80"
    ],
    variants: [{ name: "Hold", options: ["High Hold Matte", "Medium Flexible"] }],
    specifications: [
      { title: "Finish", value: "Zero Shine Natural Matte" },
      { title: "Net Weight", value: "100 grams" }
    ],
    tags: ["hairclay", "styling", "grooming", "matte"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false
  },
  {
    slug: "travel-foldable-magnetic-3-in-1-wireless-charger",
    title: "Voyager Foldable 3-in-1 Magnetic Travel Charging Station",
    category: "Electronics",
    categoryName: "Electronics",
    shortDescription: "Charges phone (15W), smartwatch (5W), and earbuds (5W) simultaneously. Folds flat to wallet size.",
    description: "The ultimate travel charging accessory. Eliminates tangled cables in hotel rooms with magnetic alignment and soft touch silicone body.",
    price: 6800,
    salePrice: 5199,
    discountPercent: 24,
    stock: 30,
    rating: 4.9,
    numReviews: 46,
    image: "https://images.unsplash.com/photo-1609592807664-877f0a99676e?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1609592807664-877f0a99676e?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Matte Black", "Clean White"] }],
    specifications: [
      { title: "Input", value: "9V/2A, 12V/2A Type-C" }
    ],
    tags: ["wirelesscharger", "travel", "magsafe", "tech"],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "military-grade-anti-drop-magsafe-phone-case",
    title: "ArmorShield Aramid Carbon Fiber Shockproof MagSafe Phone Case",
    category: "Accessories",
    categoryName: "Accessories",
    shortDescription: "Real 600D aerospace aramid fiber with CNC aluminum camera ring and 10ft drop certification.",
    description: "Paper-thin yet 5x stronger than steel. Provides tactile non-slip grip without adding bulk or interfering with wireless NFC signals.",
    price: 3600,
    salePrice: 2799,
    discountPercent: 22,
    stock: 60,
    rating: 4.8,
    numReviews: 67,
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=80"
    ],
    variants: [{ name: "Model", options: ["iPhone 15 / 16 Series", "Galaxy S24 Ultra"] }],
    specifications: [
      { title: "Material", value: "100% Aerospace 600D Aramid Fiber" }
    ],
    tags: ["case", "phonecase", "aramid", "magsafe"],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    slug: "tactical-crossbody-edc-sling-bag",
    title: "Apex Tactical Waterproof Sling Bag with Molle Webbing",
    category: "Accessories",
    categoryName: "Accessories",
    shortDescription: "Ambidextrous quick-release shoulder strap, concealed carry pocket, and water-repellent zippers.",
    description: "Compact chest and back pack for daily essentials (phone, keys, sunglasses, powerbank, passport). Keeps hands 100% free.",
    price: 5200,
    salePrice: 3999,
    discountPercent: 23,
    stock: 35,
    rating: 4.8,
    numReviews: 43,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80"
    ],
    variants: [{ name: "Color", options: ["Tactical Black", "Desert Sand", "Camo Multicam"] }],
    specifications: [
      { title: "Material", value: "900D High-Density Oxford" }
    ],
    tags: ["slingbag", "tactical", "crossbody", "edc"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    slug: "heavyweight-thermal-waffle-knit-long-sleeve-tee",
    title: "Thermal Waffle-Knit Heavyweight Cotton Long Sleeve Shirt",
    category: "Fashion & Apparel",
    categoryName: "Fashion & Apparel",
    shortDescription: "320 GSM textured thermal waffle weave with ribbed cuffs and vintage collar trim.",
    description: "The ideal cold-weather base layer or standalone piece. Breathable honeycomb knit traps body heat while remaining naturally flexible.",
    price: 4200,
    salePrice: 3299,
    discountPercent: 21,
    stock: 40,
    rating: 4.9,
    numReviews: 37,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=80"
    ],
    variants: [
      { name: "Size", options: ["M", "L", "XL", "XXL"] },
      { name: "Color", options: ["Oatmeal Heather", "Charcoal Black"] }
    ],
    specifications: [
      { title: "GSM", value: "320 GSM Heavyweight Thermal" }
    ],
    tags: ["thermal", "waffle", "longsleeve", "apparel"],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  }
];

async function run() {
  console.log("🚀 Starting 50 Products Population Script for MySQL...");
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  console.log(`Connected to MySQL DB: ${DB_NAME}`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const p of PRODUCTS_50) {
    const [existing] = await conn.query("SELECT id FROM products WHERE slug = ? LIMIT 1", [p.slug]);
    const imagesJson = JSON.stringify(p.images);
    const variantsJson = JSON.stringify(p.variants);
    const specificationsJson = JSON.stringify(p.specifications);
    const tagsJson = JSON.stringify(p.tags);

    if (existing.length === 0) {
      await conn.query(
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
          imagesJson,
          variantsJson,
          specificationsJson,
          tagsJson,
          p.isFeatured ? 1 : 0,
          p.isBestSeller ? 1 : 0,
          p.isNewArrival ? 1 : 0,
        ]
      );
      insertedCount++;
    } else {
      // Update image, specs, and fields to make sure high quality pictures and details are active
      await conn.query(
        `UPDATE products SET
          title = ?, category = ?, categoryName = ?, shortDescription = ?, description = ?,
          price = ?, salePrice = ?, discountPercent = ?, stock = ?, inStock = TRUE,
          rating = ?, numReviews = ?, image = ?, imagesJson = ?, variantsJson = ?,
          specificationsJson = ?, tagsJson = ?, isFeatured = ?, isBestSeller = ?, isNewArrival = ?
         WHERE slug = ?`,
        [
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
          imagesJson,
          variantsJson,
          specificationsJson,
          tagsJson,
          p.isFeatured ? 1 : 0,
          p.isBestSeller ? 1 : 0,
          p.isNewArrival ? 1 : 0,
          p.slug,
        ]
      );
      updatedCount++;
    }
  }

  const [totalRows] = await conn.query("SELECT COUNT(*) AS total FROM products");
  console.log(`✅ Finished! Inserted: ${insertedCount}, Updated: ${updatedCount}. Total products now in MySQL: ${totalRows[0].total}`);
  await conn.end();
}

run().catch((err) => {
  console.error("❌ Population Error:", err);
  process.exit(1);
});
