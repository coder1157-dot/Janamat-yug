const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  getMyProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

router.get("/me", protect, getMyProfile);

router.put("/profile", protect, updateProfile);

router.put("/change-password", protect, changePassword);

module.exports = router;