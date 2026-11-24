const express = require("express");
const router = express.Router();

const {
    createService,
    getPublicServices,
    getAllServices,
    getServiceById,
    getServiceBySlug,
    updateService,
    deleteService
} = require("../controllers/serviceController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

// ========================================
// PUBLIC ROUTES
// ========================================

// Active services
router.get("/public", getPublicServices);

// Service details by slug
router.get("/slug/:slug", getServiceBySlug);

// Service details by id
router.get("/:id", getServiceById);

// ========================================
// ADMIN ONLY ROUTES
// ========================================

// Get all services
router.get("/", protect, adminOnly, getAllServices);

// Create service
router.post("/", protect, adminOnly, createService);

// Update service
router.put("/:id", protect, adminOnly, updateService);

// Delete service
router.delete("/:id", protect, adminOnly, deleteService);

module.exports = router;
