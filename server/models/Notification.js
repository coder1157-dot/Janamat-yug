const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true
    },

    message:{
        type:String,
        required:true
    },

    news:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"News"
    },

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    isRead:{
        type:Boolean,
        default:false
    }

},{
    timestamps:true
});

module.exports = mongoose.model("Notification",notificationSchema);