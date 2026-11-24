const express = require("express");
const router = express.Router();

const { chatWithStoreAI } = require("../controllers/aiController");

// Public AI Shopping & Support Assistant endpoint
router.post("/chat", chatWithStoreAI);

module.exports = router;
