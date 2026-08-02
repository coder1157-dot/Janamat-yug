const express = require("express");
const router = express.Router();

const {
    createNotification,
    getNotifications,
    markAsRead,
    deleteNotification
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// Public/User
router.get("/", protect, getNotifications);

// Admin
router.post("/", protect, isAdmin, createNotification);
router.put("/:id", protect, markAsRead);
router.delete("/:id", protect, isAdmin, deleteNotification);

module.exports = router;