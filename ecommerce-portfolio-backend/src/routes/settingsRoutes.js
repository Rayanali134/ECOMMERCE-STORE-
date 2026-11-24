const express = require("express");
const router = express.Router();

const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public: view store policies, return guarantee, FAQs, WhatsApp info
router.get("/", getSettings);

// Admin: update store details & return policy
router.put("/", protect, adminOnly, updateSettings);

module.exports = router;
