const express = require("express");
const router = express.Router();

const {
  createInquiry,
  getTicketStatus,
  getAllInquiries,
  getInquiryById,
  updateInquiry,
  markInquiryRead,
  deleteInquiry,
} = require("../controllers/inquiryController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// ========================================
// PUBLIC ROUTES
// ========================================

// Customer submits store contact / support ticket / product request
router.post("/", createInquiry);

// Customer checks support ticket status & store reply
router.get("/ticket/:ticketNumber", getTicketStatus);

// ========================================
// ADMIN ONLY ROUTES
// ========================================

// Get all inquiries / support tickets
router.get("/", protect, adminOnly, getAllInquiries);

// Get single inquiry
router.get("/:id", protect, adminOnly, getInquiryById);

// Update inquiry status / add admin reply
router.put("/:id", protect, adminOnly, updateInquiry);

// Mark inquiry as read
router.patch("/:id/read", protect, adminOnly, markInquiryRead);

// Delete inquiry
router.delete("/:id", protect, adminOnly, deleteInquiry);

module.exports = router;
