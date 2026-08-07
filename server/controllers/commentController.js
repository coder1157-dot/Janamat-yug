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

// ==============================
// Admin - Get All Comments
// ==============================

exports.getAllComments = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const comments = await Comment.find()
            .populate("user", "fullName email")
            .populate("news", "title")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Comment.countDocuments();

        res.status(200).json({
            success: true,
            total,
            page,
            pages: Math.ceil(total / limit),
            comments
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// ==============================
// Admin - Update Comment
// ==============================

exports.updateComment = async (req, res) => {

    try {

        const comment = await Comment.findByIdAndUpdate(

            req.params.id,

            {
                comment: req.body.comment
            },

            {
                new: true
            }

        );

        if (!comment) {

            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });

        }

        res.status(200).json({

            success: true,
            message: "Comment Updated",

            comment

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ==============================
// Admin - Delete Comment
// ==============================

exports.deleteComment = async (req, res) => {

    try {

        const comment = await Comment.findById(req.params.id);

        if (!comment) {

            return res.status(404).json({

                success: false,

                message: "Comment not found"

            });

        }

        await comment.deleteOne();

        res.status(200).json({

            success: true,

            message: "Comment Deleted Successfully"

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};