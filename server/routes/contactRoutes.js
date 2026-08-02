const express = require("express");

const router = express.Router();

const {

    sendMessage,

    getMessages,

    changeStatus,

    deleteMessage,

    sendContact

} = require("../controllers/contactController");

const protect = require("../middleware/authMiddleware");

const isAdmin = require("../middleware/adminMiddleware");

router.post("/",sendMessage);

router.post("/contact",sendContact);

router.get("/",protect,isAdmin,getMessages);

router.put("/:id",protect,isAdmin,changeStatus);

router.delete("/:id",protect,isAdmin,deleteMessage);

module.exports = router;
