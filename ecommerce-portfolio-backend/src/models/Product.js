const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      default: function () {
        return "SKU-" + Date.now().toString(36).toUpperCase();
      },
    },
    shortDescription: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Short description cannot exceed 500 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product regular price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      default: null,
      min: [0, "Sale price cannot be negative"],
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, "Product stock quantity is required"],
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    categoryName: {
      type: String,
      default: "General",
    },
    images: {
      type: [String],
      default: [],
    },
    variants: [
      {
        name: { type: String, required: true }, // e.g., "Size", "Color"
        options: [{ type: String, required: true }], // e.g., ["S", "M", "L", "XL"]
      },
    ],
    specifications: [
      {
        title: { type: String, required: true }, // e.g., "Material", "Warranty"
        value: { type: String, required: true }, // e.g., "100% Cotton", "1 Year"
      },
    ],
    tags: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto slug generation and discount calculation
productSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") +
      "-" +
      Math.floor(1000 + Math.random() * 9000);
  }

  // Auto inStock status
  this.inStock = this.stock > 0;

  // Auto discount percent calculation
  if (this.salePrice && this.salePrice < this.price) {
    this.discountPercent = Math.round(
      ((this.price - this.salePrice) / this.price) * 100
    );
  } else {
    this.discountPercent = 0;
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);
