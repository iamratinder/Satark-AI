const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/profile", authMiddleware.authUser, userController.getUserProfile);
router.post("/logout", authMiddleware.authUser, userController.logoutUser);

module.exports = router;