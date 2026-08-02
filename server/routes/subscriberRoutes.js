const express = require("express");

const router = express.Router();

const {

    subscribe,

    getSubscribers

} = require("../controllers/subscriberController");

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

router.post("/", subscribe);

router.get("/", protect, isAdmin, getSubscribers);

module.exports = router;