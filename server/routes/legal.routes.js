const express = require("express");
const { 
  searchLegalKnowledge, 
  getSearchHistory,
  getSearchDetails
} = require("../controllers/legal.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Legal knowledge search routes
router.post("/search", searchLegalKnowledge);
router.get("/history", getSearchHistory);
router.get("/history/:id", getSearchDetails);

module.exports = router;