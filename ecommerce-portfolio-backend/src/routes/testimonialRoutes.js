const express = require("express");
const router = express.Router();

const {
    createTestimonial,
    getPublicTestimonials,
    getAllTestimonials,
    getTestimonialById,
    updateTestimonial,
    toggleTestimonialStatus,
    deleteTestimonial
} = require("../controllers/testimonialController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

// ========================================
// PUBLIC ROUTES
// ========================================

// Approved testimonials
router.get("/public", getPublicTestimonials);

// Customer testimonial submit karega
router.post("/", createTestimonial);

// ========================================
// ADMIN ONLY ROUTES
// ========================================

// Get all testimonials
router.get("/", protect, adminOnly, getAllTestimonials);

// Get single testimonial
router.get("/:id", protect, adminOnly, getTestimonialById);

// Approve, reject ya update testimonial
router.put("/:id", protect, adminOnly, updateTestimonial);

// Toggle testimonial approval status
router.patch("/:id/status", protect, adminOnly, toggleTestimonialStatus);

// Delete testimonial
router.delete("/:id", protect, adminOnly, deleteTestimonial);

module.exports = router;
