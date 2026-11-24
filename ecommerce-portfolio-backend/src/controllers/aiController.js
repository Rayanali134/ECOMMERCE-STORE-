const mongoose = require("mongoose");
const Product = require("../models/Product");
const StoreSettings = require("../models/StoreSettings");

let mysqlModule = null;
try {
  mysqlModule = require("../config/mysql");
} catch {
  // MySQL module fallback
}

// Fallback catalog used only if MongoDB is temporarily offline or has 0 products
const FALLBACK_PRODUCTS = [
  {
    _id: "aura-pro-wireless-headphones",
    title: "Aura Pro Wireless Noise-Cancelling Headphones",
    slug: "aura-pro-wireless-headphones",
    shortDescription:
      "Studio-grade audio with active hybrid noise cancellation, 40-hour battery life, and ultra-plush memory foam earcups.",
    price: 18500,
    salePrice: 14999,
    stock: 25,
    categoryName: "Electronics & Audio",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    ],
    variants: [
      { name: "Color", options: ["Matte Black", "Silver Frost", "Midnight Blue"] },
    ],
    specifications: [
      { title: "Battery Life", value: "40 Hours Non-Stop Playback" },
      { title: "Bluetooth Version", value: "5.3 Ultra Low Latency" },
      { title: "Noise Cancellation", value: "Hybrid Active ANC (-38dB)" },
      { title: "Warranty", value: "1 Year Official Brand Warranty" },
    ],
    tags: ["headphones", "wireless", "audio", "bluetooth", "earphones", "music", "anc"],
    rating: 4.9,
    isFeatured: true,
  },
  {
    _id: "classic-chronograph-leather-watch",
    title: "Classic Chronograph Leather Watch",
    slug: "classic-chronograph-leather-watch",
    shortDescription:
      "Timeless Japanese quartz chronograph movement encased in 316L stainless steel with genuine Italian leather strap.",
    price: 12500,
    salePrice: 9999,
    stock: 18,
    categoryName: "Watches & Accessories",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    ],
    variants: [
      { name: "Dial Color", options: ["Emerald Green", "Obsidian Black", "Arctic White"] },
      { name: "Strap", options: ["Brown Italian Leather", "Black Italian Leather"] },
    ],
    specifications: [
      { title: "Movement", value: "Japanese Precision Quartz Chronograph" },
      { title: "Case Diameter", value: "42mm (316L Stainless Steel)" },
      { title: "Water Resistance", value: "5 ATM (50m Splash & Rain Proof)" },
      { title: "Glass", value: "Anti-Scratch Sapphire Crystal" },
      { title: "Warranty", value: "1 Year Movement Warranty" },
    ],
    tags: ["watch", "ghari", "luxury", "accessories", "leather", "chronograph", "watches"],
    rating: 4.8,
    isFeatured: true,
  },
  {
    _id: "apex-velocity-running-shoes",
    title: "Apex Velocity Performance Running Shoes",
    slug: "apex-velocity-running-shoes",
    shortDescription:
      "Breathable engineered flymesh upper with responsive carbon-infused air-foam dual density sole for maximum energy return.",
    price: 14500,
    salePrice: 11999,
    stock: 30,
    categoryName: "Footwear & Sneakers",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    ],
    variants: [
      { name: "Size (EU)", options: ["40", "41", "42", "43", "44", "45"] },
      { name: "Color", options: ["Crimson Red", "Triple Black", "Ghost White"] },
    ],
    specifications: [
      { title: "Upper Material", value: "Breathable Engineered Flymesh" },
      { title: "Cushioning", value: "Dual-Density Air-Foam Sole" },
      { title: "Weight", value: "Ultra-Light 240g (Size 42)" },
      { title: "Usage", value: "Running, Gym & Casual Streetwear" },
    ],
    tags: ["shoes", "sneakers", "jootay", "joggers", "sports", "running", "footwear"],
    rating: 4.9,
    isFeatured: true,
  },
  {
    _id: "oversized-heavyweight-hoodie",
    title: "Oversized Heavyweight Cotton Hoodie",
    slug: "oversized-heavyweight-hoodie",
    shortDescription:
      "450 GSM French Terry 100% organic cotton hoodie with dropped shoulders and relaxed boxy streetwear fit.",
    price: 6500,
    salePrice: 4999,
    stock: 45,
    categoryName: "Men's Apparel",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
    ],
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL", "XXL"] },
      { name: "Color", options: ["Washed Black", "Heather Grey", "Sandstone Beige"] },
    ],
    specifications: [
      { title: "Fabric", value: "100% Organic French Terry Cotton (450 GSM Heavyweight)" },
      { title: "Fit", value: "Relaxed Boxy Streetwear Fit" },
      { title: "Hood", value: "Double-Layered Structured Hood" },
      { title: "Care", value: "Pre-Shrunk, Machine Wash Cold" },
    ],
    tags: ["hoodie", "clothes", "kapray", "shirt", "jacket", "streetwear", "apparel", "winter", "fashion"],
    rating: 5.0,
    isFeatured: true,
  },
];

const DEFAULT_SETTINGS = {
  storeName: "EcoStore",
  whatsappNumber: "+92 321 3633473",
  contactPhone: "+92 321 3633473",
  contactEmail: "rayanali0560@gmail.com",
  shippingFee: 200,
  freeShippingThreshold: 3000,
  returnPolicyDays: 7,
  returnPolicyText:
    "We offer a hassle-free 7-day return & exchange policy on all items in original packaging.",
};

function getEffectivePrice(p) {
  return p.salePrice && Number(p.salePrice) < Number(p.price)
    ? Number(p.salePrice)
    : Number(p.price || 0);
}

function formatRs(num) {
  return "Rs. " + Number(num || 0).toLocaleString();
}

// Detect if user is writing in Roman Urdu
function isRomanUrdu(text) {
  const lower = text.toLowerCase();
  const urduHints = [
    "mujhe", "mjhe", "chahiye", "chahie", "dikhao", "batao", "btain", "kitne",
    "kitna", "kya", "kaya", "hai", "ha", "mein", "ma", "ke", "ka", "ki", "andar",
    "tak", "sasta", "sasti", "behtareen", "acha", "achi", "wapis", "mil", "milega",
    "salam", "assalam", "bhai", "yar", "ghari", "jootay", "kapray", "paisay", "qimat",
    "kaise", "kesa", "kahan", "kab", "shukriya", "meharbani", "toota", "galat", "khul",
    "kar", "sakta", "sakti", "bhej", "mangwana", "lena", "kharidna", "nahi", "haan",
  ];
  const words = lower.split(/\W+/);
  return urduHints.some((w) => words.includes(w));
}

// Extract min/max budget from natural text (e.g. "5000 tak", "under 10k", "3000 to 8000", "10000 k andar")
function extractBudget(text) {
  const cleaned = text.toLowerCase().replace(/,/g, "");

  // Normalize "10k" / "5.5k" -> 10000 / 5500 (only for numbers < 500 so Roman Urdu "10000 k andar" stays 10000!)
  const normalized = cleaned.replace(/\b(\d{1,3}(?:\.\d+)?)\s*k\b/g, (full, n) => {
    const val = parseFloat(n);
    return val < 500 ? String(Math.round(val * 1000)) : full;
  });

  // Check range: "3000 to 8000", "3000 - 8000", "between 3000 and 8000", "3000 se 8000"
  const rangeMatch = normalized.match(
    /(\d{3,6})\s*(?:-|to|se|and|ta)\s*(\d{3,6})/
  );
  if (rangeMatch) {
    const a = parseInt(rangeMatch[1], 10);
    const b = parseInt(rangeMatch[2], 10);
    if (a >= 300 && b >= 300) {
      return {
        minBudget: Math.min(a, b),
        maxBudget: Math.max(a, b),
      };
    }
  }

  // Check "above / over / se zyada"
  const minMatch = normalized.match(
    /(?:above|over|more than|minimum|min|se zyada|se upar)\s*(?:rs\.?|pkr)?\s*(\d{3,6})/
  );
  if (minMatch) {
    return { minBudget: parseInt(minMatch[1], 10), maxBudget: null };
  }

  // Only treat standalone numbers as budget if NOT part of a phone number, order ID, or year alone
  const withoutIds = normalized
    .replace(/\b(?:ord|sup)-\d{8}-[a-z0-9]+\b/gi, "")
    .replace(/\b03\d{9}\b/g, "")
    .replace(/\b923\d{9}\b/g, "");

  const nums = [];
  const numRegex = /\b(\d{3,6})\b/g;
  let m;
  while ((m = numRegex.exec(withoutIds)) !== null) {
    const val = parseInt(m[1], 10);
    if (val >= 300 && val <= 500000) {
      nums.push(val);
    }
  }

  if (nums.length > 0) {
    return { minBudget: null, maxBudget: nums[0] };
  }

  return { minBudget: null, maxBudget: null };
}

