const express = require("express");
const router = express.Router();

const {
    createProject,
    getPublicProjects,
    getAllProjects,
    getProjectById,
    getProjectBySlug,
    updateProject,
    toggleProjectStatus,
    deleteProject
} = require("../controllers/projectController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

// ========================================
// PUBLIC ROUTES
// ========================================

// Published projects
router.get("/public", getPublicProjects);

// Project details by slug
router.get("/slug/:slug", getProjectBySlug);

// Project details by ID (needed by public ProjectDetails page)
router.get("/:id", getProjectById);

// ========================================
// ADMIN ONLY ROUTES
// ========================================

// Get all projects (admin pagination, filter, search)
router.get("/", protect, adminOnly, getAllProjects);

// Create project
router.post("/", protect, adminOnly, createProject);

// Update project
router.put("/:id", protect, adminOnly, updateProject);

// Toggle project published status
router.patch("/:id/status", protect, adminOnly, toggleProjectStatus);

// Delete project
router.delete("/:id", protect, adminOnly, deleteProject);

module.exports = router;
