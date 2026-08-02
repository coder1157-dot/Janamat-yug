const Comment = require("../models/Comment");
const News = require("../models/News");


// Get Comments

exports.getComments = async (req,res)=>{

try{

const comments=await Comment.find({
news:req.params.id
})
.populate("user","fullName username name")
.sort({createdAt:-1});

res.status(200).json({
success:true,
comments
});

}
catch(err){

res.status(500).json({
success:false,
message:err.message
});

}

};


// Add Comment

exports.addComment=async(req,res)=>{

try{

const news=await News.findById(req.params.id);

if(!news){

return res.status(404).json({

success:false,
message:"News not found"

});

}

const comment=await Comment.create({

news:req.params.id,

user:req.user.id,

comment:req.body.comment

});

await comment.populate("user","fullName username name");

res.status(201).json({

success:true,

comment

});

}
catch(err){

res.status(500).json({

success:false,

message:err.message

});

}

};