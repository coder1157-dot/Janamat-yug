const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({

    siteName:{type:String,default:"Janamat Yug"},
    tagline:{type:String,default:"Voice of the Nation"},
    logo:{type:String,default:""},
    favicon:{type:String,default:""},

    email:{type:String,default:""},
    phone:{type:String,default:""},
    address:{type:String,default:""},

    facebook:{type:String,default:""},
    instagram:{type:String,default:""},
    twitter:{type:String,default:""},
    youtube:{type:String,default:""},

    footer:{type:String,default:"© Janamat Yug"},

},{
    timestamps:true
});

module.exports = mongoose.model("Setting",settingSchema);