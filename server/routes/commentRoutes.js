 const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const {

    getComments,
    addComment,

    getAllComments,
    updateComment,
    deleteComment

} = require("../controllers/commentController");


// ================= USER =================

router.get("/:id/comments", getComments);

router.post("/:id/comment", protect, addComment);


// ================= ADMIN =================

router.get("/", protect, isAdmin, getAllComments);

router.put("/:id", protect, isAdmin, updateComment);

router.delete("/:id", protect, isAdmin, deleteComment);


module.exports = router;