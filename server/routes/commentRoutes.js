const express=require("express");

const router=express.Router();

const protect=require("../middleware/authMiddleware");

const {

getComments,

addComment

}=require("../controllers/commentController");

router.get("/:id/comments",getComments);

router.post("/:id/comment",protect,addComment);

module.exports=router;