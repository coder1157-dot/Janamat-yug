const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    image: {
        type: String,
        default: ""
    },

    link: {
        type: String,
        default: ""
    },

    position: {
        type: String,
        enum: [
            "header",
            "sidebar",
            "footer",
            "between-news",
            "popup"
        ],
        required: true
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, {

    timestamps: true

});

module.exports = mongoose.model(
    "Advertisement",
    advertisementSchema
);