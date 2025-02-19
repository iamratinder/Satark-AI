const express = require("express");
const { 
  searchLegalKnowledge, 
  getSearchHistory,
  getSearchDetails
} = require("../controllers/legal.controller");
const { authUser } = require("../middlewares/auth.middleware");

const router = express.Router();

// Use authUser instead of authMiddleware
router.post("/search", authUser, searchLegalKnowledge);
router.get("/history", authUser, getSearchHistory);
router.get("/history/:id", authUser, getSearchDetails);

module.exports = router;