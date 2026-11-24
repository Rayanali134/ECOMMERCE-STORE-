const express = require("express");
const router = express.Router();

const {
    createPackage,
    getPublicPackages,
    getAllPackages,
    getPackageById,
    updatePackage,
    togglePackageStatus,
    deletePackage
} = require("../controllers/packageController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

// ========================================
// PUBLIC ROUTES
// ========================================

// Website par active packages
router.get("/public", getPublicPackages);

// Public single package view
router.get("/:id", getPackageById);

// ========================================
// ADMIN ONLY ROUTES
// ========================================

// Get all packages
router.get("/", protect, adminOnly, getAllPackages);

// Create package
router.post("/", protect, adminOnly, createPackage);

// Update package
router.put("/:id", protect, adminOnly, updatePackage);

// Toggle package status (active/inactive)
router.patch("/:id/status", protect, adminOnly, togglePackageStatus);

// Delete package
router.delete("/:id", protect, adminOnly, deletePackage);

module.exports = router;
