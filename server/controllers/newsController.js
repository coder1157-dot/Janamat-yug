  const News = require("../models/News");
const mongoose = require("mongoose"); 
const Category = require("../models/Category");
const slugify = require("slugify");
const Notification = require("../models/Notification");


 const createNews = async (req, res) => {
    try {
        console.log("========== CREATE NEWS ==========");
        console.log("BODY:", req.body);
        console.log("FILES:", req.files);

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

        // Required validation
        if (!title?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Headline is required"
            });
        }

        if (!content?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Article content is required"
            });
        }

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category is required"
            });
        }

        if (!shortDescription?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Excerpt is required"
            });
        }

        // ---------------- FILE PATHS ----------------

        const coverImage = req.files?.coverImage?.[0]
            ? `/uploads/news/images/${req.files.coverImage[0].filename}`
            : "";

        const gallery = req.files?.gallery
            ? req.files.gallery.map(
                file => `/uploads/news/gallery/${file.filename}`
            )
            : [];

        const video = req.files?.video?.[0]
            ? `/uploads/news/videos/${req.files.video[0].filename}`
            : "";

        const videoThumbnail = req.files?.videoThumbnail?.[0]
            ? `/uploads/news/thumbnails/${req.files.videoThumbnail[0].filename}`
            : "";

        // ---------------- SLUG ----------------

        let slug = slugify(title, {
            lower: true,
            strict: true,
            trim: true
        });

        // Hindi/unsupported slug fallback
        if (!slug) {
            slug = `news-${Date.now()}`;
        }

        // Prevent duplicate slug
        const existingSlug = await News.findOne({ slug });

        if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
        }

        // ---------------- TAGS ----------------

        const tagArray = Array.isArray(tags)
            ? tags
            : (tags || "")
                .split(",")
                .map(tag => tag.trim())
                .filter(Boolean);

        // ---------------- KEYWORDS ----------------

        const keywordArray = Array.isArray(keywords)
            ? keywords
            : (keywords || title)
                .split(",")
                .map(k => k.trim())
                .filter(Boolean);

        // ---------------- CREATE NEWS ----------------

        const news = await News.create({
            title: title.trim(),
            slug,

            shortDescription: shortDescription.trim(),
            content,

            category,
            location: location || "",

            tags: tagArray,

            coverImage,
            gallery,
            video,
            videoThumbnail,

            author: req.user.id,

            isBreaking: isBreaking === true || isBreaking === "true",
            isFeatured: isFeatured === true || isFeatured === "true",

            status: status === "draft" ? "draft" : "published",

            metaTitle: metaTitle?.trim() || title.trim(),

            metaDescription:
                metaDescription?.trim() ||
                shortDescription.trim(),

            keywords: keywordArray,

            canonicalUrl:
                canonicalUrl?.trim() ||
                `/news/${slug}`
        });

        console.log("NEWS CREATED:", news._id);

        // Breaking notification
        if (
            news.isBreaking &&
            news.status === "published"
        ) {
            try {
                await Notification.create({
                    title: "🚨 Breaking News",
                    message: news.title,
                    news: news._id
                });
            } catch (notificationError) {
                console.error(
                    "Notification error:",
                    notificationError.message
                );
            }
        }

        return res.status(201).json({
            success: true,
            message: "News Created Successfully",
            news
        });

    } catch (error) {

        console.error("========== CREATE NEWS ERROR ==========");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create news"
        });
    }
};
 
const getAllNews = async (req, res) => {
    try {

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Number(req.query.limit) || 10, 50);

        const skip = (page - 1) * limit;

        const [news, totalNews] = await Promise.all([

            News.find()
                .select(
                    "title slug shortDescription coverImage category author status publishedAt createdAt views likes isBreaking isFeatured"
                )
                .populate("category", "name slug")
                .populate("author", "fullName email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            News.countDocuments()

        ]);

        res.status(200).json({
            success: true,
            page,
            limit,
            totalNews,
            totalPages: Math.ceil(totalNews / limit),
            news
        });

    } catch (error) {

        console.error("GET ALL NEWS ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

 const getSingleNews = async (req, res) => {
    try {
        const value = req.params.slug;

        let news;

        // If value is MongoDB ObjectId → find by _id
        if (mongoose.Types.ObjectId.isValid(value)) {
            news = await News.findById(value)
                .populate("category")
                .populate("author", "fullName");
        } 
        // Otherwise → find by slug
        else {
            news = await News.findOne({ slug: value })
                .populate("category")
                .populate("author", "fullName");
        }

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News Not Found"
            });
        }

        // Increase views only when public article is opened
        news.views = (news.views || 0) + 1;
        await news.save();

        res.status(200).json({
            success: true,
            news
        });

    } catch (error) {
        console.error("Get Single News Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
  
const updateNews = async (req, res) => {
    try {

        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News Not Found"
            });
        }

        // -----------------------------
        // BASIC DATA
        // -----------------------------

        if (req.body.title !== undefined) {
            news.title = req.body.title;
        }

        if (req.body.shortDescription !== undefined) {
            news.shortDescription = req.body.shortDescription;
        }

        if (req.body.content !== undefined) {
            news.content = req.body.content;
        }

        if (req.body.category !== undefined) {
            news.category = req.body.category;
        }

        if (req.body.status !== undefined) {
            news.status = req.body.status;
        }

        if (req.body.tags !== undefined) {
            news.tags = Array.isArray(req.body.tags)
                ? req.body.tags
                : req.body.tags
                    .split(",")
                    .map(tag => tag.trim())
                    .filter(Boolean);
        }

        // -----------------------------
        // COVER IMAGE
        // -----------------------------

        if (req.files?.coverImage?.length) {

            const file = req.files.coverImage[0];

            news.coverImage = `/uploads/news/images/${file.filename}`;
        }

        // -----------------------------
        // GALLERY
        // -----------------------------

        if (req.files?.gallery?.length) {

            news.gallery = req.files.gallery.map(file =>
                `/uploads/news/images/${file.filename}`
            );

        }

        // -----------------------------
        // VIDEO
        // -----------------------------

        if (req.files?.video?.length) {

            const file = req.files.video[0];

            news.video = `/uploads/news/videos/${file.filename}`;
        }

        // -----------------------------
        // VIDEO THUMBNAIL
        // -----------------------------

        if (req.files?.videoThumbnail?.length) {

            const file = req.files.videoThumbnail[0];

            news.videoThumbnail =
                `/uploads/news/images/${file.filename}`;
        }

        // -----------------------------
        // SAVE
        // -----------------------------

        await news.save();

        res.status(200).json({
            success: true,
            message: "News Updated Successfully",
            news
        });

    } catch (error) {

        console.error("Update News Error:", error);

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
