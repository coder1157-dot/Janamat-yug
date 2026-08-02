const express = require("express");
const router = express.Router();

const {
    getSettings,
    updateSettings
} = require("../controllers/settingController");

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

router.get("/", getSettings);

router.put("/", protect, isAdmin, updateSettings);

module.exports = router;