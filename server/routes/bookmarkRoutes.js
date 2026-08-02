const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {

    addBookmark,

    getBookmarks,

    removeBookmark

} = require("../controllers/bookmarkController");

router.post("/", protect, addBookmark);

router.get("/", protect, getBookmarks);

router.delete("/:id", protect, removeBookmark);

module.exports = router;