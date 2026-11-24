const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
} = require("../controllers/productController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get all products (with category, search, sort, pagination)
router.get("/", getProducts);

// Alias for public products if frontend requests /public
router.get("/public", getProducts);

// Get single product by ID or Slug
router.get("/:idOrSlug", getProductByIdOrSlug);

// ==========================================
// ADMIN DASHBOARD ONLY ROUTES
// ==========================================

// Create new product
router.post("/", protect, adminOnly, createProduct);

// Update product
router.put("/:id", protect, adminOnly, updateProduct);

// Toggle active status
router.patch("/:id/status", protect, adminOnly, toggleProductStatus);

// Delete product
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
