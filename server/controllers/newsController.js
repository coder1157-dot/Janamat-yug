 const News = require("../models/News");
const Category = require("../models/Category");
const slugify = require("slugify");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

// Create News
const createNews = async (req, res) => {
    try {

         const {
    title,
    shortDescription,
    content,
    category,
    location,
    tags,
    isBreaking,
    isFeatured,
    status,
    metaTitle,
    metaDescription,
    keywords,
    canonicalUrl
} = req.body;

 const coverImage = req.files?.coverImage
    ? `/uploads/news/images/${req.files.coverImage[0].filename}`
    : "";
     
 const gallery = req.files?.gallery
    ? req.files.gallery.map(file => `/uploads/news/gallery/${file.filename}`)
    : [];

 const videoThumbnail = req.files?.videoThumbnail
    ? `/uploads/news/thumbnails/${req.files.videoThumbnail[0].filename}`
    : "";

 const video = req.files?.video
    ? `/uploads/news/videos/${req.files.video[0].filename}`
    : "";
 
const slug =
    slugify(title || "", {
        lower: true,
        strict: false,
        trim: true
    }) || `news-${Date.now()}`;

    
console.log(req.body);
console.log(req.files);

console.log("SLUG =>", slug);
console.log("SHORT =>", shortDescription);

        const news = await News.create({
            title,
slug,
shortDescription,
content,
category,
location,
tags,
coverImage,
video,
gallery,
videoThumbnail,

author: req.user.id,

isBreaking,
isFeatured,
status,

metaTitle: metaTitle || title,
metaDescription: metaDescription || shortDescription,
keywords: keywords || title.split(" "),
canonicalUrl: canonicalUrl || `/news/${slug}`
        });

         if (news.isBreaking === true && news.status === "published") {

    await Notification.create({

        title: "🚨 Breaking News",

        message: news.title,

        news: news._id

    });

}

        res.status(201).json({
            success: true,
            message: "News Created Successfully",
            news
        });

    }  catch (error) {

    console.error("CREATE NEWS ERROR:");
    console.error(error);

    res.status(500).json({
        success: false,
        message: error.message
    });

}
};

const getAllNews = async (req, res) => {

    try {

        const news = await News.find()
            .populate("category")
            .populate("author", "fullName email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: news.length,
            news
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const getSingleNews = async (req, res) => {

    try {

        const news = await News.findOne({
            slug: req.params.slug,
            status: "published"
        })
        .populate("category")
        .populate("author","fullName");

        if(!news){
            return res.status(404).json({
                success:false,
                message:"News Not Found"
            });
        }

        news.views += 1;

        await news.save();

        res.status(200).json({
            success:true,
            news
        });

    } catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};
 const updateNews = async (req, res) => {

    try {

        const news = await News.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News Not Found"
            });
        }

        // Auto Notification
        if (news.isBreaking === true && news.status === "published") {

            await Notification.create({

                title: "🚨 Breaking News",

                message: news.title,

                news: news._id

            });

        }

        res.status(200).json({
            success: true,
            message: "News Updated Successfully",
            news
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const deleteNews = async(req,res)=>{

    try{

        await News.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success:true,
            message:"News Deleted Successfully"
        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

const searchNews = async (req, res) => {
    try {

        const keyword = req.query.keyword || "";

        const news = await News.find({
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { shortDescription: { $regex: keyword, $options: "i" } },
                { content: { $regex: keyword, $options: "i" } }
            ]
        })
        .populate("category")
        .populate("author", "fullName");

        res.status(200).json({
            success: true,
            count: news.length,
            news
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getNewsPagination = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const totalNews = await News.countDocuments();

        const news = await News.find()
            .populate("category")
            .populate("author", "fullName")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({

            success: true,

            currentPage: page,

            totalPages: Math.ceil(totalNews / limit),

            totalNews,

            news

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getBreakingNews = async (req, res) => {

    try {

        const news = await News.find({
            isBreaking: true
        })
        .populate("category")
        .sort({ createdAt: -1 });

        res.status(200).json({

            success: true,

            news

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getFeaturedNews = async (req, res) => {

    try {

        const news = await News.find({
            isFeatured: true
        })
        .populate("category")
        .sort({ createdAt: -1 });

        res.status(200).json({

            success: true,

            news

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getTrendingNews = async (req, res) => {

    try {

        const news = await News.find()
            .sort({ views: -1 })
            .limit(10);

        res.status(200).json({

            success: true,

            news

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getLatestNews = async (req, res) => {

    try {

        const news = await News.find()
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({

            success: true,

            news

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

}; 
 
 const getNewsByCategory = async (req, res) => {
  try {
    const value = req.params.categoryId;

    let category;

    if (mongoose.Types.ObjectId.isValid(value)) {
      category = await Category.findById(value);
    } else {
      category = await Category.findOne({ slug: value });
    }

    if (!category) {
      return res.json({
        message: "Category not found"
      });
    }

    console.log("Category:", category);

    const news = await News.find({
      category: category._id
    });

    console.log("Found:", news.length);

    if (news.length > 0) {
      console.log("First News Category:", news[0].category);
      console.log("Category _id:", category._id);
      console.log(
        "Equal:",
        news[0].category.toString() === category._id.toString()
      );
    }

    return res.status(200).json({
    success: true,
    news
});

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

 const getRelatedNews = async (req, res) => {

    try {

        const { id } = req.params;

        const currentNews = await News.findById(id);

        if (!currentNews) {
            return res.status(404).json({
                success: false,
                message: "News Not Found"
            });
        }

        const relatedNews = await News.find({

            category: currentNews.category,

            _id: { $ne: currentNews._id },

            status: "published"

        })
        .limit(6)
        .populate("category")
        .populate("author", "fullName");

        res.status(200).json({

            success: true,

            count: relatedNews.length,

            news: relatedNews

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const likeNews = async (req, res) => {

    try {

        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News Not Found"
            });
        }

        const userId = req.user.id;

        const alreadyLiked = news.likedBy.includes(userId);

        if (alreadyLiked) {

            news.likedBy.pull(userId);
            news.likes--;

            await news.save();

            return res.status(200).json({
                success: true,
                message: "News Unliked",
                likes: news.likes
            });

        }

        news.likedBy.push(userId);
        news.likes++;

        await news.save();

        res.status(200).json({
            success: true,
            message: "News Liked",
            likes: news.likes
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const rateNews = async (req, res) => {

    try {

        const { rating } = req.body;

        const news = await News.findById(req.params.id);

        if (!news) {

            return res.status(404).json({
                success: false,
                message: "News Not Found"
            });

        }

        const existingRating = news.ratings.find(
            item => item.user.toString() === req.user.id
        );

        if (existingRating) {

            existingRating.rating = rating;

        } else {

            news.ratings.push({

                user: req.user.id,

                rating

            });

        }

        const total = news.ratings.reduce(
            (sum, item) => sum + item.rating,
            0
        );

        news.averageRating = total / news.ratings.length;

        await news.save();

        res.status(200).json({

            success: true,

            averageRating: news.averageRating,

            totalRatings: news.ratings.length

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {
    createNews,
    getAllNews,
    getSingleNews,
    updateNews,
    deleteNews,

    searchNews,
    getNewsPagination,
    getBreakingNews,
    getFeaturedNews,
    getTrendingNews,
    getLatestNews,
    getNewsByCategory,
    getRelatedNews,
    likeNews,
    rateNews
};