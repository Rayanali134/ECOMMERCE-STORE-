const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
    default: 1,
  },
  selectedVariant: {
    size: { type: String, default: "" },
    color: { type: String, default: "" },
  },
  total: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allows guest checkout without forced login
    },
    customer: {
      name: { type: String, required: [true, "Customer name is required"] },
      email: { type: String, required: [true, "Customer email is required"] },
      phone: { type: String, required: [true, "Customer phone number is required"] },
      whatsapp: { type: String, default: "" },
      address: { type: String, required: [true, "Shipping address is required"] },
      city: { type: String, required: [true, "City is required"] },
      postalCode: { type: String, default: "" },
      notes: { type: String, default: "" }, // Customer custom instruction / request message
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "whatsapp_order", "bank_transfer", "card"],
      default: "cash_on_delivery",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    trackingNumber: {
      type: String,
      default: "",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