// Product & category synonyms (English + Roman Urdu)
const KEYWORD_MAP = {
  watch: ["watch", "watches", "smartwatch", "chronograph", "ghari", "ghadi", "timepiece", "strap", "dial"],
  audio: ["headphone", "headphones", "earbuds", "airpods", "audio", "speaker", "wireless", "bluetooth", "handsfree", "music", "earphone", "earphones", "anc"],
  shoes: ["shoe", "shoes", "sneaker", "sneakers", "joota", "jootay", "jote", "footwear", "joggers", "running", "boot", "boots", "trainer"],
  apparel: ["hoodie", "hoodies", "shirt", "tshirt", "jacket", "kapray", "kapre", "clothes", "clothing", "apparel", "fashion", "wear", "cotton", "winter", "sweater", "streetwear"],
  accessories: ["accessory", "accessories", "wallet", "belt", "bag", "sunglasses", "leather", "electronics", "gadget", "gadgets"],
};

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "have", "has", "had",
  "was", "were", "are", "you", "your", "can", "could", "would", "should",
  "will", "what", "when", "where", "who", "whom", "why", "how", "which",
  "about", "into", "over", "after", "before", "between", "under", "above",
  "not", "all", "any", "some", "more", "most", "very", "just", "only",
  "also", "than", "then", "there", "their", "they", "them", "been", "being",
  "does", "did", "doing", "done", "won", "win", "get", "got", "give", "tell",
  "show", "need", "want", "please", "plz", "pls", "like", "good", "best",
  "kya", "kaya", "hai", "hain", "aur", "par", "mein", "tum", "aap", "hum",
  "woh", "yeh", "mujhe", "chahiye", "dikhao", "batao", "bhai", "yar", "yaar",
  "kar", "karo", "kaisa", "kaise", "aaj", "kal", "kab", "kahan", "kitna",
  "kitne", "nahi", "haan", "wala", "wali", "wale", "liye", "tak", "andar",
]);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scoreProduct(product, queryLower) {
  let score = 0;
  const searchable = [
    product.title,
    product.categoryName,
    product.shortDescription,
    product.description,
    ...(product.tags || []),
    ...(product.specifications || []).map((s) => `${s.title} ${s.value}`),
    ...(product.variants || []).map((v) => `${v.name} ${(v.options || []).join(" ")}`),
  ]
    .join(" ")
    .toLowerCase();

  const words = queryLower
    .split(/\W+/)
    .filter((w) => w.length >= 3 && !/^\d+$/.test(w) && !STOP_WORDS.has(w));

  for (const word of words) {
    const wordRe = new RegExp(`\\b${escapeRegex(word)}s?\\b`, "i");
    if (wordRe.test(searchable)) {
      score += 4;
    }
    for (const group of Object.values(KEYWORD_MAP)) {
      if (group.includes(word)) {
        if (group.some((syn) => new RegExp(`\\b${escapeRegex(syn)}\\b`, "i").test(searchable))) {
          score += 5;
        }
      }
    }
  }

  return score;
}

function serializeProductCard(p) {
  const effectivePrice = getEffectivePrice(p);
  const regularPrice = Number(p.price || effectivePrice);
  const discountPercent =
    regularPrice > effectivePrice
      ? Math.round(((regularPrice - effectivePrice) / regularPrice) * 100)
      : 0;

  return {
    id: String(p._id || p.id || p.slug),
    slug: p.slug || String(p._id || ""),
    title: p.title,
    category: p.categoryName || "Store Item",
    price: regularPrice,
    salePrice: p.salePrice || null,
    effectivePrice,
    discountPercent,
    stock: p.stock ?? 10,
    rating: p.rating || 4.8,
    image: p.images?.[0] || "",
    shortDescription: p.shortDescription || "",
    variants: p.variants || [],
    specifications: p.specifications || [],
  };
}

