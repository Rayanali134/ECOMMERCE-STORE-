const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getOrderByIdOrNumber,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes: place order & view order tracking
router.post("/", createOrder);
router.get("/:idOrNumber", getOrderByIdOrNumber);

// Admin routes: manage store orders
router.get("/", protect, adminOnly, getAllOrders);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);
router.delete("/:id", protect, adminOnly, deleteOrder);

module.exports = router;
