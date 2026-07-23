 const express = require("express");

const router = express.Router();

// Controllers
const {
    getDashboard,
    getAllUsers,
    changeUserRole,
    deleteUser,

    getAllNewsAdmin,

    changeNewsStatus,

    toggleFeatured,

    toggleBreaking
} = require("../controllers/adminController");

// Middlewares
const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// Dashboard
router.get(
    "/dashboard",
    protect,
    isAdmin,
    getDashboard
);

// Users
router.get(
    "/users",
    protect,
    isAdmin,
    getAllUsers
);

// Change User Role
router.put(
    "/users/:id/role",
    protect,
    isAdmin,
    changeUserRole
);

// Delete User
router.delete(
    "/users/:id",
    protect,
    isAdmin,
    deleteUser
);

router.get(
    "/news",
    protect,
    isAdmin,
    getAllNewsAdmin
);

router.put(
    "/news/:id/status",
    protect,
    isAdmin,
    changeNewsStatus
);

router.put(
    "/news/:id/featured",
    protect,
    isAdmin,
    toggleFeatured
);

router.put(
    "/news/:id/breaking",
    protect,
    isAdmin,
    toggleBreaking
);

module.exports = router;