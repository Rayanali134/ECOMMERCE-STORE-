const express = require("express");
const router = express.Router();

const {
  createMessage,
  getMessages,
  getMessageById,
  updateMessage,
  markMessageRead,
  deleteMessage,
} = require("../controllers/messageController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Customer contact form
router.post("/", createMessage);

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================

// Get all messages
router.get("/", protect, adminOnly, getMessages);

// Get single message
router.get("/:id", protect, adminOnly, getMessageById);

// Update message
router.put("/:id", protect, adminOnly, updateMessage);

// Mark message read
router.patch("/:id/read", protect, adminOnly, markMessageRead);

// Delete message
router.delete("/:id", protect, adminOnly, deleteMessage);

module.exports = router;
