const mongoose = require("mongoose");

const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "EcoStore",
      trim: true,
    },
    storeTagline: {
      type: String,
      default: "Premium Online Store & Reliable Deliveries",
    },
    logo: {
      type: String,
      default: "",
    },
    contactEmail: {
      type: String,
      default: "rayanali0560@gmail.com",
    },
    contactPhone: {
      type: String,
      default: "+92 321 3633473",
    },
    whatsappNumber: {
      type: String,
      default: "+92 321 3633473", // Used for direct 1-click WhatsApp customer messaging
    },
    storeAddress: {
      type: String,
      default: "Lahore, Pakistan",
    },
    currency: {
      type: String,
      default: "PKR",
    },
    currencySymbol: {
      type: String,
      default: "Rs.",
    },
    shippingFee: {
      type: Number,
      default: 200,
    },
    freeShippingThreshold: {
      type: Number,
      default: 2500,
    },
    announcementBar: {
      enabled: { type: Boolean, default: true },
      text: {
        type: String,
        default: "⚡ Free Nationwide Delivery on All Orders Over Rs. 2,500!",
      },
      link: { type: String, default: "/products" },
    },
    returnPolicy: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: "7-Day Easy Return & Refund Policy" },
      returnDays: { type: Number, default: 7 },
      summary: {
        type: String,
        default:
          "Not satisfied with your order? Return or exchange it within 7 days hassle-free.",
      },
      detailedContent: {
        type: String,
        default:
          "We want you to love your purchase. If you receive a damaged, defective, or incorrect item, you can initiate a return or exchange within 7 days of delivery. Upon receipt and inspection of the item, we will issue a full refund to your original payment method or provide store credit.",
      },
      conditions: {
        type: [String],
        default: [
          "Item must be unworn, unused, and in its original packaging.",
          "All original tags, labels, and accessories must be attached.",
          "Proof of purchase (order confirmation or receipt) is required.",
          "Items damaged due to misuse or neglect are not eligible.",
        ],
      },
      nonReturnableItems: {
        type: [String],
        default: [
          "Customized or personalized products made on request.",
          "Final sale and clearance items.",
        ],
      },
    },
    shippingPolicy: {
      title: { type: String, default: "Fast Nationwide Shipping" },
      estimatedDays: { type: String, default: "2 to 4 Business Days" },
      details: {
        type: String,
        default:
          "Orders are dispatched within 24 hours on business days. Cash on delivery (COD) orders will be verified via phone/WhatsApp prior to shipping.",
      },
    },
    privacyPolicy: {
      type: String,
      default:
        "We respect your privacy and protect your personal information. Your contact and delivery details will never be sold or shared with unauthorized third parties.",
    },
    termsAndConditions: {
      type: String,
      default:
        "By placing an order on our store, you agree to our pricing, shipping terms, and return guidelines. We reserve the right to cancel suspicious or unverified orders.",
    },
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        category: { type: String, default: "General" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StoreSettings", storeSettingsSchema);
