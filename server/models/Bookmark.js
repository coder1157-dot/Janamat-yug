const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    news: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "News",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bookmark", bookmarkSchema);