// =========================================================================
// 100+ E-COMMERCE QUESTIONS KNOWLEDGE BASE (Professional & Courteous Answers)
// =========================================================================
function matchStoreKnowledgeBase(lower, settings, urdu) {
  const kb = [
    // 1. Damaged / Wrong / Defective Item Received
    {
      pattern: /(damage|damaged|broken|toota|tuta|defect|defective|faulty|wrong item|galat item|galat cheez|missing item|kharab|kam item|not working|kaam nahi)/,
      reply: urdu
        ? `📦 **Damaged ya Galat Item Receive Hua?** Fikar bilkul na karein, aapka order 100% protected hai!\n\n**Tariqa-e-Kaar (3 Simple Steps):**\n1. Parcel box aur item ki **photo ya choti unboxing video** bana lein.\n2. Hamare WhatsApp helpline **${settings.whatsappNumber}** par apna Order ID (ORD-...) bhej dein.\n3. Hamari team foran **Bilkul FREE Replacement** arrange karegi ya aapko **100% Full Refund** issue kar diya jayega.\n\nCourier rider naya parcel le kar aayega aur damaged item wapis collect kar lega.`
        : `📦 **Received a Damaged, Faulty, or Incorrect Item?** Don't worry — you are 100% protected by our Buyer Guarantee!\n\n**Resolution Steps:**\n1. Take a quick photo or short video of the damaged item & parcel packaging.\n2. Message our priority helpline on WhatsApp (**${settings.whatsappNumber}**) with your Order Number.\n3. We will immediately arrange a **FREE replacement dispatch** or issue a **100% full refund** — no extra fees charged!`,
      quickReplies: ["7-Day Return Policy?", "Refund kitne time me milega?", "Direct WhatsApp Support"],
    },

    // 2. Refund Timing & Method
    {
      pattern: /(refund|paisay wapis|paise wapis|money back|cash back|refund time|kab milega refund|refund method)/,
      reply: urdu
        ? `💸 **Refund Policy & Payment Timing:**\n\n• **Timing:** Return parcel hamare warehouse receive aur inspect hone ke **24 se 48 ghanton (1–2 working days)** ke andar refund transfer kar diya jata hai.\n• **Payment Methods:** Aap apni marzi se **JazzCash, EasyPaisa, SadaPay, NayaPay, ya Direct Bank Transfer** par refund receive kar sakte hain.\n• **Status Update:** Refund transaction ki digital receipt WhatsApp par share ki jati hai.\n\nRabta Helpline: **${settings.whatsappNumber}**`
        : `💸 **Refund Timelines & Payment Methods:**\n\n• **Processing Time:** Once your returned item arrives at our facility, refunds are processed within **24–48 hours (1–2 business days)**.\n• **Supported Channels:** Receive your funds via **JazzCash, EasyPaisa, SadaPay, NayaPay, or direct Bank Transfer**.\n• **Confirmation:** You'll receive an official payment transfer receipt on WhatsApp.\n\nHelpline: **${settings.whatsappNumber}**`,
      quickReplies: ["7-Day Return Policy?", "Exchange kaise karein?", "Cash on Delivery details?"],
    },

    // 3. Return & Exchange Policy
    {
      pattern: /(return|exchange|wapis|replace|replacement|size change|pasand na|policy|change karna)/,
      reply: urdu
        ? `🔄 **${settings.returnPolicyDays}-Day Hassle-Free Return & Exchange Policy:**\n\n• **Time Limit:** Delivery receive hone ke **${settings.returnPolicyDays} din** ke andar aap return ya size/color exchange karwa sakte hain.\n• **Condition:** Product unused ho aur original box/tags sath hon.\n• **No Questions Asked:** Agar size issue ho ya item pasand na aaye, tab bhi exchange ho jata hai.\n\n**Process:** Neeche form me **"7-Day Return"** select karein ya seedha WhatsApp **${settings.whatsappNumber}** par apna Order ID bhej kar claim karein.`
        : `🔄 **${settings.returnPolicyDays}-Day Hassle-Free Return & Exchange Guarantee:**\n\n• **Eligibility:** You can return or exchange any item within **${settings.returnPolicyDays} days** of receiving your package.\n• **Condition:** Items must be in original condition with intact packaging and tags.\n• **Easy Exchange:** Size too big/small? We'll swap it for your preferred size smoothly.\n\n**To Initiate:** Select **"7-Day Return"** in the form below or message WhatsApp (**${settings.whatsappNumber}**) with your Order ID!`,
      quickReplies: ["Refund kitne din me milta hai?", "Damaged item claim?", "Delivery charges?"],
    },

    // 4. Open Parcel / Check Before Pay
    {
      pattern: /(open parcel|check before|khol kar|kholke|parcel check|dekh kar paise|check karke)/,
      reply: urdu
        ? `📦 **Parcel Inspection & Open Parcel Policy:**\n\n• Hamara har parcel dispatch hone se pehle **Double Quality Check (QC)** se guzarta hai.\n• Courier SOPs ke mutabiq rider payment receive karne ke baad parcel hand over karta hai.\n• **Lekin aap 100% mehfooz hain:** Delivery ke foran baad parcel open karein — agar 1% bhi koi masla ho, to hamari **${settings.returnPolicyDays}-Day Full Return, Exchange & Refund Guarantee** active hai!\n\nHelpline: WhatsApp **${settings.whatsappNumber}**`
        : `📦 **Parcel Inspection & Buyer Assurance:**\n\n• Every item undergoes strict double inspection before sealing and courier dispatch.\n• Per standard courier regulations, cash is handed over upon delivery, but you are protected by our **${settings.returnPolicyDays}-Day Money Back Guarantee**.\n• Open your package upon receiving — if anything isn't 100% as expected, we replace or refund immediately via WhatsApp (**${settings.whatsappNumber}**)!`,
      quickReplies: ["7-Day Return Policy?", "Payment methods?", "Show best deals"],
    },

    // 5. Payment Methods (COD, JazzCash, EasyPaisa, Bank, Card, Advance)
    {
      pattern: /\b(payment|payments|cod|cash on delivery|jazzcash|easypaisa|sadapay|nayapay|bank transfer|credit card|debit card|advance payment|online payment|online pay|paise kaise|pay kaise)\b/,
      reply: urdu
        ? `💳 **Hamare Paas Tamam Payment Options Available Hain:**\n\n1. **Cash on Delivery (COD):** Pure Pakistan me available hai — parcel ghar aane par rider ko cash pay karein (Koi advance zaroori nahi!).\n2. **Digital Wallets:** **JazzCash & EasyPaisa** ke zariye direct transfer kar sakte hain.\n3. **Bank Transfer / Cards:** **SadaPay, NayaPay, aur Online Banking** support ki jati hai.\n\nOnline account details lene ke liye WhatsApp: **${settings.whatsappNumber}**`
        : `💳 **Convenient Payment Methods Accepted:**\n\n1. **Cash on Delivery (COD):** Nationwide availability — pay in cash when the courier arrives at your doorstep (zero advance required).\n2. **Mobile Wallets:** Fast & direct transfers via **JazzCash and EasyPaisa**.\n3. **Digital Banking:** Direct transfers via **SadaPay, NayaPay, & all Pakistani Commercial Banks**.\n\nNeed bank details? Message us on WhatsApp: **${settings.whatsappNumber}**`,
      quickReplies: ["Delivery charges kya hain?", "Kitne din me parcel milega?", "Show products under Rs. 10,000"],
    },

    // 6. Order Cancellation or Address/Detail Change
    {
      pattern: /(cancel|cancel order|order cancel|address change|galat address|wrong address|change number|modify order|edit order)/,
      reply: urdu
        ? `✏️ **Order Cancel ya Details Change Karni Hain?**\n\n• Agar aapka order abhi dispatch nahi hua, to hum foran address, phone number ya item update/cancel kar sakte hain!\n• Bas apna **Order ID (ORD-...)** WhatsApp **${settings.whatsappNumber}** par bhej dein, ya neeche form me **"Order & Delivery"** ticket submit karein.`
        : `✏️ **Need to Cancel or Modify Your Order?**\n\n• As long as your package has not been handed over to the courier, we can immediately cancel it or update your address and contact details!\n• Send your **Order Number (ORD-...)** to WhatsApp (**${settings.whatsappNumber}**) or submit an **"Order & Delivery"** request below.`,
      quickReplies: ["Track my order", "7-Day Return Policy?", "Store contact info?"],
    },

    // 7. Order Tracking
    {
      pattern: /(track|tracking|order status|ord-|parcel kahan|kahan pahuncha|status check|dispatch|shipped)/,
      reply: urdu
        ? `📍 **Live Order Tracking:**\n\n• Apna Order Number (jaise \`ORD-20261118-XXXX\`) hamare **Track Order** page par enter karein — aapko real-time dispatch aur courier tracking status mil jayega.\n• Agar aap chahein to apna Order ID WhatsApp **${settings.whatsappNumber}** par bhejein, hamari team live location check karke batayegi.`
        : `📍 **Live Parcel & Order Tracking:**\n\n• Visit our dedicated **Track Order** page and enter your Order Number (e.g., \`ORD-20261118-XXXX\`) for instant courier milestone updates (*Pending ➔ Confirmed ➔ Shipped ➔ Delivered*).\n• Or WhatsApp your Order ID to **${settings.whatsappNumber}** for instant concierge checking!`,
      quickReplies: ["Delivery kitne din me hoti hai?", "Order cancel kaise karein?", "7-Day Return Policy?"],
    },

    // 8. Delivery Time, Cities & Shipping Charges
    {
      pattern: /(delivery|shipping|charges|fee|kitne din|how long|days|courier|tcs|leopards|postex|trax|lahore|karachi|islamabad|rawalpindi|faisalabad|multan|peshawar|quetta|sialkot|gujranwala|hyderabad|pakistan|village|same day|urgent|free delivery)/,
      reply: urdu
        ? `🚚 **Nationwide Delivery & Shipping Details:**\n\n• **Cities Covered:** Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Sialkot, Gujranwala, Hyderabad samait **pure Pakistan me 150+ shehron aur tehseels** me delivery hoti hai.\n• **Delivery Time:**\n  - Major Cities: **2 se 3 working days**\n  - Other Cities / Towns: **3 se 4 working days**\n• **Shipping Charges:** Flat **${formatRs(settings.shippingFee)}** — aur **${formatRs(settings.freeShippingThreshold)}** se baray orders par **BILKUL FREE DELIVERY!** 🎉\n• **Couriers:** Leopards, TCS, Trax, aur PostEx ke zariye safe dispatch.`
        : `🚚 **Nationwide Delivery & Shipping Information:**\n\n• **Coverage:** We deliver to **all cities and towns across Pakistan** (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Gujranwala, Sialkot, and more).\n• **Timeline:**\n  - Metro Cities: **2–3 business days**\n  - Other Regions: **3–4 business days**\n• **Shipping Charges:** Flat **${formatRs(settings.shippingFee)}** — and **FREE Delivery** automatically applies on orders over **${formatRs(settings.freeShippingThreshold)}**!\n• **Trusted Couriers:** Dispatched via TCS, Leopards, Trax, and PostEx with tracking.`,
      quickReplies: ["Cash on Delivery available?", "Track my order", "Best products under Rs. 5,000"],
    },

    // 9. How to Order / Checkout Steps
    {
      pattern: /(how to order|how to buy|order kaise|order kese|order karna|buy kaise|kharidna|mangwana|place order|checkout|add to cart)/,
      reply: urdu
        ? `🛒 **Order Place Karne Ka Nihayat Asaan Tariqa:**\n\n1. **Online Website Checkout (Fastest):**\n   - Product open karein ➔ Color/Size select karein ➔ **Add to Cart** dabayein ➔ **Checkout** page par apna naam, phone aur address likh kar **Cash on Delivery** confirm karein.\n2. **1-Click WhatsApp Order:**\n   - Kisi bhi product par **"Order via WhatsApp"** button click karein ya seedha **${settings.whatsappNumber}** par product ka naam bhej kar order confirm karwayein!`
        : `🛒 **How to Place Your Order in 30 Seconds:**\n\n1. **Seamless Website Checkout:**\n   - Choose your preferred Size/Color ➔ click **Add to Cart** ➔ proceed to **Checkout** and enter your delivery address with Cash on Delivery (COD).\n2. **1-Click WhatsApp Order:**\n   - Tap **"Order via WhatsApp"** on any product page or message **${settings.whatsappNumber}** directly with the product title!`,
      quickReplies: ["Show all products", "Best deals under Rs. 10,000", "Payment methods?"],
    },

    // 10. Sizes & Sizing Guide
    {
      pattern: /\b(size|sizes|sizing|size chart|fit|fitting|oversized|small|medium|large|xl|xxl|eu 40|eu 41|eu 42|eu 43|eu 44|eu 45|naap|measure|measurements)\b/,
      reply: urdu
        ? `📏 **Size & Fitting Guide:**\n\n• **Apparel / Hoodies:** Sizes **S, M, L, XL, XXL** available hain (450 GSM French Terry cotton, modern relaxed boxy streetwear fit).\n• **Footwear / Sneakers:** EU sizes **40, 41, 42, 43, 44, 45** available hain (ergonomic air-cushioned fit).\n• **Zero Risk:** Agar size mein 19-20 ka farq bhi ho to hamari **${settings.returnPolicyDays}-Day Free Size Exchange** facility maujood hai!\n\nExact measurement guide ke liye WhatsApp: **${settings.whatsappNumber}**`
        : `📏 **Size & Sizing Guide:**\n\n• **Apparel & Hoodies:** Available in sizes **S, M, L, XL, XXL** (comfortable, relaxed boxy streetwear drape).\n• **Footwear & Sneakers:** Available in EU sizes **40 through 45**.\n• **Worry-Free Sizing:** If the size isn't a perfect fit, our **${settings.returnPolicyDays}-Day Size Exchange Guarantee** covers you with an instant swap!\n\nNeed personal sizing advice? Message WhatsApp: **${settings.whatsappNumber}**`,
      quickReplies: ["Show Hoodies", "Show Running Shoes", "7-Day Return Policy?"],
    },

    // 11. Warranty, Authenticity & Quality
    {
      pattern: /(warranty|guarantee|garanti|original|authentic|real|fake|copy|quality|material|durable|waterproof|water resistant|battery|long lasting)/,
      reply: urdu
        ? `🛡️ **100% Quality & Authenticity Guarantee:**\n\n• **EcoStore** par har item premium grade aur factory-sealed hota hai — jo pictures aur specs mein mention hai, wahi exact product delivered hota hai.\n• **Electronics & Watches:** Up to **1 Year Official Warranty** shamil hai.\n• **Inspection:** Har order double check hokar courier packaging mein seal hota hai.\n• **Satisfaction:** **${settings.returnPolicyDays} Din** ki checking & return guarantee di jati hai.`
        : `🛡️ **100% Authenticity, Quality & Warranty:**\n\n• At **EcoStore**, all items are factory-fresh, premium-grade, and strictly inspected before packaging.\n• **Electronics & Watches:** Backed by **up to 1 Year official warranty**.\n• **Risk-Free:** Every order comes with our **${settings.returnPolicyDays}-Day Return & Refund Guarantee** for complete peace of mind.`,
      quickReplies: ["Headphones specs?", "Watch specs?", "7-Day Return Policy?"],
    },

    // 12. Discounts, Coupons, Sales & Bargains
    {
      pattern: /\b(discount|discounts|coupon|coupons|promo|promo code|discount code|voucher|sale|sales|offer|offers|deal|deals|kam karo|bargain|sasta karo|special price)\b/,
      reply: urdu
        ? `🏷️ **Active Store Discounts & Exclusive Deals:**\n\n• Hamare featured catalog par already **15% se 25% tak Direct Sale Discounts** active hain!\n• **Free Nationwide Delivery:** **${formatRs(settings.freeShippingThreshold)}** se baray tamam orders par delivery fee waived off hai.\n• **Bundle / Multi-Item Discount:** Agar aap **2 ya zyada products** le rahe hain, to extra discount ke liye direct WhatsApp **${settings.whatsappNumber}** par rabta karein!`
        : `🏷️ **Active Promotions & Special Savings:**\n\n• Enjoy **15%–25% OFF** across our featured catalog items with no coupon code required!\n• **FREE Shipping:** Automatically applied on all orders exceeding **${formatRs(settings.freeShippingThreshold)}**.\n• **Multi-Item Deals:** Purchasing 2 or more items? Message us on WhatsApp (**${settings.whatsappNumber}**) for an exclusive bundle discount!`,
      quickReplies: ["Best products under Rs. 5,000", "Bulk / Wholesale deals?", "Show all products"],
    },

    // 13. Bulk, Wholesale, Reseller & Dropshipping
    {
      pattern: /(bulk|wholesale|reseller|dropship|corporate|shopkeeper|zyada quantity|business|distributor|dealer)/,
      reply: urdu
        ? `🏢 **Bulk, Corporate & Wholesale Orders:**\n\n• Ji bilkul! Hum bulk buyers, corporate gifting, aur retail resellers ko **special discounted wholesale rates** provide karte hain.\n• Contact Form me **"Bulk & Wholesale"** select karein ya direct management se WhatsApp **${settings.whatsappNumber}** / Email **${settings.contactEmail}** par rabta karein.`
        : `🏢 **Bulk, Corporate & Wholesale Pricing:**\n\n• Yes! We offer wholesale pricing tiers for bulk quantities, corporate merchandise, and resellers.\n• Select **"Bulk & Wholesale"** in the Contact Form below, or speak directly with our team on WhatsApp (**${settings.whatsappNumber}**) or Email (**${settings.contactEmail}**).`,
      quickReplies: ["Show all products", "Delivery charges?", "Store contact info?"],
    },

    // 14. Gift Wrapping & Custom Requests
    {
      pattern: /(gift|birthday|anniversary|gift wrap|gift box|surprise|custom request|not listed|arrange kar|source|mangwa)/,
      reply: urdu
        ? `🎁 **Gifting & Custom Sourcing Service:**\n\n• **Gift Orders:** Checkout ke waqt Notes box me custom message likhein — hum premium packaging aur message card ke sath dispatch karenge!\n• **Custom Sourcing:** Agar koi aisa product chahiye jo store par listed nahi, to neeche **"Request a Product"** select karein ya WhatsApp **${settings.whatsappNumber}** par photo bhej dein — hum aapke budget ke mutabiq arrange kar denge!`
        : `🎁 **Gifting & Custom Sourcing Service:**\n\n• **Gift Packaging:** Adding a gift for someone? Leave your message in the Checkout Notes box and we'll package it with extra care.\n• **Custom Sourcing:** Want an item not listed on our store? Select **"Request a Product"** in the form below or WhatsApp **${settings.whatsappNumber}** with photos & your budget — we will source it for you!`,
      quickReplies: ["Watches under Rs. 10,000", "Best deals under Rs. 5,000", "WhatsApp support?"],
    },

    // 15. Store Contact Details, Phone, WhatsApp, Email, Location & Timings
    {
      pattern: /(contact|phone|number|whatsapp|email|gmail|mail|location|address|shop|store kahan|timing|hours|open|close|sunday|owner|admin|helpline|support)/,
      reply: urdu
        ? `📞 **${settings.storeName} Official Helpline & Support Channels:**\n\n• **WhatsApp & Phone Call:** **${settings.whatsappNumber}**\n• **Official Email:** **${settings.contactEmail}**\n• **Support Timings:** Monday – Saturday, **10:00 AM – 10:00 PM (PKT)**\n• **Online Orders:** 24/7 active — pure Pakistan me home delivery available hai!`
        : `📞 **${settings.storeName} Official Contact & Support Channels:**\n\n• **WhatsApp & Phone:** **${settings.whatsappNumber}**\n• **Official Email:** **${settings.contactEmail}**\n• **Support Hours:** Mon – Sat, **10:00 AM – 10:00 PM (PKT)**\n• **Online Flagship Store:** Open 24/7 with nationwide delivery!`,
      quickReplies: ["7-Day Return Policy?", "How to place an order?", "Show best products"],
    },

    // 16. Trust, Reviews & Safety
    {
      pattern: /(trust|trusted|scam|fraud|safe|legit|review|reviews|rating|customer feedback|genuine|bharosa)/,
      reply: urdu
        ? `⭐ **100% Trusted Store With Real Customer Reviews:**\n\n• Hamare customers ne humein **4.9/5 Average Rating** di hai!\n• **Zero Risk:** Aap **Cash on Delivery (COD)** par order kar sakte hain — parcel receive karke pay karein.\n• **Protection:** Har order ke sath **7-Day Return & Full Money-Back Guarantee** di jati hai.\n• Live Order Tracking aur WhatsApp helpline **${settings.whatsappNumber}** hamesha available hai.`
        : `⭐ **Why Shoppers Across Pakistan Trust ${settings.storeName}:**\n\n• Verified **4.9/5 customer satisfaction score** across Pakistan.\n• **Zero Financial Risk:** Safe Cash on Delivery (COD) right at your doorstep.\n• **Complete Protection:** Every order is backed by our **${settings.returnPolicyDays}-Day Return & Refund Guarantee**.\n• Official support: **${settings.whatsappNumber}**.`,
      quickReplies: ["Show best products", "7-Day Return Policy?", "Payment methods?"],
    },

    // 17. Support Ticket / Account Help
    {
      pattern: /(ticket|sup-|account|login|register|signup|password|complain|complaint|issue)/,
      reply: urdu
        ? `🎫 **Support Ticket & Live Concierge System:**\n\n• Contact Form submit karte hi aapko digital **Ticket ID (SUP-...)** mil jata hai.\n• Contact page ke right side par **"Check Ticket Reply"** box me Ticket ID daal kar aap hamari management ka live reply dekh sakte hain.\n• Urgent queries ke liye direct WhatsApp **${settings.whatsappNumber}** par rabta karein!`
        : `🎫 **Support Ticket & Live Concierge:**\n\n• When you submit our Contact Form, a unique **Ticket ID (SUP-...)** is instantly generated.\n• Use the **"Check Ticket Reply"** widget on the Contact page to view our official response live, or WhatsApp **${settings.whatsappNumber}** for priority resolution!`,
      quickReplies: ["Track my order", "7-Day Return Policy?", "Store contact info?"],
    },

    // 18. Stock & Availability
    {
      pattern: /(in stock|out of stock|available|availability|stock|mojood|maujood|restock|milega)/,
      reply: urdu
        ? `📦 **Live Store Inventory & Stock Status:**\n\n• Hamare website par listed tamam featured items **In Stock** aur 24 ghanton mein dispatch ke liye ready hain!\n• Kisi specific item (Watch, Headphones, Shoes, ya Hoodie) ka naam ya apna budget likhein — main live stock aur variants check karke foran bata dunga!`
        : `📦 **Live Inventory & Stock Availability:**\n\n• All active products featured on **${settings.storeName}** are **In Stock** and ready for dispatch within 24 hours!\n• Type any product name (Watch, Headphones, Shoes, Hoodie) to check its exact stock status and variants right now!`,
      quickReplies: ["Show all products", "Watches under Rs. 10,000", "Hoodies under Rs. 5,000"],
    },

    // 19. Thanks / Goodbye
    {
      pattern: /\b(thanks|thank you|thx|shukriya|meharbani|jazakallah|bye|goodbye|allah hafiz|khuda hafiz|ok thanks)\b/,
      reply: urdu
        ? `Bohat shukriya! 😊 **${settings.storeName}** par aane ka shukriya. Jab bhi kisi product, budget ya delivery ke bare mein poochhna ho to zaroor rabta karein — ya WhatsApp **${settings.whatsappNumber}** par message karein. Allah Hafiz!`
        : `You are very welcome! 😊 Thank you for choosing **${settings.storeName}**. Whenever you need product recommendations, budget matches, or order assistance, we are always here to help — or chat with us on WhatsApp at **${settings.whatsappNumber}**. Have a wonderful day!`,
      quickReplies: ["Show all products", "Best deals under Rs. 10,000", "7-Day Return Policy?"],
    },
  ];

  for (const item of kb) {
    if (item.pattern.test(lower)) {
      return item;
    }
  }
  return null;
}

