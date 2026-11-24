const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Order & Delivery",
        "Return / Exchange",
        "Product Request",
        "Bulk / Wholesale",
        "General Support",
      ],
      default: "Product Request",
    },
    orderNumber: {
      type: String,
      trim: true,
      default: "",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    productTitle: {
      type: String,
      trim: true,
      default: "",
    },
    subject: {
      type: String,
      trim: true,
      default: "",
    },
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    phone: {
      type: String,
      required: [true, "Phone or WhatsApp number is required"],
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
      default: "",
    },
    preferredContact: {
      type: String,
      enum: ["whatsapp", "phone", "email"],
      default: "whatsapp",
    },
    message: {
      type: String,
      required: [true, "Inquiry/Message content is required"],
      trim: true,
    },
    requestedQuantity: {
      type: Number,
      default: 1,
    },
    budget: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      enum: ["normal", "high", "urgent"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "contacted", "converted", "closed"],
      default: "new",
    },
    adminReply: {
      type: String,
      default: "",
    },
    repliedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
