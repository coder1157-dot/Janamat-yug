const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    shortDescription: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

     coverImage: {
    type: String,
    default: ""
},
  video: {
    type: String,
    default: ""
},

gallery: [{
    type: String
}],

videoThumbnail: {
    type: String,
    default: ""
},

location: {
    type: String,
    default: ""
},

tags: [{
    type: String
}],

publishedAt: {
    type: Date,
    default: Date.now
},
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    views: {
      type: Number,
      default: 0,
    },

    likes: {
    type: Number,
    default: 0
},

likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
}],



    isBreaking: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  
    metaTitle: {
    type: String
},

metaDescription: {
    type: String
},

keywords: [{
    type: String
}],

canonicalUrl: {
    type: String
},

ratings: [
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    rating: {
        type: Number,
        min: 1,
        max: 5
    }
}
],

averageRating: {
    type: Number,
    default: 0
}
  },
  {
    timestamps: true,
  }
  
);

module.exports = mongoose.model("News", newsSchema);