// Optional: Call Google Gemini API if GEMINI_API_KEY is configured in .env
async function tryGeminiReply({ message, products, matchedProducts, settings, budget, urdu }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const catalogSummary = products
      .slice(0, 20)
      .map((p) => {
        const ep = getEffectivePrice(p);
        const specs = (p.specifications || [])
          .slice(0, 3)
          .map((s) => `${s.title}: ${s.value}`)
          .join(", ");
        const vars = (p.variants || [])
          .map((v) => `${v.name}: ${(v.options || []).join("/")}`)
          .join("; ");
        return `- ${p.title} | Category: ${p.categoryName} | Price: Rs.${ep} (Regular Rs.${p.price}) | Stock: ${p.stock} | Specs: ${specs} | Variants: ${vars}`;
      })
      .join("\n");

    const systemInstruction = `You are the official AI Shopping & Support Assistant ONLY for "${settings.storeName}".
Store Policies & Contact:
- Phone / WhatsApp: ${settings.whatsappNumber}
- Email: ${settings.contactEmail}
- Return Policy: ${settings.returnPolicyDays}-day hassle-free return & exchange.
- Shipping: Rs.${settings.shippingFee} flat delivery, FREE shipping on orders above Rs.${settings.freeShippingThreshold}. Nationwide Cash on Delivery (COD) in 2-4 days.

Live Store Catalog:
${catalogSummary}

STRICT RULES:
1. If the user's message is UNRELATED to this online store (e.g. politics, cricket, jokes, coding, weather, movies, homework, general trivia), DO NOT answer it. Reply ONLY with: "${
      urdu
        ? `⚠️ Maaf kijiye! Main sirf ${settings.storeName} ke products, prices, budget, orders, delivery aur ${settings.returnPolicyDays}-day return policy ke mutaliq madad kar sakta hun. Barah-e-karam store se related sawal poochein ya WhatsApp ${settings.whatsappNumber} par rabta karein.`
        : `⚠️ Sorry! I can only help with ${settings.storeName} products, prices, budgets, orders, shipping, and our ${settings.returnPolicyDays}-day return policy. Please ask a store-related question or contact us on WhatsApp at ${settings.whatsappNumber}.`
    }"
2. For store-related queries, reply in ${urdu ? "friendly, professional Roman Urdu" : "courteous, professional English"} in 3-5 well-structured sentences using ONLY real catalog data above.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${systemInstruction}\n\nCustomer Query: "${message}"\nDetected Budget: ${
                    budget.maxBudget
                      ? `Up to Rs.${budget.maxBudget}`
                      : budget.minBudget
                      ? `Above Rs.${budget.minBudget}`
                      : "Not specified"
                  }\nMatched Product Count: ${matchedProducts.length}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply ? reply.trim() : null;
  } catch (err) {
    console.error("Gemini API fallback triggered:", err.message);
    return null;
  }
}

// @desc    AI Store Shopping & Support Assistant (100+ Store Q&A + Strict Off-Topic Guardrail)
// @route   POST /api/ai/chat
// @access  Public
const chatWithStoreAI = async (req, res) => {
  try {
    const rawMessage = (req.body?.message || "").trim();
    const explicitBudget = req.body?.budget ? Number(req.body.budget) : null;

    if (!rawMessage) {
      return res.status(400).json({
        success: false,
        message: "Please type a message or question for the AI assistant.",
      });
    }

    // 1. Load live products & store settings from MySQL or MongoDB
    let products = [];
    let settings = { ...DEFAULT_SETTINGS };
    let usingLiveDB = false;

    // Check MySQL first (Active Primary Database)
    if (mysqlModule && mysqlModule.isMySQLConnected && mysqlModule.isMySQLConnected()) {
      try {
        const [myProducts, mySettings] = await Promise.all([
          mysqlModule.mysqlGetProducts ? mysqlModule.mysqlGetProducts({}) : null,
          mysqlModule.mysqlGetSettings ? mysqlModule.mysqlGetSettings() : null,
        ]);
        if (myProducts && myProducts.length > 0) {
          products = myProducts.map((p) => ({
            ...p,
            categoryName: p.categoryName || p.category || "Store Item",
            price: Number(p.price || 0),
            salePrice: p.salePrice ? Number(p.salePrice) : null,
            images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
          }));
          usingLiveDB = true;
        }
        if (mySettings) {
          settings = { ...DEFAULT_SETTINGS, ...mySettings };
        }
      } catch (mySqlErr) {
        console.error("AI MySQL load fallback:", mySqlErr.message);
      }
    }

    if (products.length === 0 && mongoose.connection.readyState === 1) {
      try {
        const [dbProducts, dbSettings] = await Promise.all([
          Product.find({ isActive: { $ne: false } })
            .sort({ isFeatured: -1, rating: -1 })
            .limit(50)
            .lean(),
          StoreSettings.findOne().lean(),
        ]);

        if (dbProducts && dbProducts.length > 0) {
          products = dbProducts;
          usingLiveDB = true;
        }
        if (dbSettings) {
          settings = { ...DEFAULT_SETTINGS, ...dbSettings };
        }
      } catch (dbErr) {
        console.error("AI DB Read fallback:", dbErr.message);
      }
    }

    if (products.length === 0) {
      products = FALLBACK_PRODUCTS;
    }

    const lower = rawMessage.toLowerCase();
    const urdu = isRomanUrdu(rawMessage);

    // =========================================================================
    // HEAVY FEATURE 1: LIVE ORDER TRACKING DIRECTLY IN AI CHAT
    // =========================================================================
    const orderMatch = rawMessage.match(/\b(ORD[-_]?\d{4,8}[-_]?[A-Z0-9]{3,6})\b/i);
    if (orderMatch && mysqlModule && mysqlModule.mysqlGetOrder) {
      const orderId = orderMatch[1].toUpperCase();
      const foundOrder = await mysqlModule.mysqlGetOrder(orderId);
      if (foundOrder) {
        const orderStatus = String(foundOrder.orderStatus || foundOrder.status || "confirmed").toLowerCase();
        const statusMap = {
          pending: "⏳ Pending Verification",
          confirmed: "✓ Confirmed & Queued",
          processing: "⚙️ Quality Check & Packing",
          shipped: "🚚 Dispatched via Courier",
          delivered: "🎉 Successfully Delivered",
          cancelled: "🛑 Order Cancelled",
        };

        const itemsSummary = (foundOrder.items || [])
          .map((it) => `• **${it.title}** (Qty: ${it.quantity}x) — Rs. ${Number(it.total || it.price * it.quantity).toLocaleString()}`)
          .join("\n");

        const reply = urdu
          ? `📦 **Live Order Tracking Update: #${foundOrder.orderNumber}**\n\n• **Current Status:** ${statusMap[orderStatus] || orderStatus.toUpperCase()}\n• **Customer Name:** ${foundOrder.customer?.name || "Customer"}\n• **Total Payable (COD):** **Rs. ${Number(foundOrder.totalAmount || 0).toLocaleString()}**\n• **Shipping Destination:** ${foundOrder.customer?.address || ""}, ${foundOrder.customer?.city || ""}\n${foundOrder.trackingNumber ? `• **Courier Tracking ID:** \`${foundOrder.trackingNumber}\`\n` : ""}• **Order Placed On:** ${new Date(foundOrder.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}\n\n**Order Contents:**\n${itemsSummary}\n\n*Aapka order 100% mehfooz hai aur hamari 7-Day Money-Back Guarantee ke teht protected hai!*`
          : `📦 **Live Order Tracking: #${foundOrder.orderNumber}**\n\n• **Milestone:** ${statusMap[orderStatus] || orderStatus.toUpperCase()}\n• **Customer:** ${foundOrder.customer?.name || "Customer"}\n• **Total Amount (COD):** **Rs. ${Number(foundOrder.totalAmount || 0).toLocaleString()}**\n• **Destination:** ${foundOrder.customer?.address || ""}, ${foundOrder.customer?.city || ""}\n${foundOrder.trackingNumber ? `• **Courier Tracking Number:** \`${foundOrder.trackingNumber}\`\n` : ""}• **Date:** ${new Date(foundOrder.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}\n\n**Items List:**\n${itemsSummary}\n\n*Protected by our 7-Day Doorstep Guarantee.*`;

        return res.status(200).json({
          success: true,
          mode: "live-order-tracking",
          reply,
          orderData: {
            orderNumber: foundOrder.orderNumber,
            status: orderStatus,
            customerName: foundOrder.customer?.name,
            totalAmount: foundOrder.totalAmount,
            city: foundOrder.customer?.city,
            trackingNumber: foundOrder.trackingNumber,
            items: foundOrder.items || [],
          },
          quickReplies: [
            "Track on Courier Portal",
            "7-Day Return Policy?",
            "Chat on WhatsApp Helpline",
          ],
        });
      } else {
        const notFoundOrder = urdu
          ? `🔍 **Order Status: #${orderId}**\n\nMaaf kijiye! Order ID **#${orderId}** hamare record me nahi mila.\n\n• Barah-e-karam apna Order Number check karein (jo aapko SMS ya Confirmation Email par mila tha).\n• Agar aapne abhi order place kiya hai to fori confirmation ke liye direct WhatsApp **${settings.whatsappNumber}** par rabta karein!`
          : `🔍 **Order Status: #${orderId}**\n\nSorry, we could not find Order **#${orderId}** in our active records.\n\n• Please verify your Order Number from your confirmation email or SMS.\n• Need instant help? Message our support team on WhatsApp at **${settings.whatsappNumber}**.`;

        return res.status(200).json({
          success: true,
          mode: "live-order-tracking",
          reply: notFoundOrder,
          orderData: null,
          quickReplies: [
            "Track another order",
            "7-Day Return Policy?",
            "Chat on WhatsApp Helpline",
          ],
        });
      }
    }

    // =========================================================================
    // HEAVY FEATURE 2: LIVE SUPPORT TICKET TRACKING IN AI CHAT
    // =========================================================================
    const ticketMatch = rawMessage.match(/\b(SUP[-_]?\d{4,8}[-_]?[A-Z0-9]{3,6})\b/i);
    if (ticketMatch && mysqlModule && mysqlModule.mysqlGetInquiry) {
      const ticketNum = ticketMatch[1].toUpperCase();
      const inq = await mysqlModule.mysqlGetInquiry(ticketNum);
      if (inq) {
        const inqStatus = String(inq.status || "new").toUpperCase();
        const reply = urdu
          ? `🎫 **Live Support Ticket: #${inq.ticketNumber}**\n\n• **Department:** ${inq.category || "General Support"}\n• **Status:** **${inqStatus}**\n• **Customer Name:** ${inq.name || "Customer"}\n• **Your Question:** "${inq.message}"\n\n${
              inq.adminReply
                ? `💬 **Official Store Response:**\n"${inq.adminReply}"\n\n*(Replied on: ${new Date(inq.updatedAt || inq.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })})*`
                : `⏳ *Hamari store team aapka message review kar rahi hai. Jaise hi store manager jawab dega, aapko Email & WhatsApp par notification bhej di jayegi.*`
            }`
          : `🎫 **Live Support Ticket: #${inq.ticketNumber}**\n\n• **Category:** ${inq.category || "General Support"}\n• **Status:** **${inqStatus}**\n• **Customer:** ${inq.name || "Customer"}\n• **Message:** "${inq.message}"\n\n${
              inq.adminReply
                ? `💬 **Official Store Reply:**\n"${inq.adminReply}"`
                : `⏳ *Our support team is reviewing your ticket and will reply shortly to your email and WhatsApp.*`
            }`;

        return res.status(200).json({
          success: true,
          mode: "live-ticket-tracking",
          reply,
          ticketData: inq,
          quickReplies: [
            "Contact WhatsApp Hotline",
            "7-Day Return Policy?",
            "Show Best Deals",
          ],
        });
      } else {
        const notFoundTicket = urdu
          ? `🔍 **Support Ticket Status: #${ticketNum}**\n\nTicket ID **#${ticketNum}** record me nahi mila.\n\n• Barah-e-karam apna Ticket ID check karein (misal: \`SUP-20261123-XXXX\`).\n• Aap Contact page par **"Check Ticket Reply"** box se bhi check kar sakte hain ya direct WhatsApp **${settings.whatsappNumber}** par rabta karein!`
          : `🔍 **Support Ticket Status: #${ticketNum}**\n\nTicket ID **#${ticketNum}** was not found in our records.\n\n• Please verify your Ticket ID from your confirmation screen.\n• Or reach out directly to our support team on WhatsApp at **${settings.whatsappNumber}**.`;

        return res.status(200).json({
          success: true,
          mode: "live-ticket-tracking",
          reply: notFoundTicket,
          ticketData: null,
          quickReplies: [
            "Contact WhatsApp Hotline",
            "7-Day Return Policy?",
            "Show Best Deals",
          ],
        });
      }
    }

    const parsedBudget = extractBudget(rawMessage);
    const minBudget = parsedBudget.minBudget;
    const maxBudget = explicitBudget || parsedBudget.maxBudget;

    // 2. Check greetings, catalog browsing, price queries & product matches
    const asksGreeting =
      /^(hi|hello|hey|hlo|salam|assalam|assalamualaikum|aoa|asalam|good morning|good afternoon|good evening|start|help)\b/.test(
        lower
      ) && lower.length < 35;

    const asksCheapest =
      /(cheap|cheapest|sasta|sasti|low price|lowest|kam qimat|best deal|under budget|affordable|budget friendly)/.test(
        lower
      );

    const asksExpensiveOrBest =
      /(best product|top product|featured|popular|trending|new arrival|premium|luxury|expensive|recommend|suggest|bestseller|best seller)/.test(
        lower
      );

    const asksAllProducts =
      /(all product|sab product|kya kya|show product|catalog|store items|kya milta|list|products|items|product|cheez|shopping|store|buy|price|prices|qimat|rate|rates|budget|cost|detail|details|spec|specs|specification)/.test(
        lower
      );

    // Score products against query
    const scored = products
      .map((p) => ({
        product: p,
        score: scoreProduct(p, lower),
        effectivePrice: getEffectivePrice(p),
      }))
      .sort((a, b) => b.score - a.score || a.effectivePrice - b.effectivePrice);

    const hasKeywordMatch = scored.some((item) => item.score > 0);
    const kbMatch = matchStoreKnowledgeBase(lower, settings, urdu);

    const isStoreRelated =
      asksGreeting ||
      asksCheapest ||
      asksExpensiveOrBest ||
      asksAllProducts ||
      hasKeywordMatch ||
      maxBudget !== null ||
      minBudget !== null ||
      kbMatch !== null;

    // 3. STRICT UNRELATED QUERY GUARDRAIL (Shows ONLY one clean fixed store-only message!)
    if (!isStoreRelated) {
      const unrelatedMessage = urdu
        ? `⚠️ Maaf kijiye! Main sirf **${settings.storeName}** ke products, prices, budget recommendations, orders, delivery aur ${settings.returnPolicyDays}-day return policy ke mutaliq madad kar sakta hun.\n\nBarah-e-karam store se related koi sawal poochein ya direct WhatsApp **${settings.whatsappNumber}** par rabta karein.`
        : `⚠️ Sorry! I can only answer questions related to **${settings.storeName}** products, prices, budget recommendations, orders, shipping, and our ${settings.returnPolicyDays}-day return policy.\n\nPlease ask a store-related question or contact us on WhatsApp at **${settings.whatsappNumber}**.`;

      return res.status(200).json({
        success: true,
        mode: "store-guardrail",
        isUnrelated: true,
        usingLiveDB,
        reply: unrelatedMessage,
        detectedBudget: { minBudget: null, maxBudget: null },
        products: [],
        quickReplies: [
          "Best products under Rs. 5,000",
          "Watches under Rs. 10,000",
          "7-Day Return Policy?",
          "Delivery & COD charges?",
        ],
      });
    }

    // 4. Filter product candidates when relevant
    let candidates = hasKeywordMatch
      ? scored.filter((item) => item.score > 0)
      : [...scored];

    let budgetMatched = candidates;
    let budgetNote = "";

    if (maxBudget !== null || minBudget !== null) {
      budgetMatched = candidates.filter((item) => {
        if (minBudget !== null && item.effectivePrice < minBudget) return false;
        if (maxBudget !== null && item.effectivePrice > maxBudget) return false;
        return true;
      });

      if (budgetMatched.length === 0) {
        const target = maxBudget || minBudget;
        budgetMatched = [...candidates]
          .sort(
            (a, b) =>
              Math.abs(a.effectivePrice - target) -
              Math.abs(b.effectivePrice - target)
          )
          .slice(0, 2);
        budgetNote = "closest";
      } else {
        budgetMatched.sort(
          (a, b) => b.score - a.score || a.effectivePrice - b.effectivePrice
        );
      }
    } else if (asksCheapest) {
      budgetMatched = [...candidates].sort(
        (a, b) => a.effectivePrice - b.effectivePrice
      );
    }

    const shouldAttachProducts =
      !asksGreeting &&
      (hasKeywordMatch ||
        maxBudget !== null ||
        minBudget !== null ||
        asksCheapest ||
        asksExpensiveOrBest ||
        (asksAllProducts && !kbMatch));

    const recommendedCards = shouldAttachProducts
      ? budgetMatched.slice(0, 3).map((item) => serializeProductCard(item.product))
      : [];

    // 5. Try optional Gemini AI if API key exists in .env
    const geminiText = await tryGeminiReply({
      message: rawMessage,
      products,
      matchedProducts: recommendedCards,
      settings,
      budget: { minBudget, maxBudget },
      urdu,
    });

    if (geminiText) {
      return res.status(200).json({
        success: true,
        mode: "gemini-ai",
        isUnrelated: false,
        usingLiveDB,
        reply: geminiText,
        detectedBudget: { minBudget, maxBudget },
        products: recommendedCards,
        quickReplies: [
          "Best under Rs. 5,000",
          "Watches under Rs. 10,000",
          "7-Day Return Policy?",
          "Delivery & COD charges?",
        ],
      });
    }

    // 6. Highly Professional Store Concierge Response Builder
    let reply = "";
    let quickReplies = [
      "Best items under Rs. 5,000",
      "Watches under Rs. 10,000",
      "7-Day Return Policy?",
      "Delivery & COD charges?",
    ];

    // HEAVY FEATURE 3: SIDE-BY-SIDE PRODUCT COMPARISON
    const asksComparison = /(compare|comparison|farq|dono me|which is better|kisme kya|vs|versus)/i.test(lower);
    if (asksComparison && recommendedCards.length >= 2) {
      const p1 = recommendedCards[0];
      const p2 = recommendedCards[1];
      reply = urdu
        ? `⚖️ **Side-by-Side Product Comparison:**\n\n1. **${p1.title}**\n   • **Price:** Rs. ${p1.effectivePrice.toLocaleString()} ${p1.salePrice ? `(Discounted from Rs. ${Number(p1.price).toLocaleString()})` : ""}\n   • **Category:** ${p1.category || "General"}\n   • **Rating:** ⭐ ${p1.rating || 4.8}/5\n   • **Description:** ${p1.shortDescription || "Premium luxury item"}\n\n2. **${p2.title}**\n   • **Price:** Rs. ${p2.effectivePrice.toLocaleString()} ${p2.salePrice ? `(Discounted from Rs. ${Number(p2.price).toLocaleString()})` : ""}\n   • **Category:** ${p2.category || "General"}\n   • **Rating:** ⭐ ${p2.rating || 4.8}/5\n   • **Description:** ${p2.shortDescription || "Premium luxury item"}\n\n💡 **Faisla:** Dono products high quality hain aur **7-Day Doorstep Money-Back Guarantee** ke teht cover hain!`
        : `⚖️ **Side-by-Side Product Comparison:**\n\n1. **${p1.title}**\n   • **Price:** Rs. ${p1.effectivePrice.toLocaleString()}\n   • **Category:** ${p1.category || "General"}\n   • **Rating:** ⭐ ${p1.rating || 4.8}/5\n   • **Details:** ${p1.shortDescription || "Premium build"}\n\n2. **${p2.title}**\n   • **Price:** Rs. ${p2.effectivePrice.toLocaleString()}\n   • **Category:** ${p2.category || "General"}\n   • **Rating:** ⭐ ${p2.rating || 4.8}/5\n   • **Details:** ${p2.shortDescription || "Premium build"}\n\nBoth products are backed by nationwide Cash on Delivery and 7-day doorstep return!`;

      quickReplies = [
        "Cash on Delivery details?",
        "Delivery time in Pakistan?",
        "WhatsApp Live Support",
      ];
    } else if (asksGreeting) {
      reply = urdu
        ? `Assalam-o-Alaikum! 👋 Main **${settings.storeName} Official AI Shopping & Support Concierge** hun.\n\nAap mujh se store ke kisi bhi product, budget range, live specs, delivery time, Cash on Delivery, aur 7-day return policy ke mutaliq tafseelat le sakte hain.\n\n💡 **Misal:**\n• *"10000 k andar watch dikhao"*\n• *"5000 budget hoodie"*\n• *"Delivery charges aur COD rules kya hain?"*`
        : `Welcome to **${settings.storeName}**! 👋 I am your dedicated **AI Shopping & Support Concierge**.\n\nFeel free to ask about our curated products, budget recommendations, sizing details, nationwide Cash on Delivery, and our **${settings.returnPolicyDays}-Day Return Guarantee**.\n\n💡 **Examples:**\n• *"Show watches under Rs. 10,000"*\n• *"Best hoodie under 5k"*\n• *"How does COD delivery work?"*`;
    } else if (maxBudget !== null || minBudget !== null) {
      const budgetLabel =
        minBudget && maxBudget
          ? `${formatRs(minBudget)} – ${formatRs(maxBudget)}`
          : maxBudget
          ? `${formatRs(maxBudget)}`
          : `${formatRs(minBudget)}+`;

      if (budgetNote === "closest") {
        const closestItem = recommendedCards[0];
        reply = urdu
          ? `Aap ke matlooba **${budgetLabel}** budget ke andar is waqt exact item stock mein nahi hai, lekin is range ke sab se qareeb hamara premium **${closestItem.title}** (${formatRs(closestItem.effectivePrice)}) dastiyab hai! 👇\n\n🎯 **Khusoosiyat:**\n• ${closestItem.shortDescription}\n• Delivery: Pure Pakistan mein **2–4 din** with Cash on Delivery.\n• Guarantee: **${settings.returnPolicyDays}-Day Money Back Guarantee**.\n\nAgar aap chahein ke hum **${budgetLabel}** ke andar koi item khas taur par arrange karein, to card par **"Ask Store"** click karein ya WhatsApp **${settings.whatsappNumber}** par rabta karein!`
          : `We do not currently have an exact catalog item strictly under **${budgetLabel}**, but our closest premium match is the **${closestItem.title}** starting at **${formatRs(closestItem.effectivePrice)}**! 👇\n\n🎯 **Highlights:**\n• ${closestItem.shortDescription}\n• Shipping: **2–4 business days** nationwide via tracked COD.\n• Protection: **${settings.returnPolicyDays}-Day Return & Refund Guarantee**.\n\nWant us to source an item specifically within **${budgetLabel}**? Click **"Ask Store"** on the card or message our team on WhatsApp (**${settings.whatsappNumber}**)!`;
      } else {
        const formattedItems = recommendedCards.map((p, i) => {
          const savings =
            p.discountPercent > 0
              ? ` *(Bachat: ${formatRs(p.price - p.effectivePrice)} — ${p.discountPercent}% OFF)*`
              : "";
          const specInfo = p.specifications?.[0]
            ? `\n   • Key Spec: ${p.specifications[0].title}: ${p.specifications[0].value}`
            : "";
          return `${i + 1}. **${p.title}**\n   • Price: **${formatRs(p.effectivePrice)}**${savings}${specInfo}`;
        });

        reply = urdu
          ? `🎯 **Aap ke ${budgetLabel} Budget Ke Mutabiq Top Recommendations:**\n\n${formattedItems.join("\n\n")}\n\n🛡️ **Store Guarantees:**\n• **${settings.returnPolicyDays}-Day Money Back & Size Exchange Guarantee**.\n• Pure Pakistan mein **Cash on Delivery (COD)** dastiyab hai (2–4 din mein delivery).\n• Kisi bhi card par **"Add to Cart"** click karke foran order kar sakte hain!`
          : `🎯 **Top Curated Recommendations for Your ${budgetLabel} Budget:**\n\n${formattedItems.join("\n\n")}\n\n🛡️ **EcoStore Assurances:**\n• Backed by our **${settings.returnPolicyDays}-Day Return & Exchange Guarantee**.\n• Nationwide **Cash on Delivery (COD)** with 2–4 business days delivery.\n• Click **"Add to Cart"** on any card below to proceed to checkout!`;
      }

      quickReplies = [
        "Under Rs. 5,000 deals",
        "Under Rs. 12,000 options",
        "Delivery charges?",
        "7-Day Return Policy?",
      ];
    } else if (kbMatch && !hasKeywordMatch) {
      reply = kbMatch.reply;
      quickReplies = kbMatch.quickReplies || quickReplies;
    } else {
      const top = recommendedCards[0];
      const detailsList = recommendedCards.map((p) => {
        const variantsText = (p.variants || [])
          .map((v) => `${v.name}: ${v.options.slice(0, 3).join(", ")}`)
          .join(" | ");
        const specSummary = p.specifications?.[0]
          ? ` — ${p.specifications[0].title}: ${p.specifications[0].value}`
          : "";
        return `• **${p.title}** — **${formatRs(p.effectivePrice)}**${
          variantsText ? ` (${variantsText})` : ""
        }${specSummary}`;
      });

      const extraKb = kbMatch ? `\n\n${kbMatch.reply}` : "";

      reply = urdu
        ? `🛍️ **EcoStore Matching Products & Live Pricing:**\n\n${detailsList.join("\n\n")}\n\n💡 **Tip:** Agar aap apna exact **budget** batayein (jaise *"5000 tak"* ya *"12000 budget"*), to main aapke liye best value options filter kar dunga!${extraKb}`
        : `🛍️ **EcoStore Matching Catalog Items & Live Details:**\n\n${detailsList.join("\n\n")}\n\n💡 **Tip:** Share your exact **target budget** (e.g., *"under Rs. 10,000"*) for tailored value recommendations! Top choice: **${top?.title}** at **${formatRs(top?.effectivePrice)}**.${extraKb}`;
    }

    return res.status(200).json({
      success: true,
      mode: "smart-store-ai",
      isUnrelated: false,
      usingLiveDB,
      reply,
      detectedBudget: { minBudget, maxBudget },
      products: recommendedCards,
      quickReplies,
    });
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return res.status(500).json({
      success: false,
      message: "AI Assistant encountered a temporary issue. Please try again.",
    });
  }
};

module.exports = {
  chatWithStoreAI,
